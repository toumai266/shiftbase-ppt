"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Gift, Sparkles, type LucideIcon } from "lucide-react";
import type { Course } from "@/lib/content";

type FreeStartCategory = {
  id: "free" | "beginner";
  title: string;
  label: string;
  description?: string;
  icon: LucideIcon;
};

const freeStartCategories: FreeStartCategory[] = [
  {
    id: "free",
    title: "무료로 시작하기",
    label: "무료",
    description: "지금 바로 0원으로 시작해보세요.",
    icon: Gift
  },
  {
    id: "beginner",
    title: "왕초보 추천",
    label: "왕초보",
    description: "IT가 익숙하지 않아도 시작하기 좋아요",
    icon: Sparkles
  }
];

function getCategoryCourses(courses: Course[], category: FreeStartCategory["id"]) {
  if (category === "free") {
    return courses.filter((course) => course.priceType === "무료");
  }

  return courses.filter((course) => course.level === "초급");
}

function FreeStartCard({ course }: { course: Course }) {
  const thumbnail = course.modules[0]?.thumbnail ?? "/assets/ax-learning-platform-mockup.png";
  const priceLabel = course.priceType === "무료" ? "무료" : course.price;

  return (
    <Link
      className="focus-ring group min-w-[230px] overflow-hidden rounded-2xl bg-white transition duration-200 hover:-translate-y-1 hover:shadow-card"
      href={`/learning/${course.slug}`}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-soft">
        <Image
          alt={`${course.title} 썸네일`}
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          src={thumbnail}
          fill
          sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 230px"
        />
      </div>
      <div className="p-3.5">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-6 tracking-tight text-ink">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
          {course.subtitle}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-ink">{priceLabel}</span>
        </div>
      </div>
    </Link>
  );
}

export function FreeStartSection({ courses }: { courses: Course[] }) {
  const [activeId, setActiveId] = useState<FreeStartCategory["id"]>("free");
  const [startIndex, setStartIndex] = useState(0);
  const activeCategory = freeStartCategories.find((category) => category.id === activeId) ?? freeStartCategories[0];
  const categoryCourses = useMemo(
    () => getCategoryCourses(courses, activeId),
    [activeId, courses]
  );
  const visibleCourses = useMemo(() => {
    const cardCount = Math.min(5, categoryCourses.length);

    return Array.from({ length: cardCount }, (_, index) => {
      return categoryCourses[(startIndex + index) % categoryCourses.length];
    });
  }, [categoryCourses, startIndex]);
  const canSlide = categoryCourses.length > visibleCourses.length;

  useEffect(() => {
    setStartIndex(0);
  }, [activeId]);

  const goPrev = () => {
    if (!canSlide) return;

    setStartIndex((index) => (index - 1 + categoryCourses.length) % categoryCourses.length);
  };

  const goNext = () => {
    if (!canSlide) return;

    setStartIndex((index) => (index + 1) % categoryCourses.length);
  };

  return (
    <section className="bg-soft">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
              {activeCategory.title}
            </h2>
            {activeCategory.description ? (
              <p className="mt-2 text-sm font-semibold text-muted">
                {activeCategory.description}
              </p>
            ) : null}
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-white text-muted shadow-soft transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              type="button"
              aria-label="이전 학습 컨테이너"
              disabled={!canSlide}
              onClick={goPrev}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink shadow-soft transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              type="button"
              aria-label="다음 학습 컨테이너"
              disabled={!canSlide}
              onClick={goNext}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {freeStartCategories.map((category) => {
            const Icon = category.icon;
            const isActive = category.id === activeId;

            return (
              <button
                aria-pressed={isActive}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-primary bg-primary text-white shadow-soft"
                    : "border-line bg-white text-muted hover:border-primary/30 hover:text-ink"
                }`}
                key={category.id}
                onClick={() => setActiveId(category.id)}
                title={category.description}
                type="button"
              >
                <Icon size={15} aria-hidden="true" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-5 grid gap-4 overflow-x-auto pb-1 sm:grid-cols-2 lg:grid-cols-5">
          {visibleCourses.map((course) => (
            <FreeStartCard course={course} key={`free-${activeId}-${course.slug}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
