import type { LessonWorkspaceBlock } from "@/lib/containerSpec";

type ChecklistBlock = Extract<LessonWorkspaceBlock, { type: "checklist" }>;

export function ChecklistWorkspace({ block }: { block: ChecklistBlock }) {
  return (
    <section className="border border-line bg-white p-5">
      <h3 className="text-lg font-semibold text-ink">{block.props.title}</h3>
      <div className="mt-4 grid gap-2.5">
        {block.props.items.map((item) => (
          <label className="flex gap-3 text-sm leading-6 text-muted" key={item}>
            <input className="mt-1 h-4 w-4 rounded border-line text-primary" type="checkbox" />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
