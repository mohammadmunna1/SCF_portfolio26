/** An error whose message is safe to show to API clients. */
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
    this.expose = true;
  }
}

/** Rejects with a 503 when `promise` takes longer than `ms` (so a slow database can't hold a request open). */
export function withTimeout(promise, ms, message = "The database is taking too long to respond.") {
  let timer;
  const timeout = new Promise((resolve, reject) => {
    timer = setTimeout(() => reject(new HttpError(503, message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** Express 4 does not catch rejected promises, so async handlers are wrapped. */
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
