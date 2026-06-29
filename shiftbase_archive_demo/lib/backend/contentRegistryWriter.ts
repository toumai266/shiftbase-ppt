import { promises as fs } from "fs";
import path from "path";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function toIdentifier(slug: string) {
  return `${slug
    .split("-")
    .map((part, index) => {
      const normalized = part.replace(/[^a-zA-Z0-9]/g, "");
      if (index === 0) return normalized;
      return `${normalized.slice(0, 1).toUpperCase()}${normalized.slice(1)}`;
    })
    .join("")}Container`;
}

function renderRegistry(slugs: string[]) {
  const imports = slugs
    .map((slug) => `import ${toIdentifier(slug)} from "@/content/containers/${slug}/container.json";`)
    .join("\n");
  const items = slugs.map((slug) => `  ${toIdentifier(slug)}`).join(",\n");

  return `// This file is generated from content/containers.
// Run \`npm run generate:content-registry\` after adding or removing containers.

${imports}

export const rawContainerSpecs = [
${items}
] as unknown[];
`;
}

export async function syncContainerRegistry(containersRoot: string) {
  const entries = await fs.readdir(containersRoot, { withFileTypes: true });
  const slugs = (
    await Promise.all(
      entries
        .filter((entry) => entry.isDirectory() && slugPattern.test(entry.name))
        .map(async (entry) => {
          const filePath = path.join(containersRoot, entry.name, "container.json");
          try {
            await fs.access(filePath);
            return entry.name;
          } catch {
            return undefined;
          }
        })
    )
  )
    .filter((slug): slug is string => typeof slug === "string")
    .sort((a, b) => a.localeCompare(b, "en"));

  const registryPath = path.join(process.cwd(), "lib", "generated", "containerRegistry.ts");
  const body = renderRegistry(slugs);
  let current = "";
  try {
    current = await fs.readFile(registryPath, "utf8");
  } catch {
    // File will be created below.
  }
  if (current === body) return;

  await fs.mkdir(path.dirname(registryPath), { recursive: true });
  await fs.writeFile(registryPath, body, "utf8");
}
