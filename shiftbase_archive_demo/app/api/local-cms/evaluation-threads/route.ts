import { errorJson, okJson } from "@/lib/backend/apiResponse";
import { requireAuthoringBackend } from "@/lib/backend/containerService";
import { badRequest } from "@/lib/backend/errors";
import { evaluationService } from "@/lib/backend/evaluationService";
import type { EvaluationScope } from "@/lib/backend/evaluationTypes";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    requireAuthoringBackend();
    const url = new URL(request.url);
    const containerSlug = url.searchParams.get("containerSlug") ?? undefined;
    const threads = await evaluationService.listThreads(containerSlug);
    return okJson({ ok: true, threads, participants: evaluationService.participantCatalog });
  } catch (error) {
    return errorJson(error);
  }
}

export async function POST(request: Request) {
  try {
    requireAuthoringBackend();
    const body = await request.json() as { containerSlug?: unknown; scope?: unknown; issue?: unknown };
    if (typeof body.containerSlug !== "string") throw badRequest("containerSlug is required.");
    if (typeof body.issue !== "string") throw badRequest("issue is required.");
    if (!isEvaluationScope(body.scope)) throw badRequest("scope is required.");

    const thread = await evaluationService.createThread({
      containerSlug: body.containerSlug,
      scope: body.scope,
      issue: body.issue
    });
    return okJson({ ok: true, thread }, 201);
  } catch (error) {
    return errorJson(error);
  }
}

function isEvaluationScope(value: unknown): value is EvaluationScope {
  return typeof value === "object" && value !== null && !Array.isArray(value) && "containerSlug" in value && typeof value.containerSlug === "string";
}
