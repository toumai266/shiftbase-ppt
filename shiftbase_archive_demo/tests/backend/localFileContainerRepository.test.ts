import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { BackendError } from "@/lib/backend/errors";
import { isAuthoringBackendEnabled, requireAuthoringBackend } from "@/lib/backend/containerService";
import { LocalFileContainerRepository } from "@/lib/backend/localFileContainerRepository";

let tempRoot = "";

beforeEach(async () => {
  tempRoot = await mkdtemp(path.join(os.tmpdir(), "shiftbase-backend-"));
});

afterEach(async () => {
  await rm(tempRoot, { recursive: true, force: true });
  delete process.env.SHIFTBASE_AUTHORING_BACKEND;
});

describe("LocalFileContainerRepository", () => {
  it("creates and reads a valid draft container", async () => {
    const repository = new LocalFileContainerRepository(tempRoot);

    const created = await repository.create({ slug: "sales-ai-basics", title: "Sales AI Basics" });
    const read = await repository.read("sales-ai-basics");

    assert.equal(created.slug, "sales-ai-basics");
    assert.equal(read.title, "Sales AI Basics");
    assert.equal(read.status, "draft");
    assert.equal(read.modules[0]?.lessons[0]?.pages[0]?.workspace.blocks[0]?.type, "code-canvas");
  });

  it("rejects invalid slugs before touching the filesystem", async () => {
    const repository = new LocalFileContainerRepository(tempRoot);

    await assert.rejects(
      () => repository.create({ slug: "../escape", title: "Escape" }),
      (error) => error instanceof BackendError && error.code === "BAD_REQUEST"
    );

    assert.deepEqual(await readdir(tempRoot), []);
  });

  it("returns conflict for duplicate creation", async () => {
    const repository = new LocalFileContainerRepository(tempRoot);
    await repository.create({ slug: "duplicate-container", title: "Duplicate Container" });

    await assert.rejects(
      () => repository.create({ slug: "duplicate-container", title: "Duplicate Container" }),
      (error) => error instanceof BackendError && error.code === "CONFLICT"
    );
  });

  it("saves updates without running container spec validation", async () => {
    const repository = new LocalFileContainerRepository(tempRoot);
    const created = await repository.create({ slug: "safe-update", title: "Safe Update" });
    const filePath = path.join(tempRoot, "safe-update", "container.json");

    const updated = await repository.update("safe-update", { ...created, title: "" });
    const saved = JSON.parse(await readFile(filePath, "utf8")) as typeof updated;

    assert.equal(updated.title, "");
    assert.equal(saved.title, "");
    assert.equal(saved.slug, "safe-update");
  });

  it("writes a backup and leaves no temp file after a successful update", async () => {
    const repository = new LocalFileContainerRepository(tempRoot);
    const created = await repository.create({ slug: "backup-container", title: "Backup Container" });

    const updated = await repository.update("backup-container", {
      ...created,
      title: "Updated Backup Container"
    });

    assert.equal(updated.title, "Updated Backup Container");
    const containerDir = await readdir(path.join(tempRoot, "backup-container"));
    assert.deepEqual(containerDir, ["container.json"]);

    const backupRoot = path.join(process.cwd(), "content", ".backups", "containers", "backup-container");
    const backupFiles = await readdir(backupRoot).catch(() => []);
    assert.ok(backupFiles.length >= 1);

    await rm(backupRoot, { recursive: true, force: true });
  });
});

describe("authoring backend gate", () => {
  it("uses local files by default outside production", () => {
    const env = process.env as Record<string, string | undefined>;
    delete process.env.SHIFTBASE_AUTHORING_BACKEND;
    const previousNodeEnv = env.NODE_ENV;
    env.NODE_ENV = "development";
    assert.equal(isAuthoringBackendEnabled(), true);
    assert.doesNotThrow(() => requireAuthoringBackend());

    process.env.SHIFTBASE_AUTHORING_BACKEND = "local-file";
    assert.equal(isAuthoringBackendEnabled(), true);

    env.NODE_ENV = "production";
    delete process.env.SHIFTBASE_AUTHORING_BACKEND;
    assert.equal(isAuthoringBackendEnabled(), false);
    assert.throws(
      () => requireAuthoringBackend(),
      (error) => error instanceof BackendError && error.code === "DISABLED"
    );

    if (previousNodeEnv === undefined) {
      delete env.NODE_ENV;
    } else {
      env.NODE_ENV = previousNodeEnv;
    }
  });
});
