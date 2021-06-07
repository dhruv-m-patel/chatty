import {
  BaseKnexEntitySchema,
  JsonSchemaBuilder,
} from '../../src/schemaBuilder';

const EXTRA_TENANT_FIELD_NAME = 'whiteLabelId';

describe('Unit test: @alcumus/objection-lib JsonSchemaBuilder', () => {
  describe('build', () => {
    it('includes base entity fields by default', () => {
      const schema = JsonSchemaBuilder.newBuilder().build();
      expect(schema).toEqual(BaseKnexEntitySchema);
    });

    it('includes extra schema', () => {
      const additionalSchema = {
        someValue: {
          type: 'string',
        },
      };
      const schema = JsonSchemaBuilder.newBuilder()
        .withMoreSchema(additionalSchema)
        .build();

      expect(schema).toEqual({
        ...BaseKnexEntitySchema,
        ...additionalSchema,
      });
    });

    it('has external id and source support', () => {
      const schema = JsonSchemaBuilder.newBuilder().withExternalId().build();

      expect(schema).toEqual({
        ...BaseKnexEntitySchema,
        externalId: {
          default: null,
          type: ['string', 'null'],
        },
        externalSource: {
          default: null,
          type: ['string', 'null'],
        },
      });
    });

    it('has soft deletion support', () => {
      const schema = JsonSchemaBuilder.newBuilder().isSoftDeletable().build();

      expect(schema).toEqual({
        ...BaseKnexEntitySchema,
        _deleted: {
          type: 'boolean',
        },
        _deletedOn: {
          default: null,
          type: ['date', 'null'],
        },
      });
    });

    it('adds all expected fields when required always true', () => {
      const schema = JsonSchemaBuilder.newBuilder()
        .withCompanyId()
        .withSiteId()
        .withTenantId(EXTRA_TENANT_FIELD_NAME)
        .build();

      expect(schema).toEqual({
        ...BaseKnexEntitySchema,
        companyId: {
          type: 'string',
        },
        siteId: {
          type: 'string',
        },
        [EXTRA_TENANT_FIELD_NAME]: {
          type: 'string',
        },
        type: 'object',
      });
    });

    it('adds all expected fields when required always false', () => {
      const schema = JsonSchemaBuilder.newBuilder()
        .withCompanyId(false)
        .withSiteId(false)
        .withTenantId(EXTRA_TENANT_FIELD_NAME, false)
        .build();

      expect(schema).toEqual({
        ...BaseKnexEntitySchema,
        companyId: {
          type: ['string', 'null'],
          default: null,
        },
        siteId: {
          type: ['string', 'null'],
          default: null,
        },
        [EXTRA_TENANT_FIELD_NAME]: {
          type: ['string', 'null'],
          default: null,
        },
      });
    });
  });
});
