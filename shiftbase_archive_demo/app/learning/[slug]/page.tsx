import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, PackageOpen, PlayCircle, UsersRound } from "lucide-react";
import { MarkdownContent } from "@/components/MarkdownContent";
import { CourseModuleAccordion } from "@/components/courses/CourseModuleAccordion";
import { SiteShell } from "@/components/SiteShell";
import { courses } from "@/lib/content";

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = courses.find((item) => item.slug === slug);
  if (!course) {
    return {
      title: "학습 컨테이너를 찾을 수 없습니다"
    };
  }

  const image = course.modules[0]?.thumbnail ?? "/assets/container-ai-workshift/work-map.png";

  return {
    title: `${course.title} | Shiftbase`,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      images: [image]
    }
  };
}

export default async function CourseDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = courses.find((item) => item.slug === slug);
  if (!course) notFound();

  const heroThumbnail = course.modules[0]?.thumbnail ?? "/assets/container-ai-workshift/work-map.png";
  const hasDiscount = course.originalPrice > course.salePrice && course.discountRate > 0;

  return (
    <SiteShell>
      <main className="bg-white">
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden border-b border-line bg-ink">
          <Image
            src={heroThumbnail}
            alt=""
            className="scale-110 object-cover opacity-28 blur-2xl"
            fill
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.9),rgba(15,23,42,0.72)_48%,rgba(15,23,42,0.56))]" />
          <div className="relative mx-auto grid h-[408px] max-w-5xl items-center px-4 sm:px-6 lg:grid-cols-[minmax(0,640px)_300px] lg:gap-8 lg:px-8">
            <div className="min-w-0 pt-6">
              <h1 className="text-[32px] font-semibold leading-[1.14] tracking-tight text-white">
                {course.title}
              </h1>
              <p className="mt-3 max-w-2xl pb-4 text-base font-normal leading-6 text-white">
                {course.description}
              </p>
              {course.displayBadges.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {course.displayBadges.map((badge, index) => (
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-ink shadow-sm" key={`${badge}-${index}`}>
                      {badge}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,640px)_300px] lg:items-start lg:px-8">
          <div className="min-w-0">
            {/* ─── Capabilities ─── */}
            <section>
              <article className="rounded-xl border border-line bg-white p-4">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight">
                  <PackageOpen className="text-primary" size={18} strokeWidth={2} aria-hidden="true" />
                  <span>이 학습 후에는</span>
                </h2>
                <ul className="grid gap-2.5">
                  {course.outcomes.map((outcome) => (
                    <li className="flex gap-2.5 text-sm font-semibold leading-6 text-ink" key={outcome}>
                      <CheckCircle2 className="mt-1 shrink-0 text-primary" size={14} aria-hidden="true" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </article>
            </section>

            {/* ─── Learning feature ─── */}
            <section className="relative mt-12 overflow-hidden rounded-2xl border border-line bg-white">
              <div className="grid gap-4 p-6 sm:grid-cols-[1fr_220px] sm:items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">인터랙션 학습</h2>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    이 학습은 사용자의 조작을 필요로 합니다. 학습을 도와주는 다양한 인터랙션으로 쉽고 빠르게 익힐 수 있습니다.
                  </p>
                  <a
                    className="mt-4 inline-flex text-sm font-semibold text-primary underline underline-offset-4 transition hover:text-primary-dark"
                    href="/about"
                  >
                    인터랙션 학습 자세히 알아보기
                  </a>
                </div>
                <div className="relative hidden h-40 w-[220px] sm:block">
                  <Image
                    src="/assets/courses/interactive-learning-3d.png"
                    alt=""
                    className="rounded-2xl object-contain"
                    fill
                    sizes="220px"
                  />
                </div>
              </div>
            </section>

            {/* ─── Freeform intro ─── */}
            <section className="mt-12">
              <MarkdownContent className="mt-3" markdown={course.introMarkdown} />
            </section>

            <CourseModuleAccordion modules={course.modules} />

            {/* ─── Recommended for ─── */}
            <section className="mt-12">
              <h2 className="mb-5 flex items-center gap-2 text-xl font-bold tracking-tight">
                <UsersRound className="text-primary" size={20} strokeWidth={2} aria-hidden="true" />
                <span>이런 분들에게 추천해요</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {course.recommendations.map((item, index) => (
                  <article className="grid min-h-[132px] overflow-hidden rounded-2xl border border-line bg-white sm:grid-cols-[112px_1fr]" key={`${item.text}-${index}`}>
                    <div className="relative bg-primary-light/45">
                      <Image
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        src={item.image}
                        fill
                        sizes="112px"
                      />
                    </div>
                    <div className="flex items-center px-4 py-4">
                      <p className="text-sm font-semibold leading-6 text-ink">{item.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="h-fit overflow-hidden rounded-2xl border border-line bg-white shadow-[0_24px_80px_-52px_rgba(15,23,42,0.75)] lg:sticky lg:top-20 lg:-mt-[22rem]">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={heroThumbnail}
                alt={`${course.title} 썸네일`}
                className="object-cover"
                fill
                sizes="(min-width: 1024px) 300px, 100vw"
              />
            </div>
            <div className="p-5">
              {hasDiscount ? (
                <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                  <span className="text-danger">{course.discountRate}%</span>
                  <span className="text-muted line-through">{course.originalPrice.toLocaleString("ko-KR")}원</span>
                </div>
              ) : null}
              <p className="text-3xl font-bold tracking-tight">{course.price}</p>
              {course.salePrice === 0 ? (
              <div className="mt-5 grid gap-3 text-sm">
                <span className="flex items-center gap-2 text-muted">
                  <PlayCircle size={15} className="text-success" />
                  무료 즉시 학습
                </span>
              </div>
              ) : null}
              <a
                className="focus-ring mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
                href={`/learn/${course.slug}/${course.firstLessonSlug}`}
              >
                바로 시작하기 <PlayCircle size={16} aria-hidden="true" />
              </a>
              <div className="mt-6 border-t border-line pt-5">
                <p className="text-sm font-semibold">추천 대상</p>
                <ul className="mt-3 grid gap-2">
                  {course.recommendedFor.map((item) => (
                    <li className="text-sm leading-relaxed text-muted" key={item}>
                      · {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </SiteShell>
  );
}
