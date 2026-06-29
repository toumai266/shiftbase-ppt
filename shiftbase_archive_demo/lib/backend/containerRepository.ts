import type { ContainerSpec } from "@/lib/containerSpec";

export type CreateContainerInput = {
  slug: string;
  title: string;
};

export type ContainerRepository = {
  list(): Promise<ContainerSpec[]>;
  read(slug: string): Promise<ContainerSpec>;
  create(input: CreateContainerInput): Promise<ContainerSpec>;
  update(slug: string, spec: unknown): Promise<ContainerSpec>;
  delete(slug: string): Promise<void>;
};
