import buildResponse, {
  GenericValidationError,
} from '../../src/genericResponse';
interface XyZ {
  name: string;
  age: number;
}
describe('Unit Tests: buildResponse', () => {
  it('returns an array of errors', () => {
    const mockErrors: Array<GenericValidationError> = [
      { message: 'Error1' },
      { message: 'Error2' },
    ];
    const result = buildResponse<GenericValidationError>({
      errors: mockErrors,
      message: 'Bad Request',
    });

    expect(result.extraInfo).toEqual(mockErrors);
    expect(result.metadata).toBeUndefined();
    expect(result.documents).toBeUndefined();
    expect(result.message).toBe('Bad Request');
  });

  it('returns an array of documents', () => {
    const mockData: Array<XyZ> = [
      { name: 'Ammar', age: 20 },
      { name: 'Nitish', age: 33 },
    ];
    const result = buildResponse<XyZ>({ response: mockData });
    console.log({ result });
    expect(result.extraInfo).toBeUndefined();
    expect(result.metadata).toEqual({
      current_page_size: null,
      page_number: null,
      page_size: null,
      total_documents_count: null,
      total_pages: null,
    });
    expect(result.documents).toEqual(mockData);
    expect(result.message).toBeUndefined();
  });
});
