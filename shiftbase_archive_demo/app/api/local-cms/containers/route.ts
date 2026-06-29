import { errorJson, okJson } from "@/lib/backend/apiResponse";
import { badRequest } from "@/lib/backend/errors";
import { containerService } from "@/lib/backend/containerService";

export async function GET() {
  try {
    const containers = await containerService.listContainers();
    return okJson({ ok: true, containers });
  } catch (error) {
    return errorJson(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { slug?: unknown; title?: unknown };
    if (typeof body.slug !== "string" || typeof body.title !== "string") {
      throw badRequest("slug and title are required.");
    }

    const spec = await containerService.createContainer({ slug: body.slug, title: body.title });
    return okJson({ ok: true, slug: spec.slug }, 201);
  } catch (error) {
    return errorJson(error);
  }
}
