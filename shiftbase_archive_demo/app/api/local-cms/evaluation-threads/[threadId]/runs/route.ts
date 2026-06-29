import { errorJson, okJson } from "@/lib/backend/apiResponse";
import { requireAuthoringBackend } from "@/lib/backend/containerService";
import { badRequest } from "@/lib/backend/errors";
import { evaluationService } from "@/lib/backend/evaluationService";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ threadId: string }> }
) {
  try {
    requireAuthoringBackend();
    const { threadId } = await context.params;
    const body = await request.json().catch(() => ({})) as { participantIds?: unknown };
    if (body.participantIds !== undefined && !isStringArray(body.participantIds)) {
      throw badRequest("participantIds must be a string array.");
    }
    const thread = await evaluationService.runThread({
      threadId,
      participantIds: body.participantIds
    });
    return okJson({ ok: true, thread });
  } catch (error) {
    return errorJson(error);
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
