import { Schema, SchemaDefinition } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { optionalAlcumusPlatformIdValidator } from './validators';

export const ForeignKeyType = String;

// system user, needs to be turned into an FK/ real user.
export const SeedRecordCreator = '@System';

const BaseEntitySchema = {
  _id: {
    type: String,
    default: () => uuid(),
  },
  // should be FK
  _createdBy: {
    type: String,
    default: () => SeedRecordCreator,
  },
  _createdOn: {
    type: Date,
    default: () => new Date(),
  },

  // should be FK
  _modifiedBy: {
    type: String,
    default: () => SeedRecordCreator,
  },
  _modifiedOn: {
    type: Date,
    default: () => new Date(),
  },
};

const HasLocalCompanyIdSchema = {
  companyId: {
    type: ForeignKeyType,
    ref: 'WF_Company',
    required: true,
  },
};
const HasNonLocalCompanyIdSchema = {
  companyId: {
    type: ForeignKeyType,
    required: false, // TODO make this required.
  },
};

const SoftDeletableSchema = {
  _deleted: {
    type: Boolean,
    default: () => false,
  },
};

const ImportableEntitySchema = {
  _externalId: {
    type: String,
    required: false,
    validators: {
      validate: optionalAlcumusPlatformIdValidator,
    },
  },
};

/**
 * @deprecated use SchemaChain.newBuilder instead
 * @param moreSchema
 */
export function softDeletableEntitySchema(moreSchema: object): Schema {
  return SchemaChain.newBuilder(moreSchema, true).withSoftDelete().build();
}

/**
 * @deprecated use SchemaChain.newBuilder instead
 * @param moreSchema
 */
export function softDeletableCompanyEntitySchema(moreSchema: object): Schema {
  return SchemaChain.newBuilder(moreSchema, true)
    .withCompanyId(false)
    .withSoftDelete()
    .build();
}

export class SchemaChain {
  private _schemas: object[];

  static newBuilder(schemaFields = {}, extendsBaseSchema = true): SchemaChain {
    return new SchemaChain(schemaFields, extendsBaseSchema);
  }

  private constructor(schemaFields: object, extendsBaseSchema: boolean) {
    this._schemas = [schemaFields];
    if (extendsBaseSchema) {
      this._schemas.push(BaseEntitySchema);
    }
  }

  public withSoftDelete(): SchemaChain {
    this._schemas.push(SoftDeletableSchema);
    return this;
  }

  public withExternalId(): SchemaChain {
    this._schemas.push(ImportableEntitySchema);
    return this;
  }

  public withCompanyId(isLocal = false): SchemaChain {
    const companyIdSchema = isLocal
      ? HasLocalCompanyIdSchema
      : HasNonLocalCompanyIdSchema;
    this._schemas.push(companyIdSchema);
    return this;
  }

  public withMoreFields(schema: object): SchemaChain {
    this._schemas.push(schema);
    return this;
  }

  build(): Schema {
    const schemas = this._schemas.reduce((aggregate, current) => {
      aggregate = {
        ...aggregate,
        ...current,
      };
      return aggregate;
    }, {});
    return new Schema(schemas as SchemaDefinition);
  }
}
