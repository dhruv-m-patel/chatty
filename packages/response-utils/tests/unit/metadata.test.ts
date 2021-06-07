import buildMetaData from '../../src/metadata';
describe('Unit Tests: buildMetaData', () => {
  it('returns a correctly formatted metadata object', () => {
    const result = buildMetaData({
      count: 10,
      page: 2,
      pageSize: 3,
      currentPageSize: 2,
    });

    expect(result.total_documents_count).toEqual(10);
    expect(result.page_number).toEqual(2);
    expect(result.page_size).toEqual(3);
    expect(result.total_pages).toBe(4);
    expect(result.current_page_size).toBe(2);
  });
});
