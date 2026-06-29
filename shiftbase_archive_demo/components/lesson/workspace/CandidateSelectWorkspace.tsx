import {
  categoryLabel,
  readStringState,
  readTimelineState,
  type CandidateSelectBlock,
  type LessonState
} from "@/components/lesson/workspace/types";

export function CandidateSelectWorkspace({
  block,
  lessonState,
  onSelectCandidate
}: {
  block: CandidateSelectBlock;
  lessonState: LessonState;
  onSelectCandidate: (block: CandidateSelectBlock, instanceId: string) => void;
}) {
  const timeline = readTimelineState(lessonState, block.reads?.key);
  const selectedCandidate = readStringState(lessonState, block.writes?.key);

  return (
    <div className="grid gap-4">
      <section className="border border-line bg-white p-5">
        <p className="text-sm font-semibold text-primary">첫 AX 후보 선택</p>
        <div className="mt-4 grid gap-2">
          {timeline.length === 0 ? (
            <p className="rounded-lg bg-soft p-4 text-sm leading-7 text-muted">
              선택할 후보가 없습니다. 타임라인 페이지에서 업무를 먼저 배치하세요.
            </p>
          ) : (
            timeline.map((item) => (
              <button
                className={`focus-ring border p-4 text-left transition active:translate-y-px ${
                  selectedCandidate === item.instanceId
                    ? "border-primary bg-primary-light"
                    : "border-line bg-white hover:border-primary/30"
                }`}
                key={item.instanceId}
                onClick={() => onSelectCandidate(block, item.instanceId)}
                type="button"
              >
                <p className="text-xs font-bold text-primary">
                  {categoryLabel[item.category]} 작업
                </p>
                <p className="mt-1 font-semibold text-ink">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{item.axReason}</p>
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
