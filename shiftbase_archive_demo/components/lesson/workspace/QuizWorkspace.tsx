import type { LessonWorkspaceBlock } from "@/lib/containerSpec";

type QuizBlock = Extract<LessonWorkspaceBlock, { type: "quiz" }>;

export function QuizWorkspace({ block }: { block: QuizBlock }) {
  return (
    <section className="border border-line bg-white p-5">
      <p className="text-sm font-semibold text-primary">퀴즈</p>
      <h3 className="mt-2 text-lg font-semibold text-ink">{block.props.question}</h3>
      <div className="mt-4 grid gap-2">
        {block.props.options.map((option) => (
          <button
            className="focus-ring border border-line bg-white px-3 py-2 text-left text-sm font-medium text-ink transition hover:border-primary/30 hover:bg-soft"
            key={option}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}
