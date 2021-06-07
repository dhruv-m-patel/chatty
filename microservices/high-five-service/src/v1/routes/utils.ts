import { HighFiveDocument, Reactions } from '../models/highFive';

export function buildResponse(response: Array<object>): object {
  const finalResponse = { metadata: {} };

  // @ts-ignore:disable-next-line
  finalResponse.documents = response;

  return finalResponse;
}
interface IReactions {
  clapping: number;
  star: number;
  party: number;
}

export interface SummarizedHighFive {
  notesCount: number;
  currentUserReaction: string | null;
  reactions: IReactions;
  _id: string;
  _createdOn: Date;
  _createdBy: string;
  _modifiedOn: Date;
  _modifiedBy: string;
  description: string;
  _deleted: boolean;
}

export function getSummarizedHighFive(
  highFive: HighFiveDocument,
  currentUserId: string
): SummarizedHighFive {
  const { notes = [], ...remaining } = highFive.toObject();
  const notesCount = notes.length || 0;
  const summarizedHighFive: SummarizedHighFive = {
    ...remaining,
    notesCount,
    currentUserReaction: getUserReactions(highFive.reactions, currentUserId),
    reactions: {
      clapping: highFive.reactions.clapping.length,
      star: highFive.reactions.star.length,
      party: highFive.reactions.party.length,
    },
  };
  return summarizedHighFive;
}

function getUserReactions(reactions: Reactions, userId: string): string | null {
  if (!reactions) return null;
  if (reactions.clapping.indexOf(userId) !== -1) return 'clapping';
  if (reactions.party.indexOf(userId) !== -1) return 'party';
  if (reactions.star.indexOf(userId) !== -1) return 'star';
  return null;
}
