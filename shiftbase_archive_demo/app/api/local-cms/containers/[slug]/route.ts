import { errorJson, okJson } from "@/lib/backend/apiResponse";
import { containerService } from "@/lib/backend/containerService";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const spec = await containerService.readContainer(slug);
    return okJson({ ok: true, container: spec });
  } catch (error) {
    return errorJson(error);
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const body = await request.json();
    const spec = await containerService.updateContainer(slug, body);
    return okJson({ ok: true, slug: spec.slug, updatedAt: spec.updatedAt ?? null });
  } catch (error) {
    return errorJson(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    await containerService.deleteContainer(slug);
    return okJson({ ok: true, slug });
  } catch (error) {
    return errorJson(error);
  }
}
