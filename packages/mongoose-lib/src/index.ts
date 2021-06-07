import mongoose from 'mongoose';
import process from 'process';

import {
  BaseEntity,
  ImportableEntity,
  SoftDeletableEntity,
  CompanyBoundEntity,
  BaseEntityDocument,
} from './documentTypes';

import {
  softDeletableEntitySchema,
  softDeletableCompanyEntitySchema,
  ForeignKeyType,
  SeedRecordCreator,
  SchemaChain,
} from './schemas';

import {
  optionalAlcumusPlatformIdValidator,
  optionalHestiaUserIdValidator,
} from './validators';

export default function connectToMongoose(url: string): () => Promise<void> {
  return async () => {
    mongoose.connection.on('connected', () => {
      console.log(
        `mongoose-connection:connected: Process ${process.pid} is now connected to Mongoose!`
      );
    });
    mongoose.connection.on('error', (error: Error) => {
      console.error('mongoose-lib error: ', error);
    });

    await mongoose
      .connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      })
      .catch((error) => {
        console.error('mongoose-lib error: ', error);
        process.exit(1);
      });
  };
}

export {
  ForeignKeyType,
  SeedRecordCreator,
  BaseEntity,
  CompanyBoundEntity,
  ImportableEntity,
  SoftDeletableEntity,
  BaseEntityDocument,
  softDeletableEntitySchema,
  softDeletableCompanyEntitySchema,
  SchemaChain,
  optionalAlcumusPlatformIdValidator,
  optionalHestiaUserIdValidator,
};
