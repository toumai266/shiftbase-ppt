import { RotateCcw } from "lucide-react";
import type { TimelineBlock, TimelineBlockGroup } from "@/lib/containerSpec";
import { categoryLabel, type TimelineItem } from "@/components/lesson/workspace/types";

export function TimelineDropZone({
  timeline,
  blockGroups,
  onAddBlock,
  onRemoveBlock,
  onReset
}: {
  timeline: TimelineItem[];
  blockGroups: TimelineBlockGroup[];
  onAddBlock: (block: TimelineBlock) => void;
  onRemoveBlock: (instanceId: string) => void;
  onReset: () => void;
}) {
  const allBlocks = blockGroups.flatMap((group) => group.blocks);

  return (
    <aside
      className="border border-dashed border-primary/35 bg-primary-light/35 p-4"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const blockId = event.dataTransfer.getData("text/plain");
        const block = allBlocks.find((item) => item.id === blockId);
        if (block) onAddBlock(block);
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">내 하루 업무 타임라인</p>
          <p className="mt-1 text-xs text-muted">블럭을 클릭하거나 이 영역으로 드래그하세요.</p>
        </div>
        <button
          aria-label="타임라인 초기화"
          className="focus-ring rounded-lg p-2 text-muted transition hover:bg-white hover:text-ink"
          onClick={onReset}
          type="button"
        >
          <RotateCcw size={16} aria-hidden="true" />
        </button>
      </div>
      <div className="mt-4 grid min-h-[220px] gap-3">
        {timeline.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center border border-dashed border-primary/30 bg-white/70 p-5 text-center text-sm leading-7 text-muted">
            아직 배치된 업무가 없습니다.
            <br />
            업무 블럭을 추가하세요.
          </div>
        ) : (
          timeline.map((item, index) => (
            <div className="bg-white p-4 shadow-soft" key={item.instanceId}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-muted">
                    {index + 1}번째 업무 · {categoryLabel[item.category]}
                  </p>
                  <p className="mt-1 font-semibold text-ink">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{item.description}</p>
                </div>
                <button
                  className="focus-ring rounded px-2 py-1 text-xs font-bold text-muted transition hover:bg-soft hover:text-ink"
                  onClick={() => onRemoveBlock(item.instanceId)}
                  type="button"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
