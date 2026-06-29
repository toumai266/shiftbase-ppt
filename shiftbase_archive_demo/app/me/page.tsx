import { ArrowRight, BookOpenCheck, HardDrive, MessageCircleQuestion, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import { SiteShell } from "@/components/SiteShell";
import { featuredCourse } from "@/lib/content";

export default function MePage() {
  const upcomingModules = featuredCourse.modules.slice(1);

  return (
    <SiteShell>
      <main>
        <section className="border-b border-line">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="text-sm text-muted">
              <span className="text-muted/60">홈</span> / 내 학습
            </p>

            <div className="mt-6 grid gap-8 md:grid-cols-[1fr_340px]">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  게스트 학습 현황
                </h1>
                <p className="mt-3 max-w-lg text-base leading-7 text-muted">
                  아직 계정 기반 저장은 제공하지 않습니다. 현재 학습 진행과 실습 상태는 이 브라우저의 로컬 저장소에만 보관됩니다.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ButtonLink href={`/learning/${featuredCourse.slug}`}>
                    이어서 학습하기
                  </ButtonLink>
                  <ButtonLink href="/find-course" variant="secondary">
                    콘텐츠 다시 추천받기
                  </ButtonLink>
                </div>
              </div>

              <aside className="rounded-2xl border border-line p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    AX
                  </span>
                  <div>
                    <p className="font-semibold">게스트 학습자</p>
                    <p className="text-xs text-muted">브라우저 로컬 저장 모드</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 text-sm leading-6 text-muted">
                  <p className="flex gap-2">
                    <HardDrive size={16} className="mt-1 shrink-0 text-primary" />
                    같은 브라우저에서 학습 페이지를 다시 열면 진행 중인 실습 상태를 복원합니다.
                  </p>
                  <p className="flex gap-2">
                    <ShieldCheck size={16} className="mt-1 shrink-0 text-primary" />
                    서버 계정 저장, 수료 이력, 다운로드 보관함은 백엔드 도입 후 제공합니다.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="mb-2 text-sm font-semibold text-primary">시작 가능한 컨테이너</p>
          <h2 className="mb-6 text-xl font-bold tracking-tight">현재 공개된 학습</h2>
          <div className="grid gap-6 md:grid-cols-[1fr_auto]">
            <div className="rounded-2xl border border-primary/20 bg-primary-light/30 p-6">
              <div className="flex flex-wrap gap-1.5">
                <span className="chip bg-primary-light text-primary">{featuredCourse.level}</span>
                <span className="chip bg-primary-light text-primary">{featuredCourse.industry}</span>
              </div>
              <h3 className="mt-3 text-lg font-bold">{featuredCourse.title}</h3>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
                {featuredCourse.subtitle}
              </p>
              <div className="mt-5">
                <ButtonLink href={`/learning/${featuredCourse.slug}`} size="sm">
                  상세 보기 <ArrowRight size={14} />
                </ButtonLink>
              </div>
            </div>
            <div className="grid gap-2 self-start">
              {featuredCourse.outcomes.slice(0, 3).map((item) => (
                <div
                  className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm"
                  key={item}
                >
                  <BookOpenCheck size={15} className="shrink-0 text-success" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-soft">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <p className="mb-2 text-sm font-semibold text-primary">다음 모듈</p>
            <h2 className="mb-6 text-xl font-bold tracking-tight">같은 컨테이너에서 이어질 내용</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {upcomingModules.map((module) => (
                <div
                  className="group overflow-hidden rounded-2xl border border-line bg-white transition-colors hover:border-primary/20"
                  key={module.slug}
                >
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src={module.thumbnail}
                      alt={`${module.title} 썸네일`}
                      className="object-cover"
                      fill
                      sizes="(min-width: 640px) 33vw, 100vw"
                    />
                  </div>
                  <div className="p-5">
                    <BookOpenCheck className="mb-3 text-primary" size={20} />
                    <p className="text-sm font-bold leading-snug group-hover:text-primary">
                      {module.title}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted">{module.question}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-muted">
                      {module.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm text-muted">
              <MessageCircleQuestion size={16} className="shrink-0 text-primary" />
              추천 기준을 바꾸려면{" "}
              <a href="/find-course" className="font-semibold text-primary hover:underline">
                내 콘텐츠 찾기
              </a>
              에서 다시 답변하세요.
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
