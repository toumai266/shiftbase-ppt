import { errorJson, okJson } from "@/lib/backend/apiResponse";
import { requireAuthoringBackend } from "@/lib/backend/containerService";
import { evaluationService } from "@/lib/backend/evaluationService";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ threadId: string }> }
) {
  try {
    requireAuthoringBackend();
    const { threadId } = await context.params;
    const thread = await evaluationService.readThread(threadId);
    return okJson({ ok: true, thread });
  } catch (error) {
    return errorJson(error);
  }
}
