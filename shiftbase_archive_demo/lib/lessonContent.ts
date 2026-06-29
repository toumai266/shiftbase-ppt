import { containerSpecs } from "@/lib/containerSpec";

export {
  containerSpecs,
  getContainerSpec,
  getInteractiveLesson,
  getInteractiveLessonParams
} from "@/lib/containerSpec";
export type {
  ContainerSpec,
  ExampleGroup,
  InteractiveLesson,
  LessonPage,
  LessonReadingSpec,
  LessonSpec,
  LessonWorkspaceBlock,
  ModuleSpec,
  PageSpec,
  StateBinding,
  TimelineBlock,
  TimelineBlockCategory,
  TimelineBlockGroup,
  WorkspaceLayout
} from "@/lib/containerSpec";

export const interactiveLessons = containerSpecs.flatMap((container) =>
  container.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({
      courseSlug: container.slug,
      lessonSlug: lesson.id,
      courseTitle: container.title,
      title: lesson.title,
      subtitle: container.summary,
      pages: lesson.pages.map((page) => ({
        ...page,
        moduleTitle: module.title
      }))
    }))
  )
);
