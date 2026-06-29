import { Sparkles } from "lucide-react";
import type { LessonWorkspaceBlock } from "@/lib/containerSpec";
import { categoryLabel, readTimelineState, type LessonState } from "@/components/lesson/workspace/types";

type StateSummaryBlock = Extract<LessonWorkspaceBlock, { type: "state-summary" }>;

export function TimelineAnalysisWorkspace({
  block,
  lessonState
}: {
  block: StateSummaryBlock;
  lessonState: LessonState;
}) {
  const timeline = readTimelineState(lessonState, block.reads?.key);

  return (
    <div className="grid gap-3">
      {timeline.length === 0 ? (
        <div className="border border-line bg-white p-8 text-center">
          <Sparkles className="mx-auto text-primary" size={24} aria-hidden="true" />
          <p className="mt-3 font-semibold text-ink">분석할 타임라인이 없습니다</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            이전 페이지에서 업무 블럭을 먼저 배치하면 AX 후보가 여기에 표시됩니다.
          </p>
        </div>
      ) : (
        timeline.map((item, index) => (
          <article className="border border-line bg-white p-4" key={item.instanceId}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-primary">
                  AX 후보 {index + 1} · {categoryLabel[item.category]}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-ink">{item.label}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{item.axReason}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-light px-2.5 py-1 text-xs font-bold text-primary">
                <Sparkles size={12} aria-hidden="true" />
                후보
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.examples.map((example) => (
                <span className="rounded-full bg-soft px-2.5 py-1 text-xs font-semibold text-muted" key={example}>
                  {example}
                </span>
              ))}
            </div>
          </article>
        ))
      )}
    </div>
  );
}
