import { Schema, model, Model, models } from 'mongoose';
import {
  BaseEntityDocument,
  SoftDeletableEntity,
  softDeletableEntitySchema,
} from '@alcumus/mongoose-lib';

const HIGH_FIVE_MODEL_NAME = 'HighFiveType';

export interface HighFiveTypeDocument
  extends SoftDeletableEntity,
    BaseEntityDocument {
  name: string;
}

const highFiveTypeSchema: Schema = softDeletableEntitySchema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  _externalId: {
    type: String,
    default: '',
  },
});

highFiveTypeSchema.path('name').validate(async (value: string) => {
  const nameCount = await models.HighFiveType.countDocuments({
    name: value,
  });
  return !nameCount;
}, 'High Five Type already exists');

const highFiveTypeModel: Model<HighFiveTypeDocument> = model(
  HIGH_FIVE_MODEL_NAME,
  highFiveTypeSchema
);
export default highFiveTypeModel;
