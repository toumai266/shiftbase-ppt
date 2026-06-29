import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentRoot = path.join(root, "content", "containers");
const outputFile = path.join(root, "lib", "generated", "containerRegistry.ts");
const checkOnly = process.argv.includes("--check");

function toIdentifier(slug) {
  return `${slug
    .split("-")
    .map((part, index) => {
      const normalized = part.replace(/[^a-zA-Z0-9]/g, "");
      if (index === 0) return normalized;
      return `${normalized.slice(0, 1).toUpperCase()}${normalized.slice(1)}`;
    })
    .join("")}Container`;
}

function getContainerSlugs() {
  if (!fs.existsSync(contentRoot)) return [];

  return fs
    .readdirSync(contentRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    .filter((slug) => fs.existsSync(path.join(contentRoot, slug, "container.json")))
    .sort((a, b) => a.localeCompare(b, "en"));
}

function renderRegistry(slugs) {
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

const nextBody = renderRegistry(getContainerSlugs());
const currentBody = fs.existsSync(outputFile) ? fs.readFileSync(outputFile, "utf8") : "";

if (checkOnly) {
  if (currentBody !== nextBody) {
    console.error("lib/generated/containerRegistry.ts is out of sync with content/containers.");
    console.error("Run `npm run generate:content-registry`.");
    process.exit(1);
  }
  process.exit(0);
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, nextBody, "utf8");
console.log(`Generated ${path.relative(root, outputFile)} from ${getContainerSlugs().length} container(s).`);
