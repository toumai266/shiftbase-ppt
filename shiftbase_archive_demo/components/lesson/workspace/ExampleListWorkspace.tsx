import { CheckCircle2 } from "lucide-react";
import type { LessonWorkspaceBlock } from "@/lib/containerSpec";

type ExampleListBlock = Extract<LessonWorkspaceBlock, { type: "example-list" }>;

export function ExampleListWorkspace({ block }: { block: ExampleListBlock }) {
  return (
    <div className="grid gap-4">
      {block.props.examples.map((group) => (
        <section className="border border-line bg-white p-5" key={group.title}>
          <h3 className="text-lg font-semibold text-ink">{group.title}</h3>
          <div className="mt-4 grid gap-2">
            {group.items.map((item) => (
              <p className="flex gap-3 text-sm leading-7 text-muted" key={item}>
                <CheckCircle2 className="mt-1 shrink-0 text-success" size={15} aria-hidden="true" />
                <span>{item}</span>
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
