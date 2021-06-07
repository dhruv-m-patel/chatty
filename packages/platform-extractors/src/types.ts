export interface AlcumusPlatformApiResponse<TData extends {}> {
  ok: boolean;
  processed: Array<boolean>;
  notAuthorised: object;
  errors: Array<string | boolean>;

  client: {
    events: Array<object>;
    notifications: Array<object>;
    data: TData;
  };
  statusCode: number;
  _log: Array<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface AlcumusPlatformApiResult<TData> {
  status: number;
  data: AlcumusPlatformApiResponse<TData>;
}

export interface AlcumusPlatformCustomApiItem {
  __: string;
  _created: number;
  _modified: number;
  _stateChangedAt: number;
  _deleted: number;
  _id: string;
  _info: object;
  _client: string;
  _version: string;
}

export interface AlcumusPlatformRelatedItemBase {
  // the id of the related item.  Ends with :db_name/table_name
  _id: string;
  _settings: {
    // the id of the document type.  Ends with :hestia/document-types
    _id: string;
  };
}
