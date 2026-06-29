import { Layers3 } from "lucide-react";
import type { LessonWorkspaceBlock } from "@/lib/containerSpec";

type IntroSummaryBlock = Extract<LessonWorkspaceBlock, { type: "intro-summary" }>;

export function IntroSummaryWorkspace({ block }: { block: IntroSummaryBlock }) {
  return (
    <div className="grid gap-4">
      <section className="border border-line bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
            <Layers3 size={19} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold text-muted">완성할 메모</p>
            <p className="text-xl font-semibold text-ink">{block.props.outputs.length}개</p>
          </div>
        </div>
        <div className="mt-5 grid gap-2">
          {block.props.outputs.map((output) => (
            <span className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink" key={output}>
              {output}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
