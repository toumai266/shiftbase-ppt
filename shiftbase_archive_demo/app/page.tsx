"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FreeStartSection } from "@/components/home/FreeStartSection";
import { HomeHero } from "@/components/home/HomeHero";
import { SiteShell } from "@/components/SiteShell";
import { courses, featuredCourse, type Course } from "@/lib/content";

const lessonHref = `/learn/${featuredCourse.slug}/${featuredCourse.firstLessonSlug}`;

const heroSlides = [
  {
    title: "당신의 일에 AI라는 날개를 달아보세요",
    subtitle: "AI를 가장 쉽게 학습하기. Shiftbase에서 시작하세요.",
    cta: "지금 바로 배우러 가기",
    href: lessonHref,
    image: "/assets/hero/launching.webp",
    progressTone: "light" as const
  },
  {
    title: "업무를 나누고 AI 지점을 찾기",
    subtitle: "첫 컨테이너는 내 하루 업무 지도에서 시작합니다.",
    cta: "학습 시작",
    href: lessonHref,
    image: "/assets/hero/banner1.webp",
    progressTone: "dark" as const
  },
  {
    title: "결과물로 남는 AX 학습",
    subtitle: "보고 끝나는 강의가 아니라 직접 완성하는 흐름입니다.",
    cta: "컨테이너 보기",
    href: "/learning",
    image: "/assets/hero/banner2.webp",
    progressTone: "light" as const
  }
];

const bestCategories = ["전체", "사무직", "AI 입문", "업무 자동화"];
const newCategories = ["전체", "무료", "실습형"];

function courseMatchesCategory(course: Course, category: string) {
  if (category === "전체") return true;
  if (category === "사무직") return course.industry === "사무직";
  if (category === "AI 입문") return course.level === "초급";
  if (category === "무료") return course.priceType === "무료";
  if (category === "업무 자동화") {
    const text = [
      course.title,
      course.subtitle,
      course.description,
      ...course.outcomes,
      ...course.curriculum
    ].join(" ");

    return text.includes("자동화");
  }
  if (category === "실습형") {
    return course.modules.some((module) => module.format === "따라 하기" || module.format === "적용 판단");
  }

  return true;
}

function CategoryButtons({
  active,
  items,
  onSelect
}: {
  active: string;
  items: string[];
  onSelect: (item: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {items.map((item) => {
        const isActive = active === item;

        return (
          <button
            aria-pressed={isActive}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "border-primary bg-primary text-white shadow-soft"
                : "border-line bg-white text-muted hover:border-primary/30 hover:text-ink"
            }`}
            key={item}
            onClick={() => onSelect(item)}
            type="button"
          >
            <span>{item}</span>
          </button>
        );
      })}
    </div>
  );
}

function CourseMiniCard({ course }: { course: Course }) {
  const thumbnail = course.modules[0]?.thumbnail ?? "/assets/ax-learning-platform-mockup.png";
  const moduleCount = course.modules.length;
  const priceLabel = course.priceType === "무료" ? "무료" : course.price;

  return (
    <Link
      className="focus-ring group overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-card"
      href={`/learning/${course.slug}`}
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
            {moduleCount}개 모듈
          </span>
        </div>
        <h3 className="mt-3 line-clamp-2 text-base font-semibold tracking-tight text-ink transition group-hover:text-primary">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
          {course.subtitle}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-ink">{priceLabel}</span>
        </div>
      </div>
    </Link>
  );
}

function LearningSection({
  eyebrow,
  title,
  description,
  categories
}: {
  eyebrow: string;
  title: string;
  description: string;
  categories: string[];
}) {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const visibleCourses = useMemo(() => {
    return courses.filter((course) => courseMatchesCategory(course, activeCategory)).slice(0, 10);
  }, [activeCategory]);

  return (
    <section className="bg-soft">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-7">
          <div>
            <p className="text-sm font-black tracking-[0.18em] text-primary">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 text-base font-semibold text-muted">{description}</p>
          </div>
          <div className="mt-5">
            <CategoryButtons
              active={activeCategory}
              items={categories}
              onSelect={setActiveCategory}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {visibleCourses.map((course) => (
            <CourseMiniCard
              course={course}
              key={`${eyebrow}-${course.slug}`}
            />
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ink shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
            href="/learning"
          >
            전체 학습 컨테이너 확인하기 <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <SiteShell>
      <main className="bg-soft">
        <HomeHero slides={heroSlides} />

        <FreeStartSection courses={courses} />

        <LearningSection
          categories={bestCategories}
          description="가장 많은 학습자가 주목하는 학습 컨테이너를 만나보세요."
          eyebrow="BEST"
          title="실시간 BEST 인기 학습"
        />

        <LearningSection
          categories={newCategories}
          description="새롭게 추가된 신규 학습 컨테이너를 살펴보세요."
          eyebrow="NEW"
          title="신규 오픈 학습"
        />

      </main>
    </SiteShell>
  );
}
