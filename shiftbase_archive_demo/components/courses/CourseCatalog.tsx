"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { courses, type Course } from "@/lib/content";

type IndustryFilter =
  | "전체"
  | "공통"
  | "사무직"
  | "무료";
type LevelFilter = "전체" | "왕초보" | "초급" | "중급" | "고급";
type SortOption = "추천순" | "인기순" | "최신순";

const industryOptions: IndustryFilter[] = [
  "전체",
  "공통",
  "사무직",
  "무료"
];
const levelOptions: LevelFilter[] = ["전체", "왕초보", "초급", "중급", "고급"];
const sortOptions: SortOption[] = ["추천순", "인기순", "최신순"];

function FilterButton<T extends string>({
  value,
  active,
  onClick
}: {
  value: T;
  active: boolean;
  onClick: (value: T) => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={`focus-ring shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
        active
          ? "border-primary bg-primary text-white"
          : "border-line bg-white text-muted hover:border-primary/20 hover:bg-[#FAF8FF] hover:text-ink"
      }`}
      onClick={() => onClick(value)}
      type="button"
    >
      {value}
    </button>
  );
}

function LevelDropdown({
  value,
  onChange
}: {
  value: LevelFilter;
  onChange: (value: LevelFilter) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        aria-expanded={open}
        className={`focus-ring inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
          value !== "전체"
            ? "border-primary bg-primary text-white"
            : "border-line bg-white text-muted hover:border-primary/20 hover:bg-[#FAF8FF] hover:text-ink"
        }`}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        난이도{value !== "전체" ? ` · ${value}` : ""}
        <ChevronDown size={14} strokeWidth={1.8} aria-hidden="true" />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-20 mt-2 w-36 overflow-hidden rounded-2xl border border-line bg-white p-1 shadow-card">
          {levelOptions.map((option) => (
            <button
              aria-pressed={value === option}
              className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                value === option ? "bg-primary-light text-primary" : "text-muted hover:bg-soft hover:text-ink"
              }`}
              key={option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function matchesIndustry(course: Course, industry: IndustryFilter) {
  if (industry === "전체") return true;
  if (industry === "무료") return course.priceType === "무료";
  return course.industry === industry;
}

function matchesLevel(course: Course, level: LevelFilter) {
  if (level === "전체") return true;
  if (level === "왕초보") return course.level === "초급";
  return course.level === level;
}

function sortCourses(items: Course[], sort: SortOption) {
  if (sort === "인기순") {
    return [...items].sort((a, b) => {
      const score = (course: Course) => {
        if (course.badge === "대표 강의") return 3;
        if (course.badge === "BEST") return 2;
        if (course.badge === "무료") return 1;
        return 0;
      };

      return score(b) - score(a);
    });
  }

  if (sort === "최신순") {
    return [...items].sort((a, b) => {
      const score = (course: Course) => (course.badge === "NEW" ? 1 : 0);
      return score(b) - score(a);
    });
  }

  return items;
}

export function CourseCatalog() {
  const [industry, setIndustry] = useState<IndustryFilter>("전체");
  const [level, setLevel] = useState<LevelFilter>("전체");
  const [sort, setSort] = useState<SortOption>("추천순");

  const filtered = useMemo(() => {
    const items = courses.filter((course) => {
      if (!matchesIndustry(course, industry)) return false;
      if (!matchesLevel(course, level)) return false;
      return true;
    });

    return sortCourses(items, sort);
  }, [industry, level, sort]);

  return (
    <div>
      <div className="border-b border-line pb-5">
        <div className="flex flex-wrap gap-2 pb-2">
          {industryOptions.map((option) => (
            <FilterButton
              active={industry === option}
              key={option}
              onClick={setIndustry}
              value={option}
            />
          ))}
          <LevelDropdown value={level} onChange={setLevel} />
        </div>
      </div>

      <div className="mb-5 mt-6 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold tracking-tight">전체 학습 컨테이너</h1>
        <div className="flex items-center gap-1 text-sm">
          {sortOptions.map((option) => (
            <button
              aria-pressed={sort === option}
              className={`focus-ring rounded-full px-3 py-1.5 font-semibold transition ${
                sort === option ? "bg-primary text-white" : "text-muted hover:bg-soft hover:text-ink"
              }`}
              key={option}
              onClick={() => setSort(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {filtered.map((course) => {
          const thumbnail = course.modules[0]?.thumbnail ?? "/assets/ax-learning-platform-mockup.png";
          const priceLabel = course.priceType === "무료" ? "무료" : course.price;

          return (
            <Link
              className="focus-ring group overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-card"
              href={`/learning/${course.slug}`}
              key={course.slug}
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-soft">
                <Image
                  alt={`${course.title} 썸네일`}
                  className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  src={thumbnail}
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2 text-xs font-medium">
                  <span className="rounded-full bg-primary-light px-2.5 py-1 text-primary">
                    {course.level}
                  </span>
                  <span className="rounded-full bg-soft px-2.5 py-1 text-muted">
                    {course.modules.length}개 모듈
                  </span>
                </div>
                <h2 className="mt-3 line-clamp-2 text-base font-semibold tracking-tight text-ink transition group-hover:text-primary">
                  {course.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                  {course.subtitle}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-ink">{priceLabel}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-5 rounded-2xl border border-line p-10 text-center">
          <p className="font-semibold">조건에 맞는 컨테이너가 없습니다</p>
          <p className="mt-1 text-sm text-muted">
            필터를 줄이거나 내 콘텐츠 찾기를 이용해 보세요.
          </p>
        </div>
      )}
    </div>
  );
}
