import type { LessonWorkspaceBlock, TimelineBlock } from "@/lib/containerSpec";
import { CandidateSelectWorkspace } from "@/components/lesson/workspace/CandidateSelectWorkspace";
import { ChecklistWorkspace } from "@/components/lesson/workspace/ChecklistWorkspace";
import { ExampleListWorkspace } from "@/components/lesson/workspace/ExampleListWorkspace";
import { ImageDefinitionWorkspace } from "@/components/lesson/workspace/ImageDefinitionWorkspace";
import { IntroSummaryWorkspace } from "@/components/lesson/workspace/IntroSummaryWorkspace";
import { QuizWorkspace } from "@/components/lesson/workspace/QuizWorkspace";
import { ResultCardWorkspace } from "@/components/lesson/workspace/ResultCardWorkspace";
import { TimelineAnalysisWorkspace } from "@/components/lesson/workspace/TimelineAnalysisWorkspace";
import { TimelineBuilderWorkspace } from "@/components/lesson/workspace/TimelineBuilderWorkspace";
import type {
  BlockBoardBlock,
  CandidateSelectBlock,
  LessonState
} from "@/components/lesson/workspace/types";

export function WorkspaceBlockRenderer({
  block,
  lessonState,
  onAddBlock,
  onRemoveBlock,
  onReset,
  onSelectCandidate
}: {
  block: LessonWorkspaceBlock;
  lessonState: LessonState;
  onAddBlock: (block: BlockBoardBlock, timelineBlock: TimelineBlock) => void;
  onRemoveBlock: (block: BlockBoardBlock, instanceId: string) => void;
  onReset: (block: BlockBoardBlock) => void;
  onSelectCandidate: (block: CandidateSelectBlock, instanceId: string) => void;
}) {
  if (block.type === "intro-summary") return <IntroSummaryWorkspace block={block} />;
  if (block.type === "image-definition") return <ImageDefinitionWorkspace block={block} />;
  if (block.type === "block-board") {
    return (
      <TimelineBuilderWorkspace
        block={block}
        lessonState={lessonState}
        onAddBlock={onAddBlock}
        onRemoveBlock={onRemoveBlock}
        onReset={onReset}
      />
    );
  }
  if (block.type === "state-summary") return <TimelineAnalysisWorkspace block={block} lessonState={lessonState} />;
  if (block.type === "example-list") return <ExampleListWorkspace block={block} />;
  if (block.type === "candidate-select") {
    return (
      <CandidateSelectWorkspace
        block={block}
        lessonState={lessonState}
        onSelectCandidate={onSelectCandidate}
      />
    );
  }
  if (block.type === "quiz") return <QuizWorkspace block={block} />;
  if (block.type === "checklist") return <ChecklistWorkspace block={block} />;
  if (block.type === "result-card") return <ResultCardWorkspace block={block} lessonState={lessonState} />;
  return null;
}
