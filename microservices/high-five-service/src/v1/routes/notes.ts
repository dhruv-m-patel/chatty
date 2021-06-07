import express, { Request, Response } from 'express';
import { getEmployeeId } from '@alcumus/express-middlewares';
import {
  buildResponse,
  MetaData,
  buildMetaData,
  getPaginationQueryParams,
  defaultMetaData,
} from '@alcumus/response-utils';
import highFiveModel, { HighFiveDocument } from '../models/highFive';
import notesModel, { Notes, NotesDocument } from '../models/notes';

const notesRouter = express.Router();

async function updateHighFiveAndNote(
  noteId: string,
  updatedNote: Notes,
  highfiveId: string,
  highFive: HighFiveDocument,
  notesIndex: Number,
  deleted: boolean,
  res: Response
) {
  try {
    const index = Number(notesIndex);
    // @ts-ignore:disable-next-line
    const modifiedNote: NotesDocument = await notesModel.findByIdAndUpdate(
      noteId,
      updatedNote,
      { runValidators: true, new: true }
    );

    // TS expecting Notes to be null, need a repository wrapper that accomplishes the findbyId, findByIdAndUpdate, etc
    // @ts-ignore:disable-next-line
    if (modifiedNote && !deleted) {
      highFive.notes[index] = noteId;
    } else if (modifiedNote && deleted) {
      highFive.notes.splice(index, 1);
    }

    await highFiveModel.findByIdAndUpdate(highfiveId, highFive, {
      runValidators: true,
      new: true,
    });

    if (deleted) {
      res.sendStatus(204);
      return;
    }

    res.status(200).json(modifiedNote);
  } catch (err) {
    if (err.name === 'ValidationError')
      res.status(400).json({ message: err.name });
    else {
      console.error(err.message, err.stack);
      res.status(500).json({ message: err.message });
    }
  }
}

notesRouter.get('/:highfiveId/notes', async (req: Request, res: Response) => {
  let metadata: MetaData = defaultMetaData;
  const { highfiveId } = req.params;
  const { page = 1, pageSize = 10, skip = 0 } = getPaginationQueryParams(
    req.query
  );
  const notesFilter = {
    _deleted: false,
    _parentId: highfiveId,
  };

  const highFive: HighFiveDocument | null = await highFiveModel.findOne({
    _deleted: false,
    _id: highfiveId,
  });

  if (!highFive) {
    res.status(404).json({ message: 'High Five not found' });
    return;
  }

  const notes: Array<NotesDocument> = await notesModel
    .find(notesFilter)
    .skip(skip)
    .limit(Number(pageSize))
    .sort({ _createdOn: -1 });
  const count = await notesModel.countDocuments(notesFilter);

  metadata = buildMetaData({
    count,
    page,
    pageSize,
    currentPageSize: notes.length,
  });

  res.json(buildResponse({ response: notes, metadata }));
});

notesRouter.delete(
  '/:highfiveId/notes/:noteId',
  async (req: Request, res: Response) => {
    const { highfiveId, noteId } = req.params;
    const userId = getEmployeeId(req);
    const highFive: HighFiveDocument | null = await highFiveModel.findOne({
      _id: highfiveId,
      _deleted: false,
    });

    const noteDocument: NotesDocument | null = await notesModel.findOne({
      _id: noteId,
      _deleted: false,
      _parentId: highfiveId,
    });

    if (!highFive) {
      res.status(404).json({ message: 'High Five not found!' });
      return;
    } else if (!noteDocument) {
      res.status(404).json({ message: 'Note not found!' });
      return;
    }

    const notesIndex = highFive.notes.findIndex((note) => note === noteId);
    if (notesIndex === -1) {
      res.status(404).json({ message: "Note isn't tied to the High Five" });
      return;
    }

    // @ts-ignore:disable-next-line
    const updatedNote: NotesDocument = { ...noteDocument.toObject() };
    updatedNote._modifiedOn = new Date();
    updatedNote._deleted = true;
    updatedNote._modifiedBy = userId;

    await updateHighFiveAndNote(
      noteId,
      updatedNote,
      highfiveId,
      highFive,
      notesIndex,
      true,
      res
    );
  }
);

notesRouter.put(
  '/:highfiveId/notes/:noteId',
  async (req: Request, res: Response) => {
    const { highfiveId, noteId } = req.params;
    const { content } = req.body;
    const userId = getEmployeeId(req);
    const highFive: HighFiveDocument | null = await highFiveModel.findOne({
      _id: highfiveId,
      _deleted: false,
    });

    const noteDocument: NotesDocument | null = await notesModel.findOne({
      _id: noteId,
      _deleted: false,
      _parentId: highfiveId,
    });

    if (!highFive) {
      res.status(404).json({ message: 'High Five not found!' });
      return;
    } else if (!noteDocument) {
      res.status(404).json({ message: 'Note not found!' });
      return;
    }

    const notesIndex = highFive.notes.findIndex((note) => note === noteId);
    if (notesIndex === -1) {
      res.status(404).json({ message: "Note isn't tied to the High Five" });
      return;
    }

    // @ts-ignore:disable-next-line
    const updatedNote: NotesDocument = { ...noteDocument.toObject() };
    updatedNote._modifiedOn = new Date();
    updatedNote.content = content;
    updatedNote._modifiedBy = userId;
    updatedNote._parentId = highfiveId;

    await updateHighFiveAndNote(
      noteId,
      updatedNote,
      highfiveId,
      highFive,
      notesIndex,
      false,
      res
    );
  }
);

notesRouter.post('/:highfiveId/notes', async (req: Request, res: Response) => {
  const { highfiveId } = req.params;

  const highFive: HighFiveDocument | null = await highFiveModel.findOne({
    _id: highfiveId,
    _deleted: false,
  });

  if (!highFive) {
    res.status(404).json({ message: 'High Five not found' });
    return;
  }

  const newNote: NotesDocument = req.body;

  const userId = getEmployeeId(req);
  newNote._modifiedBy = userId;
  newNote._createdBy = userId;
  let finalNote = { ...newNote };
  finalNote = { ...finalNote, _parentId: highfiveId };

  const note: NotesDocument = await notesModel.create(finalNote);
  // @ts-ignore: disable-next-line
  highFive.notes.unshift(note._id);

  await highFiveModel.findByIdAndUpdate(highfiveId, highFive, { new: true });

  res.setHeader('Location', `/highfive/${highfiveId}/notes/${note._id}`);
  res.status(201).json(note);
});

export default notesRouter;
