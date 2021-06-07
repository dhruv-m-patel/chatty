import mongoose from 'mongoose';
import { SummarizedHighFive } from '../../../src/v1/routes/utils';
import highFiveModel from '../../../src/v1/models/highFive';
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

async function postHighFive(highFive: any) {
  return await request(app)
    .post(ENDPOINTS.HIGH_FIVE)
    .auth(authToken, { type: 'bearer' })
    .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
    .set('Accept', 'application/json')
    .send(highFive);
}
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

mockedAxios.post.mockImplementation(post);
describe('Integration test for High Fives Reactions', () => {
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
    hft1 = await highFiveTypeModel.create({ name: 'Type 1' });
    hft2 = await highFiveTypeModel.create({ name: 'Type 2' });
    hft3 = await highFiveTypeModel.create({ name: 'Type 3' });
    hft4 = await highFiveTypeModel.create({ name: 'Type 4' });

    hftIds.push(hft1._id);
    hftIds.push(hft2._id);
    hftIds.push(hft3._id);
    hftIds.push(hft4._id);
  });

  afterAll(() => jest.clearAllMocks());

  it('adds a clapping reaction to a post', async () => {
    const highFive = {
      description: 'High five no. 1',
      reactions: {
        clapping: ['123', '321'],
        party: ['333', '444'],
        star: ['546'],
      },
      assignees: ['User 1', 'user 2'],
      types: [hft1._id, hft2._id],
    };
    const newHighFiveResponse: Response = await postHighFive(highFive);
    const newHighFive: SummarizedHighFive = newHighFiveResponse.body;
    idsArray.push(newHighFive._id);

    const newReactionResponse: Response = await request(app)
      .put(`${ENDPOINTS.HIGH_FIVE}/${newHighFive._id}/reactions`)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .set('Accept', 'application/json')
      .send({ reaction: 'clapping' });
    const updatedHighFive: SummarizedHighFive = newReactionResponse.body;

    expect(updatedHighFive.reactions.clapping).toBe(3);
    expect(updatedHighFive.currentUserReaction).toBe('clapping');
  });

  it('chnages the reaction from clapping to party', async () => {
    const highFive = {
      description: 'High five no. 2',
      reactions: {
        clapping: ['123', '321', 'userid2'],
        party: ['333', '444'],
        star: ['546'],
      },
      assignees: ['User 1', 'user 2'],
      types: [hft1._id, hft2._id],
    };

    const newHighFiveResponse: Response = await postHighFive(highFive);
    const newHighFive: SummarizedHighFive = newHighFiveResponse.body;
    idsArray.push(newHighFive._id);

    const newReactionResponse: Response = await request(app)
      .put(`${ENDPOINTS.HIGH_FIVE}/${newHighFive._id}/reactions`)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .set('Accept', 'application/json')
      .send({ reaction: 'party' });
    const updatedHighFive: SummarizedHighFive = newReactionResponse.body;

    expect(updatedHighFive.reactions.clapping).toBe(2);
    expect(updatedHighFive.reactions.party).toBe(3);
    expect(updatedHighFive.currentUserReaction).toBe('party');
  });

  it('recieves error 404 when reacting to a deleted high five', async () => {
    const highFive = {
      description: 'High five no. 2',
      reactions: {
        clapping: ['123', '321', 'userid2'],
        party: ['333', '444'],
        star: ['546'],
      },
      assignees: ['User 1', 'user 2'],
      types: [hft1._id, hft2._id],
    };

    const newHighFiveResponse: Response = await postHighFive(highFive);
    const newHighFive: SummarizedHighFive = newHighFiveResponse.body;
    idsArray.push(newHighFive._id);

    await request(app)
      .delete(`${ENDPOINTS.HIGH_FIVE}/${newHighFive._id}`)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .set('Accept', 'application/json');

    const newReactionResponse: Response = await request(app)
      .put(`${ENDPOINTS.HIGH_FIVE}/${newHighFive._id}/reactions`)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .set('Accept', 'application/json')
      .send({ reaction: 'party' });

    expect(newReactionResponse.status).toBe(404);
    expect(newReactionResponse.body).toEqual({
      message: 'High Five not found',
    });
  });

  it('recieves error 422 when the same reaction is send to a post', async () => {
    const highFive = {
      description: 'High five no. 2',
      reactions: {
        clapping: ['123', '321', 'userid2'],
        party: ['333', '444'],
        star: ['546'],
      },
      assignees: ['User 1', 'user 2'],
      types: [hft1._id, hft2._id],
    };

    const newHighFiveResponse: Response = await postHighFive(highFive);
    const newHighFive: SummarizedHighFive = newHighFiveResponse.body;
    idsArray.push(newHighFive._id);

    await request(app)
      .put(`${ENDPOINTS.HIGH_FIVE}/${newHighFive._id}/reactions`)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .set('Accept', 'application/json')
      .send({ reaction: 'party' });

    const duplicatedReactionResponse: Response = await request(app)
      .put(`${ENDPOINTS.HIGH_FIVE}/${newHighFive._id}/reactions`)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .set('Accept', 'application/json')
      .send({ reaction: 'party' });

    expect(duplicatedReactionResponse.status).toBe(422);
    expect(duplicatedReactionResponse.body).toEqual({
      message: 'User Reaction is same as existing reaction',
    });
  });

  it('removes a reaction from a high five', async () => {
    const highFive = {
      description: 'High five no. 2',
      reactions: {
        clapping: ['123', '321', 'userid2'],
        party: ['333', '444'],
        star: ['546'],
      },
      assignees: ['User 1', 'user 2'],
      types: [hft1._id, hft2._id],
    };

    const newHighFiveResponse: Response = await postHighFive(highFive);
    const newHighFive: SummarizedHighFive = newHighFiveResponse.body;
    idsArray.push(newHighFive._id);

    const nullReactionResponse: Response = await request(app)
      .put(`${ENDPOINTS.HIGH_FIVE}/${newHighFive._id}/reactions`)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .set('Accept', 'application/json')
      .send({ reaction: null });

    expect(nullReactionResponse.status).toBe(200);
    expect(nullReactionResponse.body.reactions.clapping).toEqual(2);
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
