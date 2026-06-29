import { CodeCanvasFrame } from "@/components/lesson/CodeCanvasFrame";
import { WorkspaceBlockRenderer } from "@/components/lesson/workspace/WorkspaceBlockRenderer";
import type { LessonPage, LessonWorkspaceBlock, TimelineBlock } from "@/lib/containerSpec";
import type {
  BlockBoardBlock,
  CandidateSelectBlock,
  LessonState
} from "@/components/lesson/workspace/types";

type CodeCanvasBlock = Extract<LessonWorkspaceBlock, { type: "code-canvas" }>;

function isCodeCanvasBlock(block: LessonWorkspaceBlock): block is CodeCanvasBlock {
  return block.type === "code-canvas";
}

function getCodeCanvasSource(block: CodeCanvasBlock) {
  const entry = block.props.entry ?? "index.html";
  return block.props.files?.[entry] ?? block.props.code ?? "";
}

function CodeCanvasBrief({ block }: { block: CodeCanvasBlock }) {
  const statusLabel = block.props.status === "generated" ? "생성됨" : block.props.status ?? "초안";
  const notes = block.props.notes?.replace(/^브리프:\s*/, "");

  return (
    <div className="border-b border-line bg-white px-4 py-3 sm:px-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-primary-light px-2 py-1 text-[11px] font-bold text-primary">
          AI 브리프
        </span>
        <span className="rounded-md bg-soft px-2 py-1 text-[11px] font-bold text-muted">
          {statusLabel}
        </span>
        <span className="rounded-md bg-soft px-2 py-1 text-[11px] font-bold text-muted">
          {block.props.kind}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold leading-6 text-ink">{block.props.prompt}</p>
      {notes ? <p className="mt-1 text-xs leading-5 text-muted">{notes}</p> : null}
    </div>
  );
}

export function Workspace({
  page,
  lessonState,
  onAddBlock,
  onRemoveBlock,
  onReset,
  onSelectCandidate
}: {
  page: LessonPage;
  lessonState: LessonState;
  onAddBlock: (block: BlockBoardBlock, timelineBlock: TimelineBlock) => void;
  onRemoveBlock: (block: BlockBoardBlock, instanceId: string) => void;
  onReset: (block: BlockBoardBlock) => void;
  onSelectCandidate: (block: CandidateSelectBlock, instanceId: string) => void;
}) {
  const codeCanvas = page.workspace.blocks.find(isCodeCanvasBlock);
  if (codeCanvas) {
    const supportingBlocks = page.workspace.blocks.filter((block) => block.id !== codeCanvas.id);

    return (
      <aside className="flex min-w-0 flex-col border-t border-line bg-white lg:border-t-0">
        <CodeCanvasBrief block={codeCanvas} />
        <CodeCanvasFrame className="min-h-[calc(100dvh-288px)] flex-1" source={getCodeCanvasSource(codeCanvas)} title={page.title} />
        {supportingBlocks.length > 0 ? (
          <div className="grid gap-4 border-t border-line p-5 sm:p-7 lg:p-8">
            {supportingBlocks.map((block) => (
              <WorkspaceBlockRenderer
                block={block}
                key={block.id}
                lessonState={lessonState}
                onAddBlock={onAddBlock}
                onRemoveBlock={onRemoveBlock}
                onReset={onReset}
                onSelectCandidate={onSelectCandidate}
              />
            ))}
          </div>
        ) : null}
      </aside>
    );
  }

  return (
    <aside className="min-w-0 border-t border-line p-5 sm:p-7 lg:border-t-0 lg:p-8">
      <div className="grid gap-4">
        {page.workspace.blocks.map((block) => (
          <WorkspaceBlockRenderer
            block={block}
            key={block.id}
            lessonState={lessonState}
            onAddBlock={onAddBlock}
            onRemoveBlock={onRemoveBlock}
            onReset={onReset}
            onSelectCandidate={onSelectCandidate}
          />
        ))}
      </div>
    </aside>
  );
}
