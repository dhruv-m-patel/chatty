import mongoose from 'mongoose';
import highFiveModel, {
  HighFiveDocument,
} from '../../../src/v1/models/highFive';

import request, { Response } from 'supertest';
import app from '../../../src/app';
import { ENDPOINTS, HIGH_FIVE_SERVICE_DB_URL } from '../../../src/constants';
import highFiveTypeModel, {
  HighFiveTypeDocument,
} from '../../../src/v1/models/highFiveType';
import axios from 'axios';
import { post } from './axiosMock';

const authToken = 'something';

interface HighFiveInput {
  description: string;
  assignees: string[];
  types: string[];
}

let highFive: HighFiveInput;

async function postHighFive(highFive: any) {
  return await request(app)
    .post(ENDPOINTS.HIGH_FIVE)
    .auth(authToken, { type: 'bearer' })
    .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
    .set('Accept', 'application/json')
    .send(highFive);
}

async function putHighFive(highFive: any, result: any) {
  return await request(app)
    .put(`${ENDPOINTS.HIGH_FIVE}/${result._id}`)
    .set('Accept', 'application/json')
    .auth(authToken, { type: 'bearer' })
    .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
    .send(highFive);
}
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

mockedAxios.post.mockImplementation(post);

describe('Integration test for High Fives', () => {
  const idsArray: string[] = [];
  const hftIds: string[] = [];
  let hft1: HighFiveTypeDocument,
    hft2: HighFiveTypeDocument,
    hft3: HighFiveTypeDocument,
    hft4: HighFiveTypeDocument;
  beforeAll(async () => {
    await mongoose.connect(HIGH_FIVE_SERVICE_DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    hft1 = await highFiveTypeModel.create({ name: 'Type2' });
    hft2 = await highFiveTypeModel.create({ name: 'Type 1' });
    hft3 = await highFiveTypeModel.create({ name: 'Type 2' });
    hft4 = await highFiveTypeModel.create({ name: 'Type4' });
    highFive = {
      description: 'Test description 1',
      types: [hft1._id],
      assignees: ['User 1', 'user 2'],
    };

    hftIds.push(hft1._id);
    hftIds.push(hft2._id);
    hftIds.push(hft3._id);
    hftIds.push(hft4._id);
  });

  afterAll(() => jest.clearAllMocks());

  it('should create an HighFive with description of test description 1', async () => {
    const highFive: HighFiveInput = {
      description: 'Test description 1',
      types: [hft2._id, hft3._id],
      assignees: ['User 1', 'user 2'],
    };

    const response: Response = await postHighFive(highFive);

    expect(response.status).toBe(201);
    const result: HighFiveDocument = response.body;
    idsArray.push(result._id);

    expect(result.description).toBe('Test description 1');
  });

  it('should return an array of types with an element of just created', async () => {
    const highFive: HighFiveInput = {
      description: 'Test description 1',
      types: [hft2._id, hft3._id],
      assignees: ['User 1', 'user 2'],
    };
    const response0: Response = await postHighFive(highFive);
    const result: HighFiveDocument = response0.body;
    idsArray.push(result._id);
    const response: Response = await request(app)
      .get(ENDPOINTS.HIGH_FIVE)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==');
    expect(response.status).toBe(200);
    expect(response.body.documents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: result._id,
        }),
      ])
    );
  });

  it('should create a new highFive and delete it', async () => {
    const highFive: HighFiveInput = {
      description: 'Test description 1',
      types: [hft2._id, hft3._id],
      assignees: ['User 1', 'user 2'],
    };
    const response0: Response = await postHighFive(highFive);

    const result: HighFiveDocument = response0.body;
    idsArray.push(result._id);

    const response: Response = await request(app)
      .delete(`${ENDPOINTS.HIGH_FIVE}/${result._id}`)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==');

    expect(response.status).toBe(204);
  });

  it('return an error when deleting non-existing ID', async () => {
    const response: Response = await request(app)
      .delete(`${ENDPOINTS.HIGH_FIVE}/asdewq`)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'High Five not found' });
  });

  it('should return an object with certain ID', async () => {
    const highFive: HighFiveInput = {
      description: 'Test description 1',
      types: [hft2._id, hft3._id],
      assignees: ['User 1', 'user 2'],
    };
    const response0: Response = await postHighFive(highFive);

    const result: HighFiveDocument = response0.body;
    idsArray.push(result._id);
    const response: Response = await request(app)
      .get(`${ENDPOINTS.HIGH_FIVE}/${result._id}`)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({ _id: result._id }));
  });

  it('should return an error when no types provided', async () => {
    const highFive: HighFiveInput = {
      description: 'Test description 1',
      types: [],
      assignees: ['User 1', 'user 2'],
    };

    const response: Response = await postHighFive(highFive);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: {
        types: {
          key: 'highFive.submit.atLeastOneTypeMustExist',
          message: 'highFive.submit.atLeastOneTypeMustExist',
        },
      },
    });
  });

  it('should return an error when no types provided', async () => {
    const highFive = {
      description: 'Test description 1',
      assignees: ['User 1', 'user 2'],
    };

    const response: Response = await postHighFive(highFive);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "request.body should have required property 'types'",
    });
  });

  it('should return an error when no assignees provided', async () => {
    const highFive: HighFiveInput = {
      description: 'Test description 1',
      types: ['Type1'],
      assignees: [],
    };

    const response: Response = await postHighFive(highFive);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: {
        assignees: {
          key: 'highFive.submit.atLeastOneAssigneeMustExist',
          message: 'highFive.submit.atLeastOneAssigneeMustExist',
        },
      },
    });
  });

  it('should return an error when no assignees provided', async () => {
    const highFive = {
      description: 'Test description 1',
      types: ['Type1'],
    };

    const response: Response = await postHighFive(highFive);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "request.body should have required property 'assignees'",
    });
  });

  it('should return an error when no types provided on highFive update', async () => {
    const highFive2: HighFiveInput = {
      description: 'Test description 2',
      types: [],
      assignees: ['User 1', 'user 2'],
    };

    const response: Response = await postHighFive(highFive);
    const result: HighFiveDocument = response.body;
    idsArray.push(result._id);

    const response1: Response = await putHighFive(highFive2, result);
    expect(response1.status).toBe(400);
    expect(response1.body).toEqual(
      expect.objectContaining({
        errors: {
          types: {
            key: 'highFive.submit.atLeastOneTypeMustExist',
            message: 'highFive.submit.atLeastOneTypeMustExist',
          },
        },
      })
    );
  });

  it('should return an error when no types provided on highFive update', async () => {
    const highFive2 = {
      description: 'Test description 2',
      assignees: ['User 1', 'user 2'],
    };

    const response: Response = await postHighFive(highFive);
    const result: HighFiveDocument = response.body;
    idsArray.push(result._id);

    const response1: Response = await putHighFive(highFive2, result);
    expect(response1.status).toBe(400);
    expect(response1.body).toEqual({
      message: "request.body should have required property 'types'",
    });
  });

  it('should return 200 status code for valid types', async () => {
    await highFiveTypeModel.create({ name: 'Type 111' });
    await highFiveTypeModel.create({ name: 'Type 222' });
  });

  it('should return an error when no assignees provided on highFive update', async () => {
    const highFive2: HighFiveInput = {
      description: 'Test description 2',
      types: ['Type33'],
      assignees: [],
    };

    const response: Response = await postHighFive(highFive);
    const result: HighFiveDocument = response.body;
    idsArray.push(result._id);

    const response1: Response = await putHighFive(highFive2, result);
    expect(response1.status).toBe(400);
    expect(response1.body).toEqual({
      errors: {
        assignees: {
          key: 'highFive.submit.atLeastOneAssigneeMustExist',
          message: 'highFive.submit.atLeastOneAssigneeMustExist',
        },
      },
    });
  });

  it('should return an error when no assignees provided on highFive update', async () => {
    const highFive2 = {
      description: 'Test description 2',
      types: ['Type33'],
    };

    const response: Response = await postHighFive(highFive);
    const result: HighFiveDocument = response.body;
    idsArray.push(result._id);

    const response1: Response = await putHighFive(highFive2, result);
    expect(response1.status).toBe(400);
    expect(response1.body.message).toEqual(
      "request.body should have required property 'assignees'"
    );
  });

  it('should add a new HighFive and update its description', async () => {
    const highFive2: HighFiveInput = {
      description: 'Test description 2',
      types: [hft4._id],
      assignees: ['User 1', 'user 2'],
    };

    const response: Response = await postHighFive(highFive);
    const result: HighFiveDocument = response.body;
    idsArray.push(result._id);

    const response1: Response = await putHighFive(highFive2, result);
    expect(response1.status).toBe(200);
    expect(response1.body).toEqual(
      expect.objectContaining({ description: 'Test description 2' })
    );
  });
  it('should add a new HighFive and update its types', async () => {
    const highFive2: HighFiveInput = {
      description: 'Test description 1',
      types: [hft1._id, hft4._id],
      assignees: ['User 1', 'user 2'],
    };

    const response: Response = await postHighFive(highFive);
    const result: HighFiveDocument = response.body;
    idsArray.push(result._id);

    const response1: Response = await putHighFive(highFive2, result);
    expect(response1.status).toBe(200);
    expect(response1.body).toEqual(
      expect.objectContaining({ types: [hft1._id, hft4._id] })
    );
  });

  it('should add a new HighFive and update its assignees', async () => {
    const highFive2: HighFiveInput = {
      description: 'Test description 1',
      types: [hft1._id, hft4._id],
      assignees: ['user 3'],
    };

    const response: Response = await postHighFive(highFive);
    const result: HighFiveDocument = response.body;
    idsArray.push(result._id);

    const response1: Response = await putHighFive(highFive2, result);
    expect(response1.status).toBe(200);
    expect(response1.body).toEqual(
      expect.objectContaining({ assignees: ['user 3'] })
    );
  });

  it('should return 404 when trying to get a deleted HighFive', async () => {
    const highFive: HighFiveInput = {
      description: 'Test description 1',
      types: [hft2._id, hft3._id],
      assignees: ['User 1', 'user 2'],
    };
    const response0: Response = await postHighFive(highFive);

    const result: HighFiveDocument = response0.body;
    idsArray.push(result._id);

    await request(app)
      .delete(`${ENDPOINTS.HIGH_FIVE}/${result._id}`)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==');
    const response: Response = await request(app)
      .get(`${ENDPOINTS.HIGH_FIVE}/${result._id}`)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'High Five not found',
    });
  });

  it('should return 404 when trying to deleted a deleted HighFive', async () => {
    const highFive: HighFiveInput = {
      description: 'Test description 1',
      types: [hft1._id, hft2._id],
      assignees: ['User 1', 'user 2'],
    };
    const response0: Response = await postHighFive(highFive);

    const result: HighFiveDocument = response0.body;
    idsArray.push(result._id);

    await request(app)
      .delete(`${ENDPOINTS.HIGH_FIVE}/${result._id}`)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==');
    const response: Response = await request(app)
      .delete(`${ENDPOINTS.HIGH_FIVE}/${result._id}`)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'High Five not found',
    });
  });

  it('should return an array of High Fives with not having _deleted === true', async () => {
    const mockData: HighFiveInput[] = [
      {
        description: 'Test description 1',
        types: [hft3._id, hft2._id],
        assignees: ['User 1', 'user 2'],
      },
      {
        description: 'Test description 2',
        types: [hft3._id, hft2._id],
        assignees: ['User 1', 'user 2'],
      },
      {
        description: 'Test description 3',
        types: [hft3._id, hft2._id],
        assignees: ['User 12', 'user 1'],
      },
    ];

    mockData.forEach(async (hf) => {
      const response: Response = await postHighFive(hf);
      idsArray.push(response.body._id);
    });

    const mockData2: HighFiveInput = {
      description: 'Test description 5',
      types: [hft1._id, hft2._id],
      assignees: ['User 1', 'user 2'],
    };

    const response1: Response = await postHighFive(mockData2);
    idsArray.push(response1.body._id);

    await request(app)
      .delete(`${ENDPOINTS.HIGH_FIVE}/${response1.body._id}`)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==');

    const response0: Response = await request(app)
      .get(ENDPOINTS.HIGH_FIVE)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==');
    expect(response0.body.documents).toEqual(
      expect.arrayContaining([expect.objectContaining({ _deleted: false })])
    );
  });

  it('should return an array of High Fives with metadata when no query params are sent', async () => {
    const highFiveRes: Response = await request(app)
      .get(ENDPOINTS.HIGH_FIVE)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==');
    expect(highFiveRes.body.metadata).toEqual({
      current_page_size: 10,
      page_number: 1,
      page_size: 10,
      total_documents_count: 12,
      total_pages: 2,
    });
  });

  it('should return an array of High Fives with metadata when query params are sent', async () => {
    const highFiveRes: Response = await request(app)
      .get(`${ENDPOINTS.HIGH_FIVE}/?page=2&pageSize=3`)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==');
    expect(highFiveRes.body.metadata).toEqual({
      current_page_size: 3,
      page_number: 2,
      page_size: 3,
      total_documents_count: 12,
      total_pages: 4,
    });
  });

  it('should return 400 error when trying to add a highFive with invalid type', async () => {
    const highFive: HighFiveInput = {
      description: 'Test description 1',
      types: ['Type22232323'],
      assignees: ['User 1', 'user 2'],
    };
    const response: Response = await postHighFive(highFive);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      documents: undefined,
      metaData: undefined,
      message: 'Bad Request',
      extraInfo: [
        expect.objectContaining({
          message: 'Invalid high five types, Type22232323',
          key: 'HighFiveType',
        }),
      ],
    });
  });

  it('should return 400 error when trying to update a highFive with invalid type', async () => {
    const highFive: HighFiveInput = {
      description: 'Test description 1',
      types: [hft1._id, hft2._id],
      assignees: ['User 1', 'user 2'],
    };
    const highFive2: HighFiveInput = {
      description: 'Test description 1',
      types: ['Type 2', 'type00998'],
      assignees: ['User 1', 'user 2'],
    };
    const response: Response = await postHighFive(highFive);
    expect(response.status).toBe(201);
    const response2: Response = await putHighFive(highFive2, response.body);
    expect(response2.status).toBe(400);
    expect(response2.body).toEqual({
      documents: undefined,
      metaData: undefined,
      message: 'Bad Request',
      extraInfo: [
        {
          key: 'HighFiveType',
          message: 'Invalid high five types, Type 2',
        },
        { key: 'HighFiveType', message: 'Invalid high five types, type00998' },
      ],
    });
  });

  afterAll(async () => {
    await highFiveModel.deleteMany({
      _id: {
        $in: idsArray,
      },
    });
    await highFiveTypeModel.deleteMany({
      _id: {
        $in: hftIds,
      },
    });
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });
});
