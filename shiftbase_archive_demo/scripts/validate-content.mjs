import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentRoot = path.join(root, "content", "containers");
const allowedBlockTypes = new Set([
  "code-canvas",
  "intro-summary",
  "image-definition",
  "block-board",
  "state-summary",
  "example-list",
  "candidate-select",
  "quiz",
  "checklist",
  "result-card"
]);

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

function isStringArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "string");
}

function pushStringError(errors, value, field) {
  if (!isNonEmptyString(value)) errors.push(`${field} must be a non-empty string.`);
}

function pushStringArrayError(errors, value, field) {
  if (!isStringArray(value)) errors.push(`${field} must be a non-empty string array.`);
}

function validateStateBinding(errors, value, field, required = false) {
  if (value === undefined) {
    if (required) errors.push(`${field} is required.`);
    return;
  }
  if (!isObject(value)) {
    errors.push(`${field} must be an object.`);
    return;
  }
  pushStringError(errors, value.key, `${field}.key`);
}

function validateStringRecord(errors, value, field) {
  if (value === undefined) return;
  if (!isObject(value) || Object.keys(value).length === 0) {
    errors.push(`${field} must be a non-empty object.`);
    return;
  }
  Object.entries(value).forEach(([key, entryValue]) => {
    if (!key.trim()) errors.push(`${field} must not contain an empty key.`);
    if (typeof entryValue !== "string") errors.push(`${field}.${key} must be a string.`);
  });
}

function validatePromptHistory(errors, value, field) {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    errors.push(`${field} must be an array.`);
    return;
  }
  value.forEach((entry, index) => {
    const entryField = `${field}[${index}]`;
    if (!isObject(entry)) {
      errors.push(`${entryField} must be an object.`);
      return;
    }
    if (!["user", "assistant"].includes(entry.role)) errors.push(`${entryField}.role must be user or assistant.`);
    pushStringError(errors, entry.text, `${entryField}.text`);
    pushStringError(errors, entry.createdAt, `${entryField}.createdAt`);
  });
}

function validateBlockProps(errors, block, field) {
  if (!allowedBlockTypes.has(block.type)) {
    errors.push(`${field}.type is not registered: ${String(block.type)}.`);
    return;
  }
  if (!isObject(block.props)) {
    errors.push(`${field}.props must be an object.`);
    return;
  }

  if (block.type === "code-canvas") {
    if (!["html", "react", "canvas", "image", "mixed"].includes(block.props.kind)) {
      errors.push(`${field}.props.kind must be html, react, canvas, image, or mixed.`);
    }
    if (block.props.artifactId !== undefined) pushStringError(errors, block.props.artifactId, `${field}.props.artifactId`);
    pushStringError(errors, block.props.prompt, `${field}.props.prompt`);
    validatePromptHistory(errors, block.props.promptHistory, `${field}.props.promptHistory`);
    pushStringError(errors, block.props.code, `${field}.props.code`);
    if (block.props.entry !== undefined) pushStringError(errors, block.props.entry, `${field}.props.entry`);
    validateStringRecord(errors, block.props.files, `${field}.props.files`);
    if (isObject(block.props.files) && typeof block.props.entry === "string" && !(block.props.entry in block.props.files)) {
      errors.push(`${field}.props.entry must exist in ${field}.props.files.`);
    }
    if (block.props.runtime !== "sandboxed-iframe") {
      errors.push(`${field}.props.runtime must be sandboxed-iframe.`);
    }
    if (typeof block.props.version !== "number" || !Number.isFinite(block.props.version)) {
      errors.push(`${field}.props.version must be a finite number.`);
    }
    if (
      block.props.status !== undefined &&
      !["draft", "generating", "generated", "verified", "failed"].includes(block.props.status)
    ) {
      errors.push(`${field}.props.status must be draft, generating, generated, verified, or failed.`);
    }
    if (block.props.generatedAt !== undefined) pushStringError(errors, block.props.generatedAt, `${field}.props.generatedAt`);
    if (block.props.model !== undefined) pushStringError(errors, block.props.model, `${field}.props.model`);
    if (block.props.lastError !== undefined) pushStringError(errors, block.props.lastError, `${field}.props.lastError`);
  }
  if (block.type === "intro-summary") {
    if (Object.prototype.hasOwnProperty.call(block.props, "duration")) {
      errors.push(`${field}.props.duration has been retired from the container spec.`);
    }
    pushStringArrayError(errors, block.props.outputs, `${field}.props.outputs`);
  }
  if (block.type === "image-definition") {
    pushStringError(errors, block.props.image, `${field}.props.image`);
    pushStringError(errors, block.props.alt, `${field}.props.alt`);
    pushStringError(errors, block.props.label, `${field}.props.label`);
    pushStringError(errors, block.props.text, `${field}.props.text`);
  }
  if (block.type === "block-board") {
    if (!Array.isArray(block.props.blockGroups) || block.props.blockGroups.length === 0) {
      errors.push(`${field}.props.blockGroups must be a non-empty array.`);
    } else {
      block.props.blockGroups.forEach((group, groupIndex) => {
        const groupField = `${field}.props.blockGroups[${groupIndex}]`;
        if (!isObject(group)) {
          errors.push(`${groupField} must be an object.`);
          return;
        }
        pushStringError(errors, group.title, `${groupField}.title`);
        pushStringError(errors, group.description, `${groupField}.description`);
        if (!Array.isArray(group.blocks) || group.blocks.length === 0) {
          errors.push(`${groupField}.blocks must be a non-empty array.`);
          return;
        }
        group.blocks.forEach((timelineBlock, timelineBlockIndex) => {
          const timelineBlockField = `${groupField}.blocks[${timelineBlockIndex}]`;
          if (!isObject(timelineBlock)) {
            errors.push(`${timelineBlockField} must be an object.`);
            return;
          }
          pushStringError(errors, timelineBlock.id, `${timelineBlockField}.id`);
          pushStringError(errors, timelineBlock.label, `${timelineBlockField}.label`);
          if (!["input", "organize", "judge"].includes(timelineBlock.category)) {
            errors.push(`${timelineBlockField}.category must be input, organize, or judge.`);
          }
          pushStringError(errors, timelineBlock.description, `${timelineBlockField}.description`);
          pushStringError(errors, timelineBlock.axReason, `${timelineBlockField}.axReason`);
          pushStringArrayError(errors, timelineBlock.examples, `${timelineBlockField}.examples`);
        });
      });
    }
  }
  if (block.type === "example-list") {
    if (!Array.isArray(block.props.examples) || block.props.examples.length === 0) {
      errors.push(`${field}.props.examples must be a non-empty array.`);
    } else {
      block.props.examples.forEach((exampleGroup, exampleGroupIndex) => {
        const exampleGroupField = `${field}.props.examples[${exampleGroupIndex}]`;
        if (!isObject(exampleGroup)) {
          errors.push(`${exampleGroupField} must be an object.`);
          return;
        }
        pushStringError(errors, exampleGroup.title, `${exampleGroupField}.title`);
        pushStringArrayError(errors, exampleGroup.items, `${exampleGroupField}.items`);
      });
    }
  }
  if (block.type === "quiz") {
    pushStringError(errors, block.props.question, `${field}.props.question`);
    pushStringArrayError(errors, block.props.options, `${field}.props.options`);
  }
  if (block.type === "checklist") {
    pushStringError(errors, block.props.title, `${field}.props.title`);
    pushStringArrayError(errors, block.props.items, `${field}.props.items`);
  }
  if (block.type === "result-card") {
    pushStringError(errors, block.props.title, `${field}.props.title`);
  }
}

function validateSpec(spec, file) {
  const errors = [];
  const ids = new Set();
  const writtenStateKeys = new Set();

  const registerId = (id, field) => {
    if (!isNonEmptyString(id)) {
      errors.push(`${field} must be a non-empty string.`);
      return;
    }
    if (ids.has(id)) errors.push(`${field} is duplicated: ${id}.`);
    ids.add(id);
  };

  if (!isObject(spec)) return [`${file}: root must be an object.`];

  registerId(spec.id, "id");
  pushStringError(errors, spec.slug, "slug");
  if (isNonEmptyString(spec.slug) && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(spec.slug)) {
    errors.push("slug must be URL-safe kebab-case.");
  }
  pushStringError(errors, spec.title, "title");
  pushStringError(errors, spec.summary, "summary");
  if (spec.coverImage !== undefined) pushStringError(errors, spec.coverImage, "coverImage");
  if (spec.updatedAt !== undefined) pushStringError(errors, spec.updatedAt, "updatedAt");
  if (Object.prototype.hasOwnProperty.call(spec, "duration")) {
    errors.push("duration has been retired from the container spec.");
  }
  if (spec.status !== "draft" && spec.status !== "published") errors.push("status must be draft or published.");
  if (spec.access !== "free" && spec.access !== "paid") errors.push("access must be free or paid.");
  pushStringError(errors, spec.hub, "hub");
  pushStringArrayError(errors, spec.tracks, "tracks");
  pushStringArrayError(errors, spec.audience, "audience");
  if (!["beginner", "intermediate", "advanced"].includes(spec.difficulty)) {
    errors.push("difficulty must be beginner, intermediate, or advanced.");
  }
  pushStringArrayError(errors, spec.outcomes, "outcomes");
  pushStringArrayError(errors, spec.outputs, "outputs");

  if (!Array.isArray(spec.modules) || spec.modules.length === 0) {
    errors.push("modules must be a non-empty array.");
    return errors;
  }

  spec.modules.forEach((module, moduleIndex) => {
    const moduleField = `modules[${moduleIndex}]`;
    if (!isObject(module)) {
      errors.push(`${moduleField} must be an object.`);
      return;
    }
    registerId(module.id, `${moduleField}.id`);
    pushStringError(errors, module.title, `${moduleField}.title`);
    if (Object.prototype.hasOwnProperty.call(module, "summary")) {
      errors.push(`${moduleField}.summary has been retired from the module spec.`);
    }
    if (Object.prototype.hasOwnProperty.call(module, "coverImage")) {
      errors.push(`${moduleField}.coverImage has been retired from the module spec.`);
    }
    if (!Array.isArray(module.lessons) || module.lessons.length === 0) {
      errors.push(`${moduleField}.lessons must be a non-empty array.`);
      return;
    }

    module.lessons.forEach((lesson, lessonIndex) => {
      const lessonField = `${moduleField}.lessons[${lessonIndex}]`;
      if (!isObject(lesson)) {
        errors.push(`${lessonField} must be an object.`);
        return;
      }
      registerId(lesson.id, `${lessonField}.id`);
      pushStringError(errors, lesson.title, `${lessonField}.title`);
      if (Object.prototype.hasOwnProperty.call(lesson, "estimatedTime")) {
        errors.push(`${lessonField}.estimatedTime has been retired from the container spec.`);
      }
      if (!Array.isArray(lesson.pages) || lesson.pages.length === 0) {
        errors.push(`${lessonField}.pages must be a non-empty array.`);
        return;
      }

      lesson.pages.forEach((page, pageIndex) => {
        const pageField = `${lessonField}.pages[${pageIndex}]`;
        if (!isObject(page)) {
          errors.push(`${pageField} must be an object.`);
          return;
        }
        registerId(page.id, `${pageField}.id`);
        pushStringError(errors, page.title, `${pageField}.title`);
        if (!isObject(page.left)) {
          errors.push(`${pageField}.left must be an object.`);
        } else {
          pushStringError(errors, page.left.title, `${pageField}.left.title`);
          if (Object.prototype.hasOwnProperty.call(page.left, "bodyMarkdown") && typeof page.left.bodyMarkdown !== "string") {
            errors.push(`${pageField}.left.bodyMarkdown must be a string.`);
          }
          pushStringArrayError(errors, page.left.paragraphs, `${pageField}.left.paragraphs`);
          if (Object.prototype.hasOwnProperty.call(page.left, "checkpoints") && !isStringArray(page.left.checkpoints)) {
            errors.push(`${pageField}.left.checkpoints must be a string array.`);
          }
        }
        if (!isObject(page.workspace)) {
          errors.push(`${pageField}.workspace must be an object.`);
          return;
        }
        if (!["stack", "grid", "split", "focus"].includes(page.workspace.layout)) {
          errors.push(`${pageField}.workspace.layout must be stack, grid, split, or focus.`);
        }
        if (!Array.isArray(page.workspace.blocks)) {
          errors.push(`${pageField}.workspace.blocks must be an array.`);
          return;
        }

        page.workspace.blocks.forEach((block, blockIndex) => {
          const blockField = `${pageField}.workspace.blocks[${blockIndex}]`;
          if (!isObject(block)) {
            errors.push(`${blockField} must be an object.`);
            return;
          }
          registerId(block.id, `${blockField}.id`);
          validateBlockProps(errors, block, blockField);
          validateStateBinding(errors, block.reads, `${blockField}.reads`);
          validateStateBinding(errors, block.writes, `${blockField}.writes`);
          if (block.type === "block-board") validateStateBinding(errors, block.writes, `${blockField}.writes`, true);
          if (block.type === "state-summary") validateStateBinding(errors, block.reads, `${blockField}.reads`, true);
          if (block.type === "candidate-select") {
            validateStateBinding(errors, block.reads, `${blockField}.reads`, true);
            validateStateBinding(errors, block.writes, `${blockField}.writes`, true);
          }
          if (isObject(block.reads) && isNonEmptyString(block.reads.key) && !writtenStateKeys.has(block.reads.key)) {
            errors.push(`${blockField}.reads.key references state before it is written: ${block.reads.key}.`);
          }
          if (isObject(block.writes) && isNonEmptyString(block.writes.key)) writtenStateKeys.add(block.writes.key);
        });
      });
    });
  });

  return errors;
}

const files = fs
  .readdirSync(contentRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(contentRoot, entry.name, "container.json"))
  .filter((file) => fs.existsSync(file));

let failureCount = 0;
for (const file of files) {
  const relativeFile = path.relative(root, file);
  const spec = JSON.parse(fs.readFileSync(file, "utf8"));
  const errors = validateSpec(spec, relativeFile);
  if (errors.length === 0) {
    console.log(`OK ${relativeFile}`);
    continue;
  }
  failureCount += 1;
  console.error(`FAIL ${relativeFile}`);
  for (const error of errors) console.error(`  - ${error}`);
}

if (failureCount > 0) process.exit(1);
console.log(`Validated ${files.length} container spec(s).`);
