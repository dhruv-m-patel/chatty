import { defaultMetaData, MetaData } from './metadata';

type Options<TModelType> = {
  response: Array<TModelType>;
  errors: Array<GenericValidationError>;
  message: string;
  metadata: MetaData;
};

export default function buildResponse<TModelType>(
  options: Partial<Options<TModelType>> = {}
): GenericResponse<TModelType> {
  const finalMetadata = options.metadata;
  if (options.response)
    return {
      documents: options.response,
      metadata: finalMetadata || defaultMetaData,
    };
  return {
    message: options.message,
    extraInfo: options.errors,
  };
}

export interface GenericValidationError {
  key?: string;
  type?: string;
  property?: string;
  message: string;
}

export interface GenericResponse<TModelType> {
  message?: string;
  extraInfo?: Array<GenericValidationError>;
  documents?: Array<TModelType>;
  metadata?: MetaData;
}
