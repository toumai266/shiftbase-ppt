export type BackendErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "CONFLICT"
  | "DISABLED"
  | "VALIDATION_FAILED"
  | "INTERNAL";

export class BackendError extends Error {
  readonly code: BackendErrorCode;
  readonly status: number;

  constructor(code: BackendErrorCode, message: string, status: number) {
    super(message);
    this.name = "BackendError";
    this.code = code;
    this.status = status;
  }
}

export function badRequest(message: string) {
  return new BackendError("BAD_REQUEST", message, 400);
}

export function notFound(message: string) {
  return new BackendError("NOT_FOUND", message, 404);
}

export function conflict(message: string) {
  return new BackendError("CONFLICT", message, 409);
}

export function disabled(message: string) {
  return new BackendError("DISABLED", message, 404);
}

export function validationFailed(message: string) {
  return new BackendError("VALIDATION_FAILED", message, 422);
}

export function toBackendError(error: unknown) {
  if (error instanceof BackendError) return error;
  if (error instanceof Error && error.message.startsWith("Invalid container spec")) {
    return validationFailed(error.message);
  }
  return new BackendError("INTERNAL", error instanceof Error ? error.message : "Internal backend error.", 500);
}
