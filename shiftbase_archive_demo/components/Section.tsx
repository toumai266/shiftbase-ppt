import type { ReactNode } from "react";

export function Section({
  eyebrow,
  title,
  description,
  children,
  className = ""
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 ${className}`}>
      <div className="mb-10 max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-sm font-semibold text-primary">{eyebrow}</p>
        ) : null}
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        {description ? (
          <p className="mt-3 text-base leading-7 text-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
