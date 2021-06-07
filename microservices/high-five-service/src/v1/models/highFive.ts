import { Schema, model, Model } from 'mongoose';
import {
  BaseEntityDocument,
  CompanyBoundEntity,
  softDeletableCompanyEntitySchema,
  SoftDeletableEntity,
} from '@alcumus/mongoose-lib';

export interface HighFiveDocument
  extends BaseEntityDocument,
    SoftDeletableEntity,
    CompanyBoundEntity {
  description: string;
  assignees: Array<string>;
  types: Array<string>;
  notes: Array<string>;
  reactions: Reactions;
  attachments: Array<object>;
}

export interface Reactions {
  clapping: Array<string>;
  star: Array<string>;
  party: Array<string>;
}

const HighFiveSchema: Schema = softDeletableCompanyEntitySchema({
  description: {
    type: String,
    required: true,
  },
  assignees: {
    type: Array,
    required: true,
  },
  types: {
    type: Array,
    required: true,
  },
  reactions: {
    type: Object,
    default: { clapping: [], star: [], party: [] },
    clapping: {
      type: Array,
      default: [],
    },
    star: {
      type: Array,
      default: [],
    },
    party: {
      type: Array,
      default: [],
    },
  },
  notes: {
    type: Array,
    default: [],
  },
  attachments: {
    type: Object,
    images: {
      type: Array,
      default: [],
    },
  },
});

const highFiveModel: Model<HighFiveDocument> = model(
  'HighFive',
  HighFiveSchema
);
export default highFiveModel;
