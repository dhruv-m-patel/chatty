import express, { Request, Response } from 'express';
import { getEmployeeId } from '@alcumus/express-middlewares';
import highFiveModel, { HighFiveDocument } from '../models/highFive';
import { getSummarizedHighFive } from './utils';

const reactionsRouter = express.Router();

enum reactionKeys {
  CLAPPING = 'clapping',
  STAR = 'star',
  PARTY = 'party',
}

reactionsRouter.put(
  '/:highfiveId/reactions',
  async (req: Request, res: Response) => {
    const userId = getEmployeeId(req);
    const { highfiveId } = req.params;
    const { reaction } = req.body;
    let reactionKey = reaction;
    const highFive: HighFiveDocument | null = await highFiveModel.findOne({
      _id: highfiveId,
      _deleted: false,
    });

    if (!highFive) {
      res.status(404).json({ message: 'High Five not found' });
      return;
    }

    if (reaction !== null) {
      reactionKey = reaction.toLowerCase();
      if (!Object.values(reactionKeys).includes(reactionKey)) {
        res.status(422).json({ message: 'Invalid reaction key sent!' });
        return;
      }
    }

    for (const [key, value] of Object.entries(highFive.reactions)) {
      if (key === reactionKey && value.includes(userId)) {
        res
          .status(422)
          .json({ message: 'User Reaction is same as existing reaction' });
        return;
      } else if (key === reactionKey && !value.includes(userId)) {
        value.push(userId);
      } else if (
        (key !== reactionKey || key === null) &&
        value.includes(userId)
      ) {
        const index = value.indexOf(userId);
        if (index > -1) {
          value.splice(index, 1);
        }
      }
    }

    const updatedHighFive: HighFiveDocument | null = await highFiveModel.findByIdAndUpdate(
      highfiveId,
      highFive,
      {
        new: true,
        useFindAndModify: false,
      }
    );

    // @ts-ignore:disable-next-line
    const modifiedRes = getSummarizedHighFive(updatedHighFive, userId);
    res.json(modifiedRes);
  }
);

export default reactionsRouter;
