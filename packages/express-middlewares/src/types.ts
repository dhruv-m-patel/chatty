export interface GenericValidationError {
  key?: string;
  message: string;
  type?: string;
  property?: string;
}

export interface PaginatedDocumentsResponse<T> {
  documents: Array<T> | null;
  validationErrors?: Array<GenericValidationError> | null;
  metadata?: {
    currentPage: number;
    totalPages: number;
    count: number;
    total: number;
  } | null;
}
