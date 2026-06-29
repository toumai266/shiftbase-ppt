import { errorJson, okJson } from "@/lib/backend/apiResponse";
import { generateAgentArtifact, getAgentArtifactProviderStatus } from "@/lib/backend/agentArtifactGenerator";
import { requireAuthoringBackend } from "@/lib/backend/containerService";

export const runtime = "nodejs";

export async function GET() {
  try {
    requireAuthoringBackend();
    const status = await getAgentArtifactProviderStatus();
    return okJson({ ok: true, ...status });
  } catch (error) {
    return errorJson(error);
  }
}

export async function POST(request: Request) {
  try {
    requireAuthoringBackend();
    const body = await request.json();
    const artifact = await generateAgentArtifact({
      prompt: typeof body.prompt === "string" ? body.prompt : "",
      pageTitle: typeof body.pageTitle === "string" ? body.pageTitle : undefined,
      readingTitle: typeof body.readingTitle === "string" ? body.readingTitle : undefined,
      bodyMarkdown: typeof body.bodyMarkdown === "string" ? body.bodyMarkdown : undefined,
      paragraphs: Array.isArray(body.paragraphs) ? body.paragraphs.map(String) : undefined,
      checkpoints: Array.isArray(body.checkpoints) ? body.checkpoints.map(String) : undefined,
      currentCode: typeof body.currentCode === "string" ? body.currentCode : undefined,
      currentArtifact: readCurrentArtifact(body.currentArtifact)
    });
    return okJson({ ok: true, artifact });
  } catch (error) {
    return errorJson(error);
  }
}

function readCurrentArtifact(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const artifact = value as Record<string, unknown>;
  return {
    kind: typeof artifact.kind === "string" ? artifact.kind : undefined,
    entry: typeof artifact.entry === "string" ? artifact.entry : undefined,
    files: readStringRecord(artifact.files),
    version: typeof artifact.version === "number" ? artifact.version : undefined,
    status: typeof artifact.status === "string" ? artifact.status : undefined
  };
}

function readStringRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === "string")
  );
}
