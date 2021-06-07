import { Request, Response } from 'express';

export default function handleHealthCheck(
  serviceName: string
): (req: Request, res: Response) => void {
  return (req: Request, res: Response) => {
    const healthCheck = {
      uptime: process.uptime(),
      serviceName,
      status: 'OK',
      timestamp: new Date().toUTCString(),
      pid: process.pid,
    };
    res.json(healthCheck);
  };
}
