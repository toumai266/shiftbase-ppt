import { errorJson, okJson } from "@/lib/backend/apiResponse";
import { generateReadingMarkdown } from "@/lib/backend/agentArtifactGenerator";
import { requireAuthoringBackend } from "@/lib/backend/containerService";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    requireAuthoringBackend();
    const body = await request.json();
    const result = await generateReadingMarkdown({
      prompt: typeof body.prompt === "string" ? body.prompt : "",
      moduleTitle: typeof body.moduleTitle === "string" ? body.moduleTitle : undefined,
      lessonTitle: typeof body.lessonTitle === "string" ? body.lessonTitle : undefined,
      pageTitle: typeof body.pageTitle === "string" ? body.pageTitle : undefined,
      readingTitle: typeof body.readingTitle === "string" ? body.readingTitle : undefined,
      bodyMarkdown: typeof body.bodyMarkdown === "string" ? body.bodyMarkdown : undefined,
      paragraphs: Array.isArray(body.paragraphs) ? body.paragraphs.map(String) : undefined
    });
    return okJson({ ok: true, result });
  } catch (error) {
    return errorJson(error);
  }
}
