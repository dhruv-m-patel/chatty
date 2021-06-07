import { ProcessEnv } from '@alcumus/express-app';

export class EntityUtils {
  public static getDatabaseNameByEntity(schemaType: string): string {
    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    return ProcessEnv.getValue(
      `${EntityUtils.camelToUnderscore(
        schemaType
      )}_HISTORY_SERVICE_DATABASE_NAME`
    );
  }

  public static isEmpty(obj: object): boolean {
    if (Object.keys(obj).length > 0 && obj.constructor === Object) {
      return false;
    }
    return true;
  }

  public static mapChangedFieldsArray(
    diffObj: object,
    isCreate = false
  ): Array<object> {
    const changedFields: object[] = [];

    if (!diffObj) {
      return [];
    }
    for (const [key, value] of Object.entries(diffObj)) {
      let oldValue, newValue;

      if (isCreate) {
        oldValue = null;
        newValue = value;
      } else {
        oldValue = value.__old;
        newValue = value.__new;
      }
      const entry = {
        fieldName: key,
        oldValue,
        newValue,
      };
      changedFields.push(entry);
    }

    return changedFields;
  }

  private static camelToUnderscore(key: string) {
    const result = key.replace(/([A-Z])/g, ' $1');
    return result.split(' ').join('_').toUpperCase();
  }
}
