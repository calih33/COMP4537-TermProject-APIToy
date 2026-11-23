// Turns thrown errors into JSON responses: { error: "message" }.
import { messages } from '../lang/en/messages.js';

// Throw this from services/controllers when the client did something wrong (4xx).
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function notFound(req, res) {
  res.status(404).json({ error: messages.common.notFound });
}

// Express recognises error handlers by their 4 parameters, so `next` must stay.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  // Malformed JSON body and similar client errors raised by express itself.
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: messages.common.badRequest });
  }
  console.error(err);
  res.status(500).json({ error: messages.common.serverError });
}
