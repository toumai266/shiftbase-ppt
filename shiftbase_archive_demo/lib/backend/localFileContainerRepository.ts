import { promises as fs } from "fs";
import path from "path";
import { createInitialSpec, todayLocalDate } from "@/lib/backend/containerDefaults";
import { syncContainerRegistry } from "@/lib/backend/contentRegistryWriter";
import { conflict, badRequest, notFound } from "@/lib/backend/errors";
import type { ContainerRepository, CreateContainerInput } from "@/lib/backend/containerRepository";
import type { ContainerSpec } from "@/lib/containerSpec";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const writeQueues = new Map<string, Promise<unknown>>();

function ensureSlug(slug: string) {
  if (!slugPattern.test(slug)) throw badRequest("slug must be URL-safe kebab-case.");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readContainerSpecJson(file: string) {
  return JSON.parse(file) as ContainerSpec;
}

function prepareContainerForSave(slug: string, rawSpec: unknown) {
  if (!isObject(rawSpec)) throw badRequest("Container payload must be an object.");
  return {
    ...rawSpec,
    slug,
    updatedAt: todayLocalDate()
  } as ContainerSpec;
}

function readTitle(spec: ContainerSpec) {
  return typeof spec.title === "string" && spec.title.trim() ? spec.title : spec.slug;
}

function resolveInside(root: string, filePath: string) {
  const resolvedRoot = path.resolve(root);
  const resolvedFile = path.resolve(filePath);
  const relative = path.relative(resolvedRoot, resolvedFile);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw badRequest("Resolved path escapes the content directory.");
  }
  return resolvedFile;
}

export class LocalFileContainerRepository implements ContainerRepository {
  private readonly containersRoot: string;
  private readonly backupRoot: string;

  constructor(root = path.join(process.cwd(), "content", "containers")) {
    this.containersRoot = root;
    this.backupRoot = path.join(process.cwd(), "content", ".backups", "containers");
  }

  private async syncRegistryIfDefaultRoot() {
    const defaultRoot = path.resolve(process.cwd(), "content", "containers");
    if (path.resolve(this.containersRoot) !== defaultRoot) return;
    await syncContainerRegistry(this.containersRoot);
  }

  private containerFile(slug: string) {
    ensureSlug(slug);
    return resolveInside(this.containersRoot, path.join(this.containersRoot, slug, "container.json"));
  }

  private backupFile(slug: string) {
    ensureSlug(slug);
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    return resolveInside(this.backupRoot, path.join(this.backupRoot, slug, `${stamp}.json`));
  }

  async list() {
    const entries = await fs.readdir(this.containersRoot, { withFileTypes: true });
    const specs = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => this.read(entry.name))
    );
    return specs.sort((a, b) => readTitle(a).localeCompare(readTitle(b), "ko"));
  }

  async read(slug: string) {
    const filePath = this.containerFile(slug);
    try {
      const file = await fs.readFile(filePath, "utf8");
      return readContainerSpecJson(file);
    } catch (error) {
      if (isNotFoundError(error)) throw notFound(`Container not found: ${slug}.`);
      throw error;
    }
  }

  async create(input: CreateContainerInput) {
    ensureSlug(input.slug);
    if (input.title.trim().length === 0) throw badRequest("title is required.");

    const spec = createInitialSpec({ slug: input.slug, title: input.title.trim() });
    const filePath = this.containerFile(input.slug);
    return this.enqueue(input.slug, async () => {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      try {
        await fs.writeFile(filePath, `${JSON.stringify(spec, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
      } catch (error) {
        if (isAlreadyExistsError(error)) throw conflict(`Container already exists: ${input.slug}.`);
        throw error;
      }
      await this.syncRegistryIfDefaultRoot();
      return spec;
    });
  }

  async update(slug: string, rawSpec: unknown) {
    const spec = prepareContainerForSave(slug, rawSpec);
    const filePath = this.containerFile(slug);

    return this.enqueue(slug, async () => {
      let previous: string | undefined;
      try {
        previous = await fs.readFile(filePath, "utf8");
      } catch (error) {
        if (isNotFoundError(error)) throw notFound(`Container not found: ${slug}.`);
        throw error;
      }

      if (previous) await this.writeBackup(slug, previous);
      await this.writeAtomic(filePath, `${JSON.stringify(spec, null, 2)}\n`);
      await this.syncRegistryIfDefaultRoot();
      return spec;
    });
  }

  async delete(slug: string) {
    const filePath = this.containerFile(slug);
    const containerDir = path.dirname(filePath);

    return this.enqueue(slug, async () => {
      let previous: string | undefined;
      try {
        previous = await fs.readFile(filePath, "utf8");
      } catch (error) {
        if (isNotFoundError(error)) throw notFound(`Container not found: ${slug}.`);
        throw error;
      }

      if (previous) await this.writeBackup(slug, previous);
      await fs.rm(containerDir, { recursive: true });
      await this.syncRegistryIfDefaultRoot();
    });
  }

  private async writeBackup(slug: string, file: string) {
    const backupPath = this.backupFile(slug);
    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    await fs.writeFile(backupPath, file, "utf8");
  }

  private async writeAtomic(filePath: string, body: string) {
    const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    try {
      await fs.writeFile(tempPath, body, "utf8");
      await fs.rename(tempPath, filePath);
    } catch (error) {
      await fs.unlink(tempPath).catch(() => undefined);
      throw error;
    }
  }

  private enqueue<T>(slug: string, work: () => Promise<T>): Promise<T> {
    const current = writeQueues.get(slug) ?? Promise.resolve();
    const next = current.then(work, work);
    const stored = next
      .catch(() => undefined)
      .finally(() => {
        if (writeQueues.get(slug) === stored) writeQueues.delete(slug);
      });
    writeQueues.set(slug, stored);
    return next;
  }
}

function isNotFoundError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

function isAlreadyExistsError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "EEXIST";
}
