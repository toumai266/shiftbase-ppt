import { GripVertical } from "lucide-react";
import type { TimelineBlock } from "@/lib/containerSpec";
import { TimelineDropZone } from "@/components/lesson/workspace/TimelineDropZone";
import {
  categoryTone,
  readTimelineState,
  type BlockBoardBlock,
  type LessonState
} from "@/components/lesson/workspace/types";

export function TimelineBuilderWorkspace({
  block,
  lessonState,
  onAddBlock,
  onRemoveBlock,
  onReset
}: {
  block: BlockBoardBlock;
  lessonState: LessonState;
  onAddBlock: (block: BlockBoardBlock, timelineBlock: TimelineBlock) => void;
  onRemoveBlock: (block: BlockBoardBlock, instanceId: string) => void;
  onReset: (block: BlockBoardBlock) => void;
}) {
  const timeline = readTimelineState(lessonState, block.writes?.key);

  return (
    <div className="grid gap-4">
      <div className="grid gap-3">
        {block.props.blockGroups.map((group) => (
          <section className="border border-line bg-white p-4" key={group.title}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-ink">{group.title}</h3>
                <p className="mt-1 text-xs leading-5 text-muted">{group.description}</p>
              </div>
              <span className="rounded-full bg-soft px-2 py-1 text-[11px] font-bold text-muted">
                {group.blocks.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {group.blocks.map((timelineBlock) => (
                <button
                  className={`focus-ring inline-flex cursor-grab items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition active:cursor-grabbing active:translate-y-px ${categoryTone[timelineBlock.category]}`}
                  draggable
                  key={timelineBlock.id}
                  onClick={() => onAddBlock(block, timelineBlock)}
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", timelineBlock.id);
                  }}
                  type="button"
                >
                  <GripVertical size={13} aria-hidden="true" />
                  {timelineBlock.label}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <TimelineDropZone
        timeline={timeline}
        blockGroups={block.props.blockGroups}
        onAddBlock={(timelineBlock) => onAddBlock(block, timelineBlock)}
        onRemoveBlock={(instanceId) => onRemoveBlock(block, instanceId)}
        onReset={() => onReset(block)}
      />
    </div>
  );
}
