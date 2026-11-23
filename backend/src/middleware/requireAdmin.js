// Rejects non-admin users (server-side admin check). Use after authenticate.
import { messages } from '../lang/en/messages.js';
import { HttpError } from './errorHandler.js';

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return next(new HttpError(403, messages.auth.notAdmin));
  }
  next();
}
