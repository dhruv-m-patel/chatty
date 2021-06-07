import { getSummarizedHighFive } from '../../src/v1/routes/utils';
import highFiveModel, { HighFiveDocument } from '../../src/v1/models/highFive';
import notesModel, { NotesDocument } from '../../src/v1/models/notes';

describe('getModifiedHighFive test', () => {
  const notes: NotesDocument[] = [
    new notesModel({ content: 'Note 1' }),
    new notesModel({ content: 'Note 1' }),
    new notesModel({ content: 'Note 1' }),
  ];
  const highFive: HighFiveDocument = new highFiveModel({
    notes: notes,
    description: 'abc',
    reactions: {
      clapping: ['User 1', 'User 2', 'User 3'],
      star: ['User 4', 'User 5'],
      party: ['User 6', 'User 7'],
    },
  });

  it('should return a summarized highFive with notes count of 3', () => {
    const result = getSummarizedHighFive(highFive, 'User 1');
    expect(result.notesCount).toBe(3);
  });

  it('should return a summarized highFive with currentUserReaction of clapping', () => {
    const result = getSummarizedHighFive(highFive, 'User 1');
    expect(result.currentUserReaction).toBe('clapping');
  });

  it('should return a summarized highFive with currentUserReaction of star', () => {
    const result = getSummarizedHighFive(highFive, 'User 5');
    expect(result.currentUserReaction).toBe('star');
  });

  it('should return a summarized highFive with currentUserReaction of null', () => {
    const result = getSummarizedHighFive(highFive, 'User x');
    expect(result.currentUserReaction).toBe(null);
  });

  it('should return a summarized highFive with count 3 for clapping, 2 for star and party', () => {
    const result = getSummarizedHighFive(highFive, 'User 1');
    expect(result.reactions.clapping).toBe(3);
    expect(result.reactions.star).toBe(2);
    expect(result.reactions.party).toBe(2);
  });
});
