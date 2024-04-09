import type { RequestHandler } from 'express';

export function setView(view: 'index' | 'dashboard'): RequestHandler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (req, res, next) => {
    req.view = view;

    next();
  };
}
