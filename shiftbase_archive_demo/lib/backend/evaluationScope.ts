import { badRequest } from "@/lib/backend/errors";
import type {
  ContainerSpec,
  LessonSpec,
  LessonWorkspaceBlock,
  ModuleSpec,
  PageSpec
} from "@/lib/containerSpec";
import type {
  EvaluationBlockSummary,
  EvaluationScope,
  EvaluationScopeLevel,
  EvaluationScopeSnapshot
} from "@/lib/backend/evaluationTypes";

const promptContextLimit = 14000;

type LocatedTarget = {
  level: EvaluationScopeLevel;
  module?: ModuleSpec;
  lesson?: LessonSpec;
  page?: PageSpec;
  block?: LessonWorkspaceBlock;
};

function clipText(value: string, limit: number) {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit - 80)}\n\n[truncated ${value.length - limit + 80} chars]`;
}

function countPages(container: ContainerSpec) {
  return container.modules.reduce(
    (moduleTotal, module) =>
      moduleTotal + module.lessons.reduce((lessonTotal, lesson) => lessonTotal + lesson.pages.length, 0),
    0
  );
}

function countLessons(container: ContainerSpec) {
  return container.modules.reduce((total, module) => total + module.lessons.length, 0);
}

function countBlocks(container: ContainerSpec) {
  return container.modules.reduce(
    (moduleTotal, module) =>
      moduleTotal +
      module.lessons.reduce(
        (lessonTotal, lesson) =>
          lessonTotal + lesson.pages.reduce((pageTotal, page) => pageTotal + page.workspace.blocks.length, 0),
        0
      ),
    0
  );
}

function summarizeBlock(block: LessonWorkspaceBlock): EvaluationBlockSummary {
  const propsText = JSON.stringify(block.props, null, 2);
  return {
    id: block.id,
    type: block.type,
    propsPreview: safeParseJson(clipText(propsText, 2200))
  };
}

function safeParseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function blockPreview(block: LessonWorkspaceBlock): EvaluationBlockSummary {
  const propsText = JSON.stringify(block.props, null, 2);
  return {
    id: block.id,
    type: block.type,
    propsPreview: safeParseJson(clipText(propsText, 2200))
  };
}

function compactContainer(container: ContainerSpec) {
  return {
    slug: container.slug,
    title: container.title,
    summary: container.summary,
    status: container.status,
    access: container.access,
    hub: container.hub,
    tracks: container.tracks,
    audience: container.audience,
    difficulty: container.difficulty,
    outcomes: container.outcomes,
    outputs: container.outputs,
    modules: container.modules.map((module) => ({
      id: module.id,
      title: module.title,
      lessonCount: module.lessons.length,
      pageCount: module.lessons.reduce((total, lesson) => total + lesson.pages.length, 0)
    }))
  };
}

function compactModule(module: ModuleSpec) {
  return {
    id: module.id,
    title: module.title,
    lessons: module.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      pages: lesson.pages.map((page) => ({
        id: page.id,
        title: page.title,
        readingTitle: page.left.title,
        layout: page.workspace.layout,
        blockTypes: page.workspace.blocks.map((block) => `${block.id}:${block.type}`)
      }))
    }))
  };
}

function compactLesson(lesson: LessonSpec) {
  return {
    id: lesson.id,
    title: lesson.title,
    pages: lesson.pages.map((page) => compactPage(page))
  };
}

function compactPage(page: PageSpec) {
  return {
    id: page.id,
    title: page.title,
    reading: {
      title: page.left.title,
      bodyMarkdown: clipText(page.left.bodyMarkdown ?? page.left.paragraphs.join("\n\n"), 5000),
      checkpoints: page.left.checkpoints ?? []
    },
    workspace: {
      layout: page.workspace.layout,
      blocks: page.workspace.blocks.map(blockPreview)
    }
  };
}

function compactBlock(page: PageSpec, block: LessonWorkspaceBlock) {
  return {
    page: {
      id: page.id,
      title: page.title,
      readingTitle: page.left.title,
      readingExcerpt: clipText(page.left.bodyMarkdown ?? page.left.paragraphs.join("\n\n"), 3000)
    },
    block: summarizeBlock(block),
    siblingBlocks: page.workspace.blocks.map((candidate) => ({
      id: candidate.id,
      type: candidate.type
    }))
  };
}

function locateTarget(container: ContainerSpec, scope: EvaluationScope): LocatedTarget {
  if (scope.containerSlug !== container.slug) {
    throw badRequest(`scope.containerSlug must match container slug: ${container.slug}.`);
  }

  let foundModule: ModuleSpec | undefined;
  let foundLesson: LessonSpec | undefined;
  let foundPage: PageSpec | undefined;
  let foundBlock: LessonWorkspaceBlock | undefined;

  for (const module of container.modules) {
    for (const lesson of module.lessons) {
      for (const page of lesson.pages) {
        const block = scope.blockId
          ? page.workspace.blocks.find((candidate) => candidate.id === scope.blockId)
          : undefined;
        if (block) {
          foundModule = module;
          foundLesson = lesson;
          foundPage = page;
          foundBlock = block;
        }
      }
    }
  }

  if (scope.blockId && !foundBlock) throw badRequest(`block not found: ${scope.blockId}.`);
  if (foundBlock) return verifyLocatedScope(scope, { level: "block", module: foundModule, lesson: foundLesson, page: foundPage, block: foundBlock });

  for (const module of container.modules) {
    for (const lesson of module.lessons) {
      const page = scope.pageId ? lesson.pages.find((candidate) => candidate.id === scope.pageId) : undefined;
      if (page) return verifyLocatedScope(scope, { level: "page", module, lesson, page });
    }
  }
  if (scope.pageId) throw badRequest(`page not found: ${scope.pageId}.`);

  for (const module of container.modules) {
    const lesson = scope.lessonId ? module.lessons.find((candidate) => candidate.id === scope.lessonId) : undefined;
    if (lesson) return verifyLocatedScope(scope, { level: "lesson", module, lesson });
  }
  if (scope.lessonId) throw badRequest(`lesson not found: ${scope.lessonId}.`);

  const module = scope.moduleId ? container.modules.find((candidate) => candidate.id === scope.moduleId) : undefined;
  if (module) return verifyLocatedScope(scope, { level: "module", module });
  if (scope.moduleId) throw badRequest(`module not found: ${scope.moduleId}.`);

  return { level: "container" };
}

function verifyLocatedScope(scope: EvaluationScope, located: LocatedTarget) {
  if (scope.moduleId && located.module?.id !== scope.moduleId) {
    throw badRequest(`moduleId does not contain the selected target: ${scope.moduleId}.`);
  }
  if (scope.lessonId && located.lesson?.id !== scope.lessonId) {
    throw badRequest(`lessonId does not contain the selected target: ${scope.lessonId}.`);
  }
  if (scope.pageId && located.page?.id !== scope.pageId) {
    throw badRequest(`pageId does not contain the selected target: ${scope.pageId}.`);
  }
  return located;
}

function buildPath(container: ContainerSpec, located: LocatedTarget) {
  return [
    container.title,
    located.module?.title,
    located.lesson?.title,
    located.page?.title,
    located.block?.id
  ].filter((item): item is string => Boolean(item));
}

function buildTarget(container: ContainerSpec, located: LocatedTarget) {
  if (located.level === "block" && located.page && located.block) return compactBlock(located.page, located.block);
  if (located.level === "page" && located.page) return compactPage(located.page);
  if (located.level === "lesson" && located.lesson) return compactLesson(located.lesson);
  if (located.level === "module" && located.module) return compactModule(located.module);
  return compactContainer(container);
}

function getTitle(container: ContainerSpec, located: LocatedTarget) {
  if (located.level === "block" && located.block) return `${located.block.id} 블록`;
  if (located.level === "page" && located.page) return located.page.title;
  if (located.level === "lesson" && located.lesson) return located.lesson.title;
  if (located.level === "module" && located.module) return located.module.title;
  return container.title;
}

function normalizeLocatedScope(container: ContainerSpec, scope: EvaluationScope, located: LocatedTarget): EvaluationScope {
  return {
    containerSlug: container.slug,
    moduleId: located.module?.id ?? scope.moduleId,
    lessonId: located.lesson?.id ?? scope.lessonId,
    pageId: located.page?.id ?? scope.pageId,
    blockId: located.block?.id ?? scope.blockId
  };
}

export function resolveEvaluationScope(container: ContainerSpec, rawScope: EvaluationScope): EvaluationScopeSnapshot {
  const scope = { ...rawScope, containerSlug: rawScope.containerSlug || container.slug };
  const located = locateTarget(container, scope);
  const target = buildTarget(container, located);
  const promptContext = clipText(JSON.stringify(target, null, 2), promptContextLimit);

  return {
    level: located.level,
    title: getTitle(container, located),
    path: buildPath(container, located),
    scope: normalizeLocatedScope(container, scope, located),
    metrics: {
      modules: container.modules.length,
      lessons: countLessons(container),
      pages: countPages(container),
      blocks: countBlocks(container),
      characters: promptContext.length
    },
    target,
    promptContext
  };
}

export function buildEvaluationTargetOptions(container: ContainerSpec) {
  return [
    {
      key: `container:${container.slug}`,
      level: "container" as const,
      title: container.title,
      path: [container.title],
      scope: { containerSlug: container.slug } satisfies EvaluationScope
    },
    ...container.modules.flatMap((module) => [
      {
        key: `module:${module.id}`,
        level: "module" as const,
        title: module.title,
        path: [container.title, module.title],
        scope: { containerSlug: container.slug, moduleId: module.id } satisfies EvaluationScope
      },
      ...module.lessons.flatMap((lesson) => [
        {
          key: `lesson:${lesson.id}`,
          level: "lesson" as const,
          title: lesson.title,
          path: [container.title, module.title, lesson.title],
          scope: { containerSlug: container.slug, moduleId: module.id, lessonId: lesson.id } satisfies EvaluationScope
        },
        ...lesson.pages.flatMap((page) => [
          {
            key: `page:${page.id}`,
            level: "page" as const,
            title: page.title,
            path: [container.title, module.title, lesson.title, page.title],
            scope: {
              containerSlug: container.slug,
              moduleId: module.id,
              lessonId: lesson.id,
              pageId: page.id
            } satisfies EvaluationScope
          },
          ...page.workspace.blocks.map((block) => ({
            key: `block:${block.id}`,
            level: "block" as const,
            title: `${block.id} · ${block.type}`,
            path: [container.title, module.title, lesson.title, page.title, block.id],
            scope: {
              containerSlug: container.slug,
              moduleId: module.id,
              lessonId: lesson.id,
              pageId: page.id,
              blockId: block.id
            } satisfies EvaluationScope
          }))
        ])
      ])
    ])
  ];
}
