import { NextResponse } from "next/server";
import { toBackendError } from "@/lib/backend/errors";

export function okJson<TBody extends Record<string, unknown>>(body: TBody, status = 200) {
  return NextResponse.json(body, { status });
}

export function errorJson(error: unknown) {
  const backendError = toBackendError(error);
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: backendError.code,
        message: backendError.message
      }
    },
    { status: backendError.status }
  );
}
