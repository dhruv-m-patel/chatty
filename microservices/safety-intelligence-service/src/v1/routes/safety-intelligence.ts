import express, { Request, Response } from 'express';
const safetyIntelligenceRouter = express.Router();

safetyIntelligenceRouter.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'For / path' });
});
safetyIntelligenceRouter.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  res.status(200).json({ message: `for id: ${id}` });
});

export default safetyIntelligenceRouter;
