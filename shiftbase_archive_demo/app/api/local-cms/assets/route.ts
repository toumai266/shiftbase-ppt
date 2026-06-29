import { promises as fs } from "fs";
import path from "path";
import { errorJson, okJson } from "@/lib/backend/apiResponse";
import { badRequest } from "@/lib/backend/errors";
import { requireAuthoringBackend } from "@/lib/backend/containerService";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);

function sanitizeFileName(name: string) {
  const parsed = path.parse(name);
  const base = parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "image";
  const ext = parsed.ext.toLowerCase().replace(/[^.a-z0-9]/g, "");
  return `${base}${ext}`;
}

export async function POST(request: Request) {
  try {
    requireAuthoringBackend();
    const form = await request.formData();
    const slug = form.get("slug");
    const file = form.get("file");

    if (typeof slug !== "string" || !slugPattern.test(slug)) {
      throw badRequest("valid slug is required.");
    }
    if (!(file instanceof File)) {
      throw badRequest("image file is required.");
    }
    if (!allowedTypes.has(file.type)) {
      throw badRequest("unsupported image type.");
    }

    const fileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
    const assetDir = path.join(process.cwd(), "public", "assets", "cms", slug);
    const assetPath = path.join(assetDir, fileName);
    await fs.mkdir(assetDir, { recursive: true });
    await fs.writeFile(assetPath, Buffer.from(await file.arrayBuffer()));

    return okJson({ ok: true, path: `/assets/cms/${slug}/${fileName}` }, 201);
  } catch (error) {
    return errorJson(error);
  }
}
