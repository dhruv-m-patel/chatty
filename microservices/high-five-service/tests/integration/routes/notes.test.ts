import mongoose from 'mongoose';
import request, { Response } from 'supertest';
import app from './../../../src/app';
import { ENDPOINTS, HIGH_FIVE_SERVICE_DB_URL } from '../../../src/constants';
import highFiveTypeModel, {
  HighFiveTypeDocument,
} from '../../../src/v1/models/highFiveType';
import highFiveModel, {
  HighFiveDocument,
} from '../../../src/v1/models/highFive';
import notesModel, { NotesDocument } from '../../../src/v1/models/notes';

const authToken = 'valid.token';

interface NoteInput {
  content: string;
}

async function getNotes(highFiveId: string) {
  return request(app)
    .get(`${ENDPOINTS.HIGH_FIVE}/${highFiveId}/notes`)
    .auth(authToken, { type: 'bearer' })
    .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
    .set('Accept', 'application/json');
}

async function getHighFive(highFiveId: string) {
  return request(app)
    .get(`${ENDPOINTS.HIGH_FIVE}/${highFiveId}`)
    .auth(authToken, { type: 'bearer' })
    .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
    .set('Accept', 'application/json');
}

async function postNote(note: NoteInput | object, highFive: HighFiveDocument) {
  return request(app)
    .post(`${ENDPOINTS.HIGH_FIVE}/${highFive._id}/notes`)
    .auth(authToken, { type: 'bearer' })
    .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
    .set('Accept', 'application/json')
    .send(note);
}

async function putNote(highFive: any, result: any) {
  return request(app)
    .put(`${ENDPOINTS.HIGH_FIVE}/${result._id}`)
    .set('Accept', 'application/json')
    .auth(authToken, { type: 'bearer' })
    .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
    .send(highFive);
}

describe('Integration test for Notes', () => {
  const hfIds: string[] = [];
  const hftIds: string[] = [];
  const noteIds: string[] = [];
  let highFiveType1: HighFiveTypeDocument,
    highFiveType2: HighFiveTypeDocument,
    highFiveDoc: HighFiveDocument;
  beforeAll(async () => {
    await mongoose.connect(HIGH_FIVE_SERVICE_DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    highFiveType1 = await highFiveTypeModel.create({ name: 'Type 1' });
    highFiveType2 = await highFiveTypeModel.create({ name: 'Type 2' });

    highFiveDoc = await highFiveModel.create({
      description: 'Test description 1',
      types: [highFiveType1._id, highFiveType2._id],
      assignees: ['User 1', 'user 2'],
    });

    hftIds.push(highFiveType1._id);
    hftIds.push(highFiveType2._id);
    hfIds.push(highFiveDoc._id);
  });

  it('should return count of notes as 0 when high five is just created', async () => {
    const fetchedHighFiveNotes = await getNotes(highFiveDoc._id);
    expect(fetchedHighFiveNotes.body.documents.length).toEqual(0);

    const fetchedHighFive = await getHighFive(highFiveDoc._id);
    expect(fetchedHighFive.body.notesCount).toEqual(0);
  });

  it('should create an Note with content of test content 1', async () => {
    const note: NoteInput = {
      content: 'Test Content 1',
    };

    const noteResponse: Response = await postNote(note, highFiveDoc);
    expect(noteResponse.status).toBe(201);
    const result: NotesDocument = noteResponse.body;
    noteIds.push(result._id);

    expect(result.content).toBe('Test Content 1');

    const fetchedHighFive = await getHighFive(highFiveDoc._id);
    expect(fetchedHighFive.body.notesCount).toEqual(1);
  });

  it('should return an array of notes just created', async () => {
    const anotherNote: NoteInput = {
      content: 'Test Content 2',
    };

    const noteResponse: Response = await postNote(anotherNote, highFiveDoc);
    expect(noteResponse.status).toBe(201);

    const result: NotesDocument = noteResponse.body;
    noteIds.push(result._id);
    const fetchedNotes = await getNotes(highFiveDoc._id);
    expect(result.content).toBe('Test Content 2');
    expect(fetchedNotes.body.documents.length).toEqual(2);
    expect(fetchedNotes.body.documents[0]);
  });

  it('should return count of notes just created', async () => {
    const fetchedHighFive = await getHighFive(highFiveDoc._id);
    expect(fetchedHighFive.body.notesCount).toEqual(2);
  });

  it('should create a new note and delete it', async () => {
    const anotherNote: NoteInput = {
      content: 'Test Content 2',
    };

    const noteResponse: Response = await postNote(anotherNote, highFiveDoc);
    expect(noteResponse.status).toBe(201);

    const result: NotesDocument = noteResponse.body;
    noteIds.push(result._id);

    const fetchedNotes = await getNotes(highFiveDoc._id);
    expect(fetchedNotes.body.documents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: result._id,
        }),
      ])
    );
    const response: Response = await request(app)
      .delete(`${ENDPOINTS.HIGH_FIVE}/${highFiveDoc._id}/notes/${result._id}`)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==');

    expect(response.status).toBe(204);

    const fetchedNotesDeleted = await request(app)
      .get(`${ENDPOINTS.HIGH_FIVE}/${highFiveDoc._id}/notes`)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .set('Accept', 'application/json');

    expect(fetchedNotesDeleted.body.documents).toEqual(
      expect.arrayContaining([
        expect.not.objectContaining({
          _id: result._id,
        }),
      ])
    );
  });

  it('should return default metadata when no params passed', async () => {
    const fetchedNotes = await request(app)
      .get(`${ENDPOINTS.HIGH_FIVE}/${highFiveDoc._id}/notes`)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .set('Accept', 'application/json');

    expect(fetchedNotes.body.metadata).toEqual({
      current_page_size: 2,
      page_number: 1,
      page_size: 10,
      total_documents_count: 2,
      total_pages: 1,
    });
  });

  it('should return modified metadata when params passed', async () => {
    const fetchedNotes = await request(app)
      .get(`${ENDPOINTS.HIGH_FIVE}/${highFiveDoc._id}/notes?pageSize=1&page=2`)
      .auth(authToken, { type: 'bearer' })
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .set('Accept', 'application/json');

    expect(fetchedNotes.body.metadata).toEqual({
      current_page_size: 1,
      page_number: 2,
      page_size: 1,
      total_documents_count: 2,
      total_pages: 2,
    });
  });

  it('should return an error when no content provided or isEmpty', async () => {
    let noteInp: NoteInput = new notesModel({
      content: '',
    });
    let error = null;
    try {
      const note = new notesModel(noteInp);
      // @ts-ignore
      await note.validate();
    } catch (e) {
      error = e;
    }

    expect(error).not.toBeNull();
    expect(error._message).toEqual('Notes validation failed');
    let noteInp2: NoteInput = new notesModel({});
    let error2 = null;
    try {
      const note2 = new notesModel(noteInp2);
      // @ts-ignore
      await note2.validate();
    } catch (e) {
      error2 = e;
    }

    expect(error2).not.toBeNull();
    expect(error2._message).toEqual('Notes validation failed');
  });

  it('should return 404 when trying to update a nonexistent note', async () => {
    const response: Response = await request(app)
      .put(`${ENDPOINTS.HIGH_FIVE}/${highFiveDoc._id}/notes/some-id`)
      .auth(authToken, { type: 'bearer' })
      .set('Accept', 'application/json')
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .send({ content: 'test' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'Note not found!',
    });
  });

  it('should return 200 when note update successful and validate if content updated', async () => {
    const response: Response = await request(app)
      .put(`${ENDPOINTS.HIGH_FIVE}/${highFiveDoc._id}/notes/${noteIds[1]}`)
      .auth(authToken, { type: 'bearer' })
      .set('Accept', 'application/json')
      .set('x-userinfo', 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogInVzZXJpZDIifQ==')
      .send({ content: 'test' });

    expect(response.status).toBe(200);
    expect(response.body.content).toEqual('test');

    const fetchedHighFiveNotes = await getNotes(highFiveDoc._id);
    expect(fetchedHighFiveNotes.body.documents.length).toEqual(2);
    expect(fetchedHighFiveNotes.body.documents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          content: 'test',
          _id: noteIds[1],
        }),
      ])
    );
  });

  afterAll(async () => {
    await notesModel.deleteMany({
      _id: {
        $in: noteIds,
      },
    });

    await highFiveModel.deleteMany({
      _id: {
        $in: hftIds,
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
