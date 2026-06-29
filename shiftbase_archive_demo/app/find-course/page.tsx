import { CourseFinderChat } from "@/components/find-course/CourseFinderChat";
import { SiteShell } from "@/components/SiteShell";

export default function FindCoursePage() {
  return (
    <SiteShell>
      <main>
        <section className="border-b border-line">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="text-sm text-muted">
              <span className="text-muted/60">홈</span> / 내 콘텐츠 찾기
            </p>
            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              내 콘텐츠 찾기
            </h1>
            <p className="mt-3 max-w-lg text-base leading-7 text-muted">
              업무 상황, 경험 수준, 예산을 선택하면 적합한 컨테이너를 추천합니다.
            </p>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <CourseFinderChat />
        </section>
      </main>
    </SiteShell>
  );
}
