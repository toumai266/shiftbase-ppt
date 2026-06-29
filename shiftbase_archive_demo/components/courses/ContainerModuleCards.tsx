import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CourseModule } from "@/lib/content";

type ContainerModuleCardsProps = {
  modules: CourseModule[];
  variant?: "light" | "dark";
};

function ModuleRow({
  module,
  variant = "light"
}: {
  module: CourseModule;
  variant?: "light" | "dark";
}) {
  const href = module.status === "학습 가능" ? module.href : undefined;
  const surface =
    variant === "dark"
      ? "border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.09]"
      : "border-line bg-white text-ink hover:border-primary/25";
  const muted = variant === "dark" ? "text-white/62" : "text-muted";
  const chip =
    variant === "dark"
      ? "bg-white/12 text-white"
      : "bg-primary-light text-primary";

  const content = (
    <article
      className={`grid gap-4 rounded-2xl border p-5 transition-colors sm:grid-cols-[1fr_auto] sm:items-center ${surface}`}
    >
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${chip}`}>
            {module.format}
          </span>
          <span className={href ? "text-xs font-semibold text-primary" : `text-xs font-semibold ${muted}`}>
            {module.status}
          </span>
        </div>
        <h3 className="text-lg font-bold tracking-tight">{module.title}</h3>
        <p className={`mt-2 text-sm leading-6 ${muted}`}>{module.question}</p>
      </div>
      {href ? (
        <span className="inline-flex items-center gap-2 text-sm font-bold text-primary">
          열기 <ArrowRight size={15} aria-hidden="true" />
        </span>
      ) : null}
    </article>
  );

  if (!href) return content;

  return (
    <Link className="focus-ring block rounded-2xl" href={href}>
      {content}
    </Link>
  );
}

export function ContainerModuleCards({
  modules,
  variant = "light"
}: ContainerModuleCardsProps) {
  return (
    <div className="grid gap-3">
      {modules.map((module) => (
        <ModuleRow key={module.slug} module={module} variant={variant} />
      ))}
    </div>
  );
}
