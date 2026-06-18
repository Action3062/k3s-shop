export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function errorBody(code: string, message: string, details?: unknown) {
  return { error: { code, message, ...(details ? { details } : {}) } };
}
