import express, { Request, Response } from 'express';
import { diff } from 'json-diff';
import {
  buildResponse,
  buildMetaData,
  MetaData,
  getPaginationQueryParams,
  defaultMetaData,
} from '@alcumus/response-utils';
import { EntityUtils } from '../query-builder/entity-utils';
import { pool } from '../../index';
import { ProcessEnv } from '@alcumus/express-app';
import {
  createDatabase,
  createTable,
} from '../query-builder/entity-query-builder';
const historyRouter = express.Router();

historyRouter.get('/:id', async (req: Request, res: Response) => {
  let metadata: MetaData = defaultMetaData;
  const { id } = req.params;
  const { 'x-entity': entity } = req.headers;
  const { page = 1, pageSize = 10, skip = 0 } = getPaginationQueryParams(
    req.query
  );

  if (entity?.length === 0 || entity === undefined) {
    res.status(400).json({ message: 'Bad Request, missing entity type' });
    return;
  }

  const databaseName =
    EntityUtils.getDatabaseNameByEntity(String(entity)) ||
    ProcessEnv.getValue('ENTITY_HISTORY_SERVICE_DEFAULT_DB');

  pool.getConnection((err: Error, conn) => {
    if (err) {
      console.error({ err });
    }

    conn.query(createDatabase(databaseName), (err) => {
      if (err) {
        res.status(400).json({ message: err });
        return;
      }

      conn.query(`USE ${databaseName}`, (err) => {
        if (err) {
          res.status(400).json({ message: err });
          return;
        }
        conn.query(createTable(), (error) => {
          if (error) throw error;
        });

        conn.query(
          `SELECT count(*) as numRows FROM ${databaseName}.history WHERE trackedEntityId = '${id}' AND entityType = '${entity?.toString()}'`,
          (err, rows) => {
            const count = rows[0].numRows;
            if (err) {
              res.status(400).json({ message: err });
              return;
            }

            if (count === 0) {
              res
                .status(404)
                .json({ message: `Entity with ${id} doesn't exist` });
              return;
            }

            conn.query(
              `SELECT * FROM ${databaseName}.history WHERE trackedEntityId = '${id}' AND entityType = '${entity?.toString()}' LIMIT ${skip},${pageSize}`,
              (err, innerrows) => {
                if (err) {
                  res.status(400).json({ message: err });
                  return;
                }

                /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
                const { type, data, ...result } = innerrows;
                const resultArray = Object.values(result);
                metadata = buildMetaData({
                  count,
                  page,
                  pageSize,
                  currentPageSize: innerrows.length,
                });
                res
                  .status(200)
                  .json(buildResponse({ response: resultArray, metadata }));
              }
            );
          }
        );
      });
    });

    pool.releaseConnection(conn);
  });
});

historyRouter.post('/:id', async (req: Request, res: Response) => {
  const { updatedDocument, previousDocument = {}, ...rest } = req.body;
  const remainingFields = { ...rest };
  const { id } = req.params;
  const { 'x-entity': entity = 'none' } = req.headers;

  if (entity?.length === 0 || entity === undefined) {
    res.status(400).json({ message: 'Bad Request, missing entity type' });
    return;
  }

  if (EntityUtils.isEmpty(updatedDocument)) {
    res
      .status(400)
      .json({ message: 'Bad Request, updatedDocument cannot be empty' });
    return;
  }

  if (
    EntityUtils.isEmpty(previousDocument) &&
    remainingFields.operation !== 'create'
  ) {
    res.status(400).json({
      message:
        'Bad Request, previousDocument cannot be empty for non create operations',
    });
    return;
  }

  const databaseName = EntityUtils.getDatabaseNameByEntity(String(entity));
  let count = 0;
  let rows = [];
  pool.getConnection(async (err: Error, conn) => {
    if (err) {
      console.error({ err });
    }

    conn.query(`${createDatabase} ${databaseName}`, function (error) {
      if (error) throw error;
      conn.query(`USE ${databaseName}`, function (error) {
        if (error) throw error;

        conn.query(createTable(), (error) => {
          if (error) throw error;

          conn.query(
            `SELECT * FROM ${databaseName}.history WHERE trackedEntityId = '${id}' AND entityType = '${entity?.toString()}' ORDER BY _createdOn DESC LIMIT 1`,
            (err, entityRows) => {
              if (err) {
                res.status(400).json({ message: err });
                return;
              }
              count = entityRows.length;
              rows = entityRows;

              if (remainingFields.operation === 'create' && count > 0) {
                res.status(400).json({
                  message: `Entity with id: ${id} already exists, cannot insert create history record`,
                });
              } else if (
                // revisit in case of migrations in the future
                (remainingFields.operation === 'update' ||
                  remainingFields.operation === 'delete') &&
                count === 0
              ) {
                res.status(400).json({
                  message: `Entity with id: ${id} doesn't exist, cannot perform operation ${remainingFields.operation} on history record`,
                });
              } else {
                let finalObject = {
                  ...remainingFields,
                  changedBy: updatedDocument._modifiedBy,
                  changedOn: updatedDocument._modifiedOn,
                  trackedEntityId: id,
                };

                const d = new Date(finalObject.changedOn);
                const mySqlTimestamp = new Date(
                  d.getFullYear(),
                  d.getMonth(),
                  d.getDate(),
                  d.getHours(),
                  d.getMinutes(),
                  d.getSeconds(),
                  d.getMilliseconds()
                )
                  .toISOString()
                  .slice(0, 19)
                  .replace('T', ' ');

                if (remainingFields.operation === 'create' && updatedDocument) {
                  finalObject = {
                    ...finalObject,
                    version: 1,
                    changedFields: JSON.stringify(
                      EntityUtils.mapChangedFieldsArray(updatedDocument, true)
                    ),
                  };
                } else {
                  const changedFieldsObj: object = diff(
                    previousDocument,
                    updatedDocument
                  );
                  finalObject = {
                    ...finalObject,
                    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
                    // @ts-ignore
                    version: Number(rows[0].version) + 1,
                    changedFields: JSON.stringify(
                      EntityUtils.mapChangedFieldsArray(changedFieldsObj)
                    ),
                  };

                  if (
                    EntityUtils.mapChangedFieldsArray(changedFieldsObj)
                      .length === 0
                  ) {
                    res.status(400).json({ message: 'Nothing has changed' });
                    return;
                  }
                }

                conn.query(
                  `INSERT INTO ${databaseName}.history (trackedEntityId, changedBy, changedOn, version, operation, entityType, changedFields) VALUES ('${id}','${finalObject.changedBy}','${mySqlTimestamp}', '${finalObject.version}', '${finalObject.operation}','${finalObject.entityType}','${finalObject.changedFields}')`,
                  (err, innerrows) => {
                    if (err) {
                      res.status(400).json({ message: err });
                      return;
                    }
                    if (innerrows.affectedRows === 1) {
                      conn.query(
                        `SELECT * FROM ${databaseName}.history WHERE trackedEntityId = '${id}' AND entityType = '${entity?.toString()}' ORDER BY _createdOn DESC LIMIT 1`,
                        (err, entityRows) => {
                          if (err) {
                            res.status(400).json({ message: err });
                            return;
                          }
                          res.status(201).json(entityRows[0]);
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        });
      });
    });

    pool.releaseConnection(conn);
  });
});

export default historyRouter;
