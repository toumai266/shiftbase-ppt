import { promises as fs } from "fs";
import path from "path";
import { badRequest, notFound } from "@/lib/backend/errors";
import type { EvaluationThread, EvaluationThreadSummary } from "@/lib/backend/evaluationTypes";

const threadIdPattern = /^eval-[a-z0-9]+-[a-z0-9]+$/;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveInside(root: string, filePath: string) {
  const resolvedRoot = path.resolve(root);
  const resolvedFile = path.resolve(filePath);
  const relative = path.relative(resolvedRoot, resolvedFile);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw badRequest("Resolved path escapes the evaluation directory.");
  }
  return resolvedFile;
}

function ensureThreadId(threadId: string) {
  if (!threadIdPattern.test(threadId)) throw badRequest("Invalid evaluation thread id.");
}

function createThreadId() {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `eval-${time}-${random}`;
}

function readThreadJson(file: string) {
  const parsed = JSON.parse(file) as unknown;
  if (!isObject(parsed) || typeof parsed.id !== "string") {
    throw badRequest("Evaluation thread file is invalid.");
  }
  return parsed as EvaluationThread;
}

function summarizeThread(thread: EvaluationThread): EvaluationThreadSummary {
  const lastRun = thread.runs.at(-1);
  return {
    id: thread.id,
    containerSlug: thread.containerSlug,
    title: thread.title,
    issue: thread.issue,
    scope: thread.scope,
    scopeTitle: thread.scopeSnapshot.title,
    scopePath: thread.scopeSnapshot.path,
    runCount: thread.runs.length,
    lastStatus: lastRun?.status,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt
  };
}

export class LocalEvaluationThreadRepository {
  private readonly root: string;

  constructor(root = path.join(process.cwd(), ".shiftbase", "evaluations")) {
    this.root = root;
  }

  private threadFile(threadId: string) {
    ensureThreadId(threadId);
    return resolveInside(this.root, path.join(this.root, `${threadId}.json`));
  }

  async list(containerSlug?: string): Promise<EvaluationThreadSummary[]> {
    await fs.mkdir(this.root, { recursive: true });
    const entries = await fs.readdir(this.root, { withFileTypes: true }).catch(() => []);
    const threads = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
        .map(async (entry) => {
          const filePath = resolveInside(this.root, path.join(this.root, entry.name));
          const file = await fs.readFile(filePath, "utf8");
          return readThreadJson(file);
        })
    );

    return threads
      .filter((thread) => !containerSlug || thread.containerSlug === containerSlug)
      .map(summarizeThread)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async read(threadId: string) {
    const filePath = this.threadFile(threadId);
    try {
      return readThreadJson(await fs.readFile(filePath, "utf8"));
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
        throw notFound(`Evaluation thread not found: ${threadId}.`);
      }
      throw error;
    }
  }

  async create(input: Omit<EvaluationThread, "id">) {
    const thread: EvaluationThread = {
      ...input,
      id: createThreadId()
    };
    await this.write(thread);
    return thread;
  }

  async update(thread: EvaluationThread) {
    ensureThreadId(thread.id);
    await this.write(thread);
    return thread;
  }

  private async write(thread: EvaluationThread) {
    const filePath = this.threadFile(thread.id);
    const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    try {
      await fs.writeFile(tempPath, `${JSON.stringify(thread, null, 2)}\n`, "utf8");
      await fs.rename(tempPath, filePath);
    } catch (error) {
      await fs.unlink(tempPath).catch(() => undefined);
      throw error;
    }
  }
}
