// Verifies the JWT and sets req.user.
import { messages } from '../lang/en/messages.js';
import { AuthService } from '../services/AuthService.js';
import { HttpError } from './errorHandler.js';

const authService = new AuthService();

export function authenticate(req, res, next) {
  const payload = authService.verifyToken(req.cookies?.[AuthService.COOKIE_NAME]);
  if (!payload) {
    return next(new HttpError(401, messages.auth.notAuthenticated));
  }
  req.user = { id: payload.id, role: payload.role };
  next();
}
