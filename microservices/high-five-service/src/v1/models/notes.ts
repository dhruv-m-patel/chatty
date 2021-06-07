import { Schema, model, Model } from 'mongoose';
import {
  BaseEntityDocument,
  SoftDeletableEntity,
  softDeletableEntitySchema,
} from '@alcumus/mongoose-lib';

export interface Notes extends SoftDeletableEntity {
  content: string;
  _parentId: string;
}

export interface NotesDocument extends Notes, BaseEntityDocument {}

const notesSchema: Schema = softDeletableEntitySchema({
  content: {
    type: String,
    required: true,
    validate: /\S+/,
  },
  _parentId: {
    type: String,
    default: '',
  },
});

const notesModel: Model<NotesDocument> = model('Notes', notesSchema);
export default notesModel;
