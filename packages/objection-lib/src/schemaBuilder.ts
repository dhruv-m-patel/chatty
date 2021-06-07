import Uuid from 'uuid';

interface JsonSchema {
  [key: string]: object | string;
}

export const BaseKnexEntitySchema = {
  type: 'object',
  _id: {
    type: 'string',
    default: () => Uuid.v4(),
  },
  _createdOn: {
    type: 'string',
  },
  _createdBy: {
    type: 'string',
  },
  _modifiedBy: {
    type: 'string',
  },
  _modifiedOn: {
    type: 'date',
  },
};

export class JsonSchemaBuilder {
  private _schema: JsonSchema = BaseKnexEntitySchema;

  public static newBuilder(): JsonSchemaBuilder {
    return new JsonSchemaBuilder();
  }

  public withTenantId(
    tenantIdFieldName: string,
    required = true
  ): JsonSchemaBuilder {
    this._schema[tenantIdFieldName] = required
      ? {
          type: 'string',
        }
      : {
          type: ['string', 'null'],
          default: null,
        };
    return this;
  }

  public withCompanyId(required = true): JsonSchemaBuilder {
    return this.withTenantId('companyId', required);
  }

  public withSiteId(required = true): JsonSchemaBuilder {
    return this.withTenantId('siteId', required);
  }

  public withExternalId(): JsonSchemaBuilder {
    this._schema.externalId = {
      type: ['string', 'null'],
      default: null,
    };
    this._schema.externalSource = {
      type: ['string', 'null'],
      default: null,
    };
    return this;
  }

  public isSoftDeletable(): JsonSchemaBuilder {
    this._schema._deleted = {
      type: 'boolean',
    };
    this._schema._deletedOn = {
      type: ['date', 'null'],
      default: null,
    };
    return this;
  }

  public withMoreSchema(moreSchema: JsonSchema) {
    this._schema = {
      ...this._schema,
      ...moreSchema,
    };
    return this;
  }

  public build(): object {
    return this._schema;
  }
}
