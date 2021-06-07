type MetaDataOptions = {
  count: number;
  page: number;
  pageSize: number;
  currentPageSize: number;
};

type pageOptions = {
  page: number;
  pageSize: number;
  skip: number;
};

export function getPaginationQueryParams(queryParams: {
  page?: string;
  pageSize?: string;
}): pageOptions {
  const page: number = queryParams.page ? Number(queryParams.page) : 1;
  const pageSize: number = queryParams.pageSize
    ? Number(queryParams.pageSize)
    : 10;
  const skip: number = (page - 1) * pageSize || 0;
  return {
    page,
    pageSize,
    skip,
  };
}

export default function buildMetaData(options: MetaDataOptions): MetaData {
  console.log({ options });
  return {
    total_documents_count: Number(options.count) /* eslint-disable camelcase */,
    page_number: options.page /* eslint-disable camelcase */,
    page_size: options.pageSize /* eslint-disable camelcase */,
    current_page_size: Number(
      options.currentPageSize
    ) /* eslint-disable camelcase */,
    total_pages: Math.ceil(
      options.count / options.pageSize
    ) /* eslint-disable camelcase */,
  };
}

export interface MetaData {
  total_documents_count: number | null;
  page_number: number | null;
  page_size: number | null;
  current_page_size: number | null;
  total_pages: number | null;
}

export const defaultMetaData = {
  total_documents_count: null,
  page_number: null,
  page_size: null,
  current_page_size: null,
  total_pages: null,
};
