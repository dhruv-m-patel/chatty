declare global {
  declare module 'express' {
    interface Request {
      id?: string;
    }
  }
}
