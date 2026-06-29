"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpenText, ChevronDown } from "lucide-react";
import type { CourseModule } from "@/lib/content";

type CourseModuleAccordionProps = {
  modules: CourseModule[];
};

export function CourseModuleAccordion({ modules }: CourseModuleAccordionProps) {
  const [openModules, setOpenModules] = useState(() => modules.map(() => false));
  const isAllOpen = openModules.length > 0 && openModules.every(Boolean);
  const lessonCount = modules.reduce((total, module) => total + module.items.length, 0);

  const setModuleOpen = (index: number, isOpen: boolean) => {
    setOpenModules((current) => {
      const next = [...current];
      next[index] = isOpen;
      return next;
    });
  };

  const toggleAll = () => {
    setOpenModules(modules.map(() => !isAllOpen));
  };

  return (
    <section className="mt-12">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <BookOpenText className="text-primary" size={20} strokeWidth={2} aria-hidden="true" />
            <span>모듈</span>
          </h2>
          <p className="mt-1 text-xs font-medium text-muted">전체 {lessonCount}개 레슨</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            className="focus-ring rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold text-muted transition hover:border-primary/20 hover:bg-[#FAF8FF] hover:text-primary"
            onClick={toggleAll}
            type="button"
          >
            {isAllOpen ? "모두 접기" : "모두 펼치기"}
          </button>
        </div>
      </div>
      <div className="grid overflow-hidden rounded-2xl border border-line bg-white">
        {modules.map((module, index) => {
          return (
            <details
              className="group border-b border-line last:border-b-0"
              key={module.slug}
              onToggle={(event) => setModuleOpen(index, event.currentTarget.open)}
              open={openModules[index]}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-[#FAF8FF] px-5 py-4 transition hover:bg-[#F6F2FF]">
                <span className="text-sm font-semibold text-ink">
                  모듈 {index + 1}. {module.title}
                </span>
                <ChevronDown className="shrink-0 text-muted transition group-open:rotate-180" size={17} strokeWidth={1.8} aria-hidden="true" />
              </summary>
              <div className="border-t border-line bg-white">
                <ol className="divide-y divide-line text-sm">
                  {module.items.map((item, itemIndex) => (
                    <li className="list-none" key={item.id}>
                      {item.href ? (
                        <Link
                          className="focus-ring flex items-center justify-between gap-4 py-3.5 pl-9 pr-5 font-medium text-ink transition hover:bg-soft/70 hover:text-primary"
                          href={item.href}
                        >
                          <span>{itemIndex + 1}) {item.title}</span>
                          <span className="text-xs font-medium text-primary">학습하기</span>
                        </Link>
                      ) : (
                        <div className="flex items-center justify-between gap-4 py-3.5 pl-9 pr-5 font-medium text-muted">
                          <span>{itemIndex + 1}) {item.title}</span>
                          <span className="text-xs font-medium">{item.status}</span>
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
