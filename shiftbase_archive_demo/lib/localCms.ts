import { containerService, isAuthoringBackendEnabled } from "@/lib/backend/containerService";

export function isLocalCmsEnabled() {
  return isAuthoringBackendEnabled();
}

export async function readLocalContainerSpec(slug: string) {
  return containerService.readContainer(slug);
}

export async function readLocalContainerSpecs() {
  return containerService.listContainers();
}

export async function createLocalContainerSpec(slug: string, title: string) {
  return containerService.createContainer({ slug, title });
}

export async function writeLocalContainerSpec(slug: string, rawSpec: unknown) {
  return containerService.updateContainer(slug, rawSpec);
}
