import mongoose from 'mongoose';
import highFiveTypeModel, {
  HighFiveTypeDocument,
} from '../../../src/v1/models/highFiveType';
import request, { Response } from 'supertest';
import app from '../../../src/app';
import { ENDPOINTS, HIGH_FIVE_SERVICE_DB_URL } from '../../../src/constants';

const authToken = 'testToken';
describe('Integration test for high five types', () => {
  const idsArray: string[] = [];
  beforeAll(async () => {
    await mongoose.connect(HIGH_FIVE_SERVICE_DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    const testData = {
      name: 'Test Type 5',
    };
    const response = await highFiveTypeModel.create(testData);
    idsArray.push(response._id);
  });

  it('should create an object with name of test type 1', async () => {
    const testData = {
      name: 'Test Type 1',
    };

    const response: Response = await request(app)
      .post(ENDPOINTS.HIGH_FIVE_TYPES)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .set('Accept', 'application/json')
      .send(testData);

    expect(response.status).toBe(201);
    const result: HighFiveTypeDocument = response.body;
    idsArray.push(result._id);

    expect(result.name).toBe('Test Type 1');
  });

  it('should return an array of types with an element of just created', async () => {
    const response: Response = await request(app)
      .get(ENDPOINTS.HIGH_FIVE_TYPES)
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .auth(authToken, { type: 'bearer' });
    expect(response.status).toBe(200);
    expect(response.body.documents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: idsArray[0],
        }),
      ])
    );
  });

  it('should create a new type and delete it', async () => {
    const response0: Response = await request(app)
      .post(ENDPOINTS.HIGH_FIVE_TYPES)
      .send({ name: 'To be deleted' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .auth(authToken, { type: 'bearer' });

    const result: HighFiveTypeDocument = response0.body;
    idsArray.push(result._id);

    const response: Response = await request(app)
      .delete(`${ENDPOINTS.HIGH_FIVE_TYPES}/${result._id}`)
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .auth(authToken, { type: 'bearer' });

    expect(response.status).toBe(204);
  });

  it('return an error when deleting non-existing ID', async () => {
    const response: Response = await request(app)
      .delete(`${ENDPOINTS.HIGH_FIVE_TYPES}/asdewq`)
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .auth(authToken, { type: 'bearer' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'High Five Type not found' });
  });

  it('should return an object with certain ID', async () => {
    const response: Response = await request(app)
      .get(`${ENDPOINTS.HIGH_FIVE_TYPES}/${idsArray[0]}`)
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .auth(authToken, { type: 'bearer' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ _id: idsArray[0] })
    );
  });

  it('should return an error when adding duplicated type name', async () => {
    const testData = {
      name: 'Test Type 5',
    };

    const response: Response = await request(app)
      .post(ENDPOINTS.HIGH_FIVE_TYPES)
      .set('Accept', 'application/json')
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .auth(authToken, { type: 'bearer' })
      .send(testData);
    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({ message: 'ValidationError' })
    );
  });

  it('should add a new Type and update its name', async () => {
    const response1: Response = await request(app)
      .post(ENDPOINTS.HIGH_FIVE_TYPES)
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .auth(authToken, { type: 'bearer' })
      .send({ name: 'To be Updated Type Name' });

    const result: HighFiveTypeDocument = response1.body;
    result.name = 'new name';
    idsArray.push(result._id);
    response1.body.name = 'new name';

    const response2: Response = await request(app)
      .put(`${ENDPOINTS.HIGH_FIVE_TYPES}/${result._id}`)
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .auth(authToken, { type: 'bearer' })
      .send(result);
    expect(response2.status).toBe(200);
    expect(response2.body).toEqual(
      expect.objectContaining({ name: 'new name' })
    );
  });

  it('should return an error when updating duplicated type name', async () => {
    const response0: Response = await request(app)
      .post(ENDPOINTS.HIGH_FIVE_TYPES)
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .auth(authToken, { type: 'bearer' })
      .send({ name: 'Test6' });

    idsArray.push(response0.body._id);
    const response1: Response = await request(app)
      .post(ENDPOINTS.HIGH_FIVE_TYPES)
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .auth(authToken, { type: 'bearer' })
      .send({ name: 'To be Updated Type Name' });
    idsArray.push(response1.body._id);

    response1.body.name = 'Test6';

    const response2: Response = await request(app)
      .put(`${ENDPOINTS.HIGH_FIVE_TYPES}/${idsArray[idsArray.length - 1]}`)
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .auth(authToken, { type: 'bearer' })
      .send(response1.body);
    expect(response2.status).toBe(400);
    expect(response2.body).toEqual(
      expect.objectContaining({
        message: 'ValidationError',
        extraInfo: [
          {
            key: 'HighFiveType.submit.HighFiveTypeMustBeUnique',
            message: 'High Five Type must be unique',
          },
        ],
      })
    );
  });

  it('should return 404 when trying to get a deleted HighFiveType', async () => {
    const mockData = { name: 'new name 1' };

    const response: Response = await request(app)
      .post(ENDPOINTS.HIGH_FIVE_TYPES)
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .auth(authToken, { type: 'bearer' })
      .send(mockData);
    idsArray.push(response.body._id);

    await request(app)
      .delete(`${ENDPOINTS.HIGH_FIVE_TYPES}/${response.body._id}`)
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .auth(authToken, { type: 'bearer' });
    const response1: Response = await request(app)
      .get(`${ENDPOINTS.HIGH_FIVE_TYPES}/${response.body._id}`)
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .auth(authToken, { type: 'bearer' });
    expect(response1.status).toBe(404);
    expect(response1.body).toEqual({ message: 'High Five Type not found' });
  });

  it('should return an array of HighFiveTypes with non having _deleted === true', async () => {
    const mockData = [
      { name: 'new name 2' },
      { name: 'new name 3' },
      { name: 'new name 4' },
    ];

    mockData.forEach(async (type) => {
      const response: Response = await request(app)
        .post(ENDPOINTS.HIGH_FIVE_TYPES)
        .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
        .auth(authToken, { type: 'bearer' })
        .send(type);

      idsArray.push(response.body?._id);
    });

    const mockData2 = { name: 'new name 5' };

    const response: Response = await request(app)
      .post(ENDPOINTS.HIGH_FIVE_TYPES)
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .auth(authToken, { type: 'bearer' })
      .send(mockData2);
    idsArray.push(response.body._id);

    await request(app)
      .delete(`${ENDPOINTS.HIGH_FIVE_TYPES}/${response.body._id}`)
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .auth(authToken, { type: 'bearer' });
    const response0: Response = await request(app)
      .get(ENDPOINTS.HIGH_FIVE_TYPES)
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .auth(authToken, { type: 'bearer' });

    expect(response0.body.documents).toEqual(
      expect.arrayContaining([
        expect.not.objectContaining({
          _deleted: true,
        }),
      ])
    );
  });

  it('should return an array of HighFiveTypes with search', async () => {
    const mockBody = { ids: [idsArray[0], idsArray[1], 'foo bar'] };
    const response0: Response = await request(app)
      .post(`${ENDPOINTS.HIGH_FIVE_TYPES}/search`)
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .auth(authToken, { type: 'bearer' })
      .send(mockBody);

    expect(response0.body.documents).toEqual(
      expect.arrayContaining([
        expect.not.objectContaining({
          _id: 'foo bar',
        }),
      ])
    );

    expect(response0.body.documents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: idsArray[1],
        }),
      ])
    );
    expect(response0.body.documents.length).toEqual(2);
  });

  afterAll(async () => {
    await highFiveTypeModel.deleteMany({
      _id: {
        $in: idsArray,
      },
    });
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });
});
