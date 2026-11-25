/** Base class for every expected (domain) error. `code` is stable and machine-readable. */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super('not_found', message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid input') {
    super('validation_error', message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('unauthorized', message, 401);
  }
}

export type ErrorEnvelope = { error: { code: string; message: string } };

/** Map any thrown value to the JSON error envelope + HTTP status. Never leaks internals. */
export function toErrorResponse(err: unknown): { status: number; body: ErrorEnvelope } {
  if (err instanceof AppError) {
    return { status: err.status, body: { error: { code: err.code, message: err.message } } };
  }
  return { status: 500, body: { error: { code: 'internal_error', message: 'Internal error' } } };
}
