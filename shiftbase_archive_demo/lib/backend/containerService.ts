import { disabled } from "@/lib/backend/errors";
import { LocalFileContainerRepository } from "@/lib/backend/localFileContainerRepository";
import type { ContainerRepository } from "@/lib/backend/containerRepository";

type AuthoringBackendProvider = "local-file";

let repository: ContainerRepository | undefined;

export function getAuthoringBackendProvider(): AuthoringBackendProvider | undefined {
  const provider = process.env.SHIFTBASE_AUTHORING_BACKEND;
  if (provider === "local-file") return provider;
  if (process.env.NODE_ENV !== "production") return "local-file";
  return undefined;
}

export function isAuthoringBackendEnabled() {
  return getAuthoringBackendProvider() !== undefined;
}

export function requireAuthoringBackend() {
  if (!isAuthoringBackendEnabled()) {
    throw disabled("Authoring backend is disabled. Set SHIFTBASE_AUTHORING_BACKEND=local-file only in trusted operator environments.");
  }
}

function getRepository() {
  requireAuthoringBackend();
  if (repository) return repository;

  repository = new LocalFileContainerRepository();
  return repository;
}

export const containerService = {
  async listContainers() {
    return getRepository().list();
  },
  async readContainer(slug: string) {
    return getRepository().read(slug);
  },
  async createContainer(input: { slug: string; title: string }) {
    return getRepository().create(input);
  },
  async updateContainer(slug: string, spec: unknown) {
    return getRepository().update(slug, spec);
  },
  async deleteContainer(slug: string) {
    return getRepository().delete(slug);
  }
};
