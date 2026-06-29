import { rawContainerSpecs } from "@/lib/generated/containerRegistry";
import { isWorkspaceBlockType, type WorkspaceBlockType } from "@/lib/workspaceBlockRegistry";

export type ContainerStatus = "draft" | "published";
export type ContainerAccess = "free" | "paid";
export type ContainerDifficulty = "beginner" | "intermediate" | "advanced";
export type TimelineBlockCategory = "input" | "organize" | "judge";
export type WorkspaceLayout = "stack" | "grid" | "split" | "focus";
export type AgentArtifactKind = "html" | "react" | "canvas" | "image" | "mixed";
export type AgentArtifactStatus = "draft" | "generating" | "generated" | "verified" | "failed";

export type TimelineBlock = {
  id: string;
  label: string;
  category: TimelineBlockCategory;
  description: string;
  axReason: string;
  examples: string[];
};

export type TimelineBlockGroup = {
  title: string;
  description: string;
  blocks: TimelineBlock[];
};

export type ExampleGroup = {
  title: string;
  items: string[];
};

export type ContainerPricing = {
  originalPrice: number;
  discountRate: number;
};

export type ContainerRecommendation = {
  image: string;
  text: string;
};

export type LearningExperienceMode = "split" | "slide";
export type PracticePattern = "side-workspace" | "slide-practice";

export type ContainerLearningExperience = {
  mode: LearningExperienceMode;
  primaryHook?: boolean;
  practicePattern?: PracticePattern;
  description?: string;
};

export type StateBinding = {
  key: string;
};

export type AgentArtifactPromptEntry = {
  role: "user" | "assistant";
  text: string;
  createdAt: string;
};

export type AgentArtifactAsset = {
  path: string;
  mime: string;
  role?: string;
};

export type LessonReadingSpec = {
  eyebrow?: string;
  title: string;
  bodyMarkdown?: string;
  paragraphs: string[];
  checkpoints?: string[];
  footnote?: string;
};

export type SlideElementType = "heading" | "text" | "callout" | "list";

export type SlideElementSpec = {
  id: string;
  type: SlideElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
};

type WorkspaceBlockBase<TType extends WorkspaceBlockType, TProps> = {
  id: string;
  type: TType;
  reads?: StateBinding;
  writes?: StateBinding;
  props: TProps;
};

export type LessonWorkspaceBlock =
  | WorkspaceBlockBase<
      "code-canvas",
      {
        kind: AgentArtifactKind;
        artifactId?: string;
        prompt: string;
        promptHistory?: AgentArtifactPromptEntry[];
        code: string;
        entry?: string;
        files?: Record<string, string>;
        assets?: AgentArtifactAsset[];
        runtime: "sandboxed-iframe";
        version: number;
        status?: AgentArtifactStatus;
        notes?: string;
        history?: Array<{
          role: "user" | "assistant";
          text: string;
          createdAt: string;
        }>;
        generatedAt?: string;
        model?: string;
        lastError?: string;
      }
    >
  | WorkspaceBlockBase<
      "intro-summary",
      {
        outputs: string[];
      }
    >
  | WorkspaceBlockBase<
      "image-definition",
      {
        image: string;
        alt: string;
        label: string;
        text: string;
        presentation?: "cover" | "reference";
      }
    >
  | WorkspaceBlockBase<
      "block-board",
      {
        blockGroups: TimelineBlockGroup[];
      }
    >
  | WorkspaceBlockBase<"state-summary", Record<string, never>>
  | WorkspaceBlockBase<
      "example-list",
      {
        examples: ExampleGroup[];
      }
    >
  | WorkspaceBlockBase<"candidate-select", Record<string, never>>
  | WorkspaceBlockBase<
      "quiz",
      {
        question: string;
        options: string[];
        answer?: string;
      }
    >
  | WorkspaceBlockBase<
      "checklist",
      {
        title: string;
        items: string[];
      }
    >
  | WorkspaceBlockBase<
      "result-card",
      {
        title: string;
        emptyText?: string;
      }
    >;

export type PageSpec = {
  id: string;
  title: string;
  left: LessonReadingSpec;
  slideElements?: SlideElementSpec[];
  workspace: {
    layout: WorkspaceLayout;
    blocks: LessonWorkspaceBlock[];
  };
};

export type LessonSpec = {
  id: string;
  title: string;
  pages: PageSpec[];
};

export type ModuleSpec = {
  id: string;
  title: string;
  lessons: LessonSpec[];
};

export type ContainerSpec = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverImage?: string;
  updatedAt?: string;
  introMarkdown?: string;
  pricing?: ContainerPricing;
  recommendationCards?: ContainerRecommendation[];
  learningExperience?: ContainerLearningExperience;
  displayBadges?: string[];
  status: ContainerStatus;
  access: ContainerAccess;
  hub: string;
  tracks: string[];
  audience: string[];
  difficulty: ContainerDifficulty;
  outcomes: string[];
  outputs: string[];
  modules: ModuleSpec[];
};

export type InteractiveLesson = {
  courseSlug: string;
  lessonSlug: string;
  courseTitle: string;
  title: string;
  subtitle: string;
  learningExperience?: ContainerLearningExperience;
  pages: LessonPage[];
};

export type LessonPage = PageSpec & {
  moduleTitle: string;
};

function canExposeContainerOnLearningSurface(container: ContainerSpec) {
  return container.status === "published" || process.env.NODE_ENV !== "production";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function assertString(value: unknown, path: string, errors: string[]) {
  if (typeof value !== "string" || value.length === 0) errors.push(`${path} must be a non-empty string.`);
}

function assertStringArray(value: unknown, path: string, errors: string[]) {
  if (!isStringArray(value) || value.length === 0) errors.push(`${path} must be a non-empty string array.`);
}

function assertOptionalStringArray(value: unknown, path: string, errors: string[]) {
  if (value !== undefined && !isStringArray(value)) errors.push(`${path} must be a string array.`);
}

function assertNumber(value: unknown, path: string, errors: string[]) {
  if (typeof value !== "number" || !Number.isFinite(value)) errors.push(`${path} must be a finite number.`);
}

function assertOptionalString(value: unknown, path: string, errors: string[]) {
  if (value !== undefined) assertString(value, path, errors);
}

function validateStringRecord(value: unknown, path: string, errors: string[]) {
  if (value === undefined) return;
  if (!isObject(value) || Object.keys(value).length === 0) {
    errors.push(`${path} must be a non-empty object.`);
    return;
  }
  Object.entries(value).forEach(([key, entryValue]) => {
    if (!key.trim()) errors.push(`${path} must not contain an empty key.`);
    if (typeof entryValue !== "string") errors.push(`${path}.${key} must be a string.`);
  });
}

function validatePromptHistory(value: unknown, path: string, errors: string[]) {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array.`);
    return;
  }
  value.forEach((entry, index) => {
    const entryPath = `${path}[${index}]`;
    if (!isObject(entry)) {
      errors.push(`${entryPath} must be an object.`);
      return;
    }
    if (entry.role !== "user" && entry.role !== "assistant") {
      errors.push(`${entryPath}.role must be user or assistant.`);
    }
    assertString(entry.text, `${entryPath}.text`, errors);
    assertString(entry.createdAt, `${entryPath}.createdAt`, errors);
  });
}

function validateArtifactAssets(value: unknown, path: string, errors: string[]) {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array.`);
    return;
  }
  value.forEach((asset, index) => {
    const assetPath = `${path}[${index}]`;
    if (!isObject(asset)) {
      errors.push(`${assetPath} must be an object.`);
      return;
    }
    assertString(asset.path, `${assetPath}.path`, errors);
    assertString(asset.mime, `${assetPath}.mime`, errors);
    assertOptionalString(asset.role, `${assetPath}.role`, errors);
  });
}

function validateLearningExperience(value: unknown, path: string, errors: string[]) {
  if (value === undefined) return;
  if (!isObject(value)) {
    errors.push(`${path} must be an object.`);
    return;
  }
  if (value.mode !== "split" && value.mode !== "slide") {
    errors.push(`${path}.mode must be split or slide.`);
  }
  if (value.primaryHook !== undefined && typeof value.primaryHook !== "boolean") {
    errors.push(`${path}.primaryHook must be a boolean.`);
  }
  if (
    value.practicePattern !== undefined &&
    value.practicePattern !== "side-workspace" &&
    value.practicePattern !== "slide-practice"
  ) {
    errors.push(`${path}.practicePattern must be side-workspace or slide-practice.`);
  }
  assertOptionalString(value.description, `${path}.description`, errors);
}

function validateSlideElementType(value: unknown, path: string, errors: string[]) {
  if (
    value !== "heading" &&
    value !== "text" &&
    value !== "callout" &&
    value !== "list"
  ) {
    errors.push(`${path} must be heading, text, callout, or list.`);
  }
}

function validateSlidePercent(value: unknown, path: string, errors: string[], min: number, max: number) {
  assertNumber(value, path, errors);
  if (typeof value === "number" && Number.isFinite(value) && (value < min || value > max)) {
    errors.push(`${path} must be between ${min} and ${max}.`);
  }
}

function validateBlockProps(block: Record<string, unknown>, path: string, errors: string[]) {
  if (typeof block.type !== "string") {
    errors.push(`${path}.type must be a string.`);
    return;
  }
  if (!isWorkspaceBlockType(block.type)) {
    errors.push(`${path}.type uses an unregistered block type: ${block.type}.`);
    return;
  }
  if (!isObject(block.props)) {
    errors.push(`${path}.props must be an object.`);
    return;
  }

  if (block.type === "code-canvas") {
    if (
      block.props.kind !== "html" &&
      block.props.kind !== "react" &&
      block.props.kind !== "canvas" &&
      block.props.kind !== "image" &&
      block.props.kind !== "mixed"
    ) {
      errors.push(`${path}.props.kind must be html, react, canvas, image, or mixed.`);
    }
    assertOptionalString(block.props.artifactId, `${path}.props.artifactId`, errors);
    assertString(block.props.prompt, `${path}.props.prompt`, errors);
    validatePromptHistory(block.props.promptHistory, `${path}.props.promptHistory`, errors);
    assertString(block.props.code, `${path}.props.code`, errors);
    assertOptionalString(block.props.entry, `${path}.props.entry`, errors);
    validateStringRecord(block.props.files, `${path}.props.files`, errors);
    if (isObject(block.props.files) && typeof block.props.entry === "string" && !(block.props.entry in block.props.files)) {
      errors.push(`${path}.props.entry must exist in ${path}.props.files.`);
    }
    validateArtifactAssets(block.props.assets, `${path}.props.assets`, errors);
    if (block.props.runtime !== "sandboxed-iframe") {
      errors.push(`${path}.props.runtime must be sandboxed-iframe.`);
    }
    assertNumber(block.props.version, `${path}.props.version`, errors);
    if (
      block.props.status !== undefined &&
      block.props.status !== "draft" &&
      block.props.status !== "generating" &&
      block.props.status !== "generated" &&
      block.props.status !== "verified" &&
      block.props.status !== "failed"
    ) {
      errors.push(`${path}.props.status must be draft, generating, generated, verified, or failed.`);
    }
    if (block.props.notes !== undefined) assertString(block.props.notes, `${path}.props.notes`, errors);
    if (block.props.history !== undefined) {
      if (!Array.isArray(block.props.history)) {
        errors.push(`${path}.props.history must be an array.`);
      } else {
        block.props.history.forEach((item, itemIndex) => {
          const itemPath = `${path}.props.history[${itemIndex}]`;
          if (!isObject(item)) {
            errors.push(`${itemPath} must be an object.`);
            return;
          }
          if (item.role !== "user" && item.role !== "assistant") {
            errors.push(`${itemPath}.role must be user or assistant.`);
          }
          assertString(item.text, `${itemPath}.text`, errors);
          assertString(item.createdAt, `${itemPath}.createdAt`, errors);
        });
      }
    }
    if (block.props.generatedAt !== undefined) assertString(block.props.generatedAt, `${path}.props.generatedAt`, errors);
    if (block.props.model !== undefined) assertString(block.props.model, `${path}.props.model`, errors);
    if (block.props.lastError !== undefined) assertString(block.props.lastError, `${path}.props.lastError`, errors);
  }
  if (block.type === "intro-summary") {
    assertStringArray(block.props.outputs, `${path}.props.outputs`, errors);
  }
  if (block.type === "image-definition") {
    assertString(block.props.image, `${path}.props.image`, errors);
    assertString(block.props.alt, `${path}.props.alt`, errors);
    assertString(block.props.label, `${path}.props.label`, errors);
    assertString(block.props.text, `${path}.props.text`, errors);
    if (
      block.props.presentation !== undefined &&
      block.props.presentation !== "cover" &&
      block.props.presentation !== "reference"
    ) {
      errors.push(`${path}.props.presentation must be cover or reference.`);
    }
  }
  if (block.type === "block-board") {
    if (!Array.isArray(block.props.blockGroups) || block.props.blockGroups.length === 0) {
      errors.push(`${path}.props.blockGroups must be a non-empty array.`);
    } else {
      block.props.blockGroups.forEach((rawGroup, groupIndex) => {
        const groupPath = `${path}.props.blockGroups[${groupIndex}]`;
        if (!isObject(rawGroup)) {
          errors.push(`${groupPath} must be an object.`);
          return;
        }
        assertString(rawGroup.title, `${groupPath}.title`, errors);
        assertString(rawGroup.description, `${groupPath}.description`, errors);
        if (!Array.isArray(rawGroup.blocks) || rawGroup.blocks.length === 0) {
          errors.push(`${groupPath}.blocks must be a non-empty array.`);
          return;
        }
        rawGroup.blocks.forEach((rawTimelineBlock, timelineBlockIndex) => {
          const timelineBlockPath = `${groupPath}.blocks[${timelineBlockIndex}]`;
          if (!isObject(rawTimelineBlock)) {
            errors.push(`${timelineBlockPath} must be an object.`);
            return;
          }
          assertString(rawTimelineBlock.id, `${timelineBlockPath}.id`, errors);
          assertString(rawTimelineBlock.label, `${timelineBlockPath}.label`, errors);
          if (
            rawTimelineBlock.category !== "input" &&
            rawTimelineBlock.category !== "organize" &&
            rawTimelineBlock.category !== "judge"
          ) {
            errors.push(`${timelineBlockPath}.category must be input, organize, or judge.`);
          }
          assertString(rawTimelineBlock.description, `${timelineBlockPath}.description`, errors);
          assertString(rawTimelineBlock.axReason, `${timelineBlockPath}.axReason`, errors);
          assertStringArray(rawTimelineBlock.examples, `${timelineBlockPath}.examples`, errors);
        });
      });
    }
  }
  if (block.type === "example-list") {
    if (!Array.isArray(block.props.examples) || block.props.examples.length === 0) {
      errors.push(`${path}.props.examples must be a non-empty array.`);
    } else {
      block.props.examples.forEach((rawExampleGroup, exampleGroupIndex) => {
        const exampleGroupPath = `${path}.props.examples[${exampleGroupIndex}]`;
        if (!isObject(rawExampleGroup)) {
          errors.push(`${exampleGroupPath} must be an object.`);
          return;
        }
        assertString(rawExampleGroup.title, `${exampleGroupPath}.title`, errors);
        assertStringArray(rawExampleGroup.items, `${exampleGroupPath}.items`, errors);
      });
    }
  }
  if (block.type === "quiz") {
    assertString(block.props.question, `${path}.props.question`, errors);
    assertStringArray(block.props.options, `${path}.props.options`, errors);
  }
  if (block.type === "checklist") {
    assertString(block.props.title, `${path}.props.title`, errors);
    assertStringArray(block.props.items, `${path}.props.items`, errors);
  }
  if (block.type === "result-card") {
    assertString(block.props.title, `${path}.props.title`, errors);
  }
}

function validateStateBinding(value: unknown, path: string, errors: string[]) {
  if (value === undefined) return;
  if (!isObject(value)) {
    errors.push(`${path} must be an object.`);
    return;
  }
  assertString(value.key, `${path}.key`, errors);
}

function requireStateBinding(value: unknown, path: string, errors: string[]) {
  if (value === undefined) {
    errors.push(`${path} is required.`);
    return;
  }
  validateStateBinding(value, path, errors);
}

export function validateContainerSpec(rawSpec: unknown): ContainerSpec {
  const errors: string[] = [];
  if (!isObject(rawSpec)) throw new Error("Container spec must be an object.");

  assertString(rawSpec.id, "id", errors);
  assertString(rawSpec.slug, "slug", errors);
  if (typeof rawSpec.slug === "string" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rawSpec.slug)) {
    errors.push("slug must be URL-safe kebab-case.");
  }
  assertString(rawSpec.title, "title", errors);
  assertString(rawSpec.summary, "summary", errors);
  if (rawSpec.coverImage !== undefined) assertString(rawSpec.coverImage, "coverImage", errors);
  if (rawSpec.updatedAt !== undefined) assertString(rawSpec.updatedAt, "updatedAt", errors);
  if (rawSpec.introMarkdown !== undefined) assertString(rawSpec.introMarkdown, "introMarkdown", errors);
  assertOptionalStringArray(rawSpec.displayBadges, "displayBadges", errors);
  if (rawSpec.pricing !== undefined) {
    if (!isObject(rawSpec.pricing)) {
      errors.push("pricing must be an object.");
    } else {
      assertNumber(rawSpec.pricing.originalPrice, "pricing.originalPrice", errors);
      assertNumber(rawSpec.pricing.discountRate, "pricing.discountRate", errors);
      if (typeof rawSpec.pricing.discountRate === "number" && (rawSpec.pricing.discountRate < 0 || rawSpec.pricing.discountRate > 100)) {
        errors.push("pricing.discountRate must be between 0 and 100.");
      }
    }
  }
  if (rawSpec.recommendationCards !== undefined) {
    if (!Array.isArray(rawSpec.recommendationCards)) {
      errors.push("recommendationCards must be an array.");
    } else {
      rawSpec.recommendationCards.forEach((rawCard, cardIndex) => {
        const cardPath = `recommendationCards[${cardIndex}]`;
        if (!isObject(rawCard)) {
          errors.push(`${cardPath} must be an object.`);
          return;
        }
        assertString(rawCard.image, `${cardPath}.image`, errors);
        assertString(rawCard.text, `${cardPath}.text`, errors);
      });
    }
  }
  validateLearningExperience(rawSpec.learningExperience, "learningExperience", errors);
  if (rawSpec.status !== "draft" && rawSpec.status !== "published") {
    errors.push("status must be draft or published.");
  }
  if (rawSpec.access !== "free" && rawSpec.access !== "paid") {
    errors.push("access must be free or paid.");
  }
  assertString(rawSpec.hub, "hub", errors);
  assertStringArray(rawSpec.tracks, "tracks", errors);
  assertStringArray(rawSpec.audience, "audience", errors);
  if (
    rawSpec.difficulty !== "beginner" &&
    rawSpec.difficulty !== "intermediate" &&
    rawSpec.difficulty !== "advanced"
  ) {
    errors.push("difficulty must be beginner, intermediate, or advanced.");
  }
  assertStringArray(rawSpec.outcomes, "outcomes", errors);
  assertStringArray(rawSpec.outputs, "outputs", errors);

  if (!Array.isArray(rawSpec.modules) || rawSpec.modules.length === 0) {
    errors.push("modules must be a non-empty array.");
  }

  const ids = new Set<string>();
  const writtenStateKeys = new Set<string>();
  const referencedStateKeys = new Set<string>();

  function registerId(id: unknown, path: string) {
    if (typeof id !== "string" || id.length === 0) {
      errors.push(`${path} must be a non-empty string.`);
      return;
    }
    if (ids.has(id)) errors.push(`${path} is duplicated: ${id}.`);
    ids.add(id);
  }

  if (Array.isArray(rawSpec.modules)) {
    rawSpec.modules.forEach((rawModule, moduleIndex) => {
      const modulePath = `modules[${moduleIndex}]`;
      if (!isObject(rawModule)) {
        errors.push(`${modulePath} must be an object.`);
        return;
      }
      registerId(rawModule.id, `${modulePath}.id`);
      assertString(rawModule.title, `${modulePath}.title`, errors);
      if (Object.prototype.hasOwnProperty.call(rawModule, "summary")) {
        errors.push(`${modulePath}.summary has been retired from the module spec.`);
      }
      if (!Array.isArray(rawModule.lessons) || rawModule.lessons.length === 0) {
        errors.push(`${modulePath}.lessons must be a non-empty array.`);
        return;
      }

      rawModule.lessons.forEach((rawLesson, lessonIndex) => {
        const lessonPath = `${modulePath}.lessons[${lessonIndex}]`;
        if (!isObject(rawLesson)) {
          errors.push(`${lessonPath} must be an object.`);
          return;
        }
        registerId(rawLesson.id, `${lessonPath}.id`);
        assertString(rawLesson.title, `${lessonPath}.title`, errors);
        if (!Array.isArray(rawLesson.pages) || rawLesson.pages.length === 0) {
          errors.push(`${lessonPath}.pages must be a non-empty array.`);
          return;
        }

        rawLesson.pages.forEach((rawPage, pageIndex) => {
          const pagePath = `${lessonPath}.pages[${pageIndex}]`;
          if (!isObject(rawPage)) {
            errors.push(`${pagePath} must be an object.`);
            return;
          }
          registerId(rawPage.id, `${pagePath}.id`);
          assertString(rawPage.title, `${pagePath}.title`, errors);
          if (!isObject(rawPage.left)) {
            errors.push(`${pagePath}.left must be an object.`);
          } else {
            assertString(rawPage.left.title, `${pagePath}.left.title`, errors);
            if (rawPage.left.bodyMarkdown !== undefined && typeof rawPage.left.bodyMarkdown !== "string") {
              errors.push(`${pagePath}.left.bodyMarkdown must be a string.`);
            }
            assertStringArray(rawPage.left.paragraphs, `${pagePath}.left.paragraphs`, errors);
            assertOptionalStringArray(rawPage.left.checkpoints, `${pagePath}.left.checkpoints`, errors);
          }
          if (rawPage.slideElements !== undefined) {
            if (!Array.isArray(rawPage.slideElements)) {
              errors.push(`${pagePath}.slideElements must be an array.`);
            } else {
              rawPage.slideElements.forEach((rawElement, elementIndex) => {
                const elementPath = `${pagePath}.slideElements[${elementIndex}]`;
                if (!isObject(rawElement)) {
                  errors.push(`${elementPath} must be an object.`);
                  return;
                }
                registerId(rawElement.id, `${elementPath}.id`);
                validateSlideElementType(rawElement.type, `${elementPath}.type`, errors);
                validateSlidePercent(rawElement.x, `${elementPath}.x`, errors, 0, 100);
                validateSlidePercent(rawElement.y, `${elementPath}.y`, errors, 0, 100);
                validateSlidePercent(rawElement.width, `${elementPath}.width`, errors, 1, 100);
                validateSlidePercent(rawElement.height, `${elementPath}.height`, errors, 1, 100);
                assertString(rawElement.content, `${elementPath}.content`, errors);
              });
            }
          }
          if (!isObject(rawPage.workspace)) {
            errors.push(`${pagePath}.workspace must be an object.`);
            return;
          }
          if (
            rawPage.workspace.layout !== "stack" &&
            rawPage.workspace.layout !== "grid" &&
            rawPage.workspace.layout !== "split" &&
            rawPage.workspace.layout !== "focus"
          ) {
            errors.push(`${pagePath}.workspace.layout must be stack, grid, split, or focus.`);
          }
          if (!Array.isArray(rawPage.workspace.blocks)) {
            errors.push(`${pagePath}.workspace.blocks must be an array.`);
            return;
          }

          rawPage.workspace.blocks.forEach((rawBlock, blockIndex) => {
            const blockPath = `${pagePath}.workspace.blocks[${blockIndex}]`;
            if (!isObject(rawBlock)) {
              errors.push(`${blockPath} must be an object.`);
              return;
            }
            registerId(rawBlock.id, `${blockPath}.id`);
            validateBlockProps(rawBlock, blockPath, errors);
            validateStateBinding(rawBlock.reads, `${blockPath}.reads`, errors);
            validateStateBinding(rawBlock.writes, `${blockPath}.writes`, errors);
            if (rawBlock.type === "block-board") {
              requireStateBinding(rawBlock.writes, `${blockPath}.writes`, errors);
            }
            if (rawBlock.type === "state-summary") {
              requireStateBinding(rawBlock.reads, `${blockPath}.reads`, errors);
            }
            if (rawBlock.type === "candidate-select") {
              requireStateBinding(rawBlock.reads, `${blockPath}.reads`, errors);
              requireStateBinding(rawBlock.writes, `${blockPath}.writes`, errors);
            }

            if (isObject(rawBlock.reads) && typeof rawBlock.reads.key === "string") {
              referencedStateKeys.add(rawBlock.reads.key);
              if (!writtenStateKeys.has(rawBlock.reads.key)) {
                errors.push(`${blockPath}.reads.key references state before it is written: ${rawBlock.reads.key}.`);
              }
            }
            if (isObject(rawBlock.writes) && typeof rawBlock.writes.key === "string") {
              writtenStateKeys.add(rawBlock.writes.key);
            }
          });
        });
      });
    });
  }

  if (referencedStateKeys.size > 0 && writtenStateKeys.size === 0) {
    errors.push("state reads are declared, but no state writes exist.");
  }

  if (errors.length > 0) {
    throw new Error(`Invalid container spec ${String(rawSpec.slug ?? rawSpec.id ?? "")}:\n${errors.join("\n")}`);
  }

  return normalizeContainerSpec(rawSpec);
}

function normalizeContainerSpec(rawSpec: Record<string, unknown>) {
  delete rawSpec.duration;

  if (Array.isArray(rawSpec.modules)) {
    rawSpec.modules.forEach((rawModule) => {
      if (!isObject(rawModule) || !Array.isArray(rawModule.lessons)) return;
      delete rawModule.coverImage;
      rawModule.lessons.forEach((rawLesson) => {
        if (!isObject(rawLesson)) return;
        delete rawLesson.estimatedTime;
        if (!Array.isArray(rawLesson.pages)) return;
        rawLesson.pages.forEach((rawPage) => {
          if (!isObject(rawPage) || !isObject(rawPage.workspace) || !Array.isArray(rawPage.workspace.blocks)) return;
          rawPage.workspace.blocks.forEach((rawBlock) => {
            if (isObject(rawBlock) && rawBlock.type === "intro-summary" && isObject(rawBlock.props)) {
              delete rawBlock.props.duration;
            }
          });
        });
      });
    });
  }

  return rawSpec as unknown as ContainerSpec;
}

export const containerSpecs = rawContainerSpecs.map(validateContainerSpec);

export function getContainerSpec(slug: string) {
  const container = containerSpecs.find((item) => item.slug === slug);
  if (!container) return undefined;
  if (!canExposeContainerOnLearningSurface(container)) return undefined;
  return container;
}

export function buildInteractiveLessonFromContainer(container: ContainerSpec, lessonSlug?: string): InteractiveLesson | undefined {
  const lessons = container.modules.flatMap((module) => module.lessons);
  const entryLesson = lessonSlug
    ? lessons.find((lesson) => lesson.id === lessonSlug)
    : lessons[0];
  if (!entryLesson) return undefined;
  const entryModule = container.modules.find((module) => module.lessons.some((lesson) => lesson.id === entryLesson.id));

  return {
    courseSlug: container.slug,
    lessonSlug: entryLesson.id,
    courseTitle: container.title,
    title: entryLesson.title,
    subtitle: container.summary,
    learningExperience: container.learningExperience,
    pages: entryLesson.pages.map((page) => ({
        ...page,
        moduleTitle: entryModule?.title ?? ""
      }))
  };
}

export function getInteractiveLesson(courseSlug: string, lessonSlug: string): InteractiveLesson | undefined {
  const container = getContainerSpec(courseSlug);
  if (!container) return undefined;

  return buildInteractiveLessonFromContainer(container, lessonSlug);
}

export function getInteractiveLessonParams() {
  return containerSpecs.filter(canExposeContainerOnLearningSurface).flatMap((container) =>
    container.modules.flatMap((module) =>
      module.lessons.map((lesson) => ({
        courseSlug: container.slug,
        lessonSlug: lesson.id
      }))
    )
  );
}
