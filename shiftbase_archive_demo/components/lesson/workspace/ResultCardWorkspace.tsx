import type { LessonWorkspaceBlock } from "@/lib/containerSpec";
import type { LessonState, TimelineItem } from "@/components/lesson/workspace/types";

type ResultCardBlock = Extract<LessonWorkspaceBlock, { type: "result-card" }>;

export function ResultCardWorkspace({
  block,
  lessonState
}: {
  block: ResultCardBlock;
  lessonState: LessonState;
}) {
  const value = block.reads ? lessonState[block.reads.key] : undefined;
  const selected =
    typeof value === "object" && value !== null && "label" in value
      ? (value as TimelineItem)
      : Object.values(lessonState)
          .filter(Array.isArray)
          .flat()
          .find((item): item is TimelineItem => {
            return (
              typeof value === "string" &&
              typeof item === "object" &&
              item !== null &&
              "instanceId" in item &&
              (item as TimelineItem).instanceId === value
            );
          });

  return (
    <section className="border border-line bg-ink p-5 text-white">
      <p className="text-sm font-bold text-white/58">산출물</p>
      <h3 className="mt-2 text-2xl font-semibold">{block.props.title}</h3>
      {selected ? (
        <div className="mt-5 bg-white p-4 text-ink">
          <p className="font-semibold text-primary">{selected.label}</p>
          <p className="mt-2 text-sm leading-7 text-muted">{selected.axReason}</p>
        </div>
      ) : (
        <p className="mt-5 text-sm leading-7 text-white/70">
          {block.props.emptyText ?? "아직 정리된 산출물이 없습니다."}
        </p>
      )}
    </section>
  );
}
