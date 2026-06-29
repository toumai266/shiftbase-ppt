import Link from "next/link";
import { notFound } from "next/navigation";
import { FilePenLine, Plus } from "lucide-react";
import { CreateContainerForm, DeleteContainerButton } from "@/components/cms/AuthoringWorkflow";
import { Header } from "@/components/SiteShell";
import { isLocalCmsEnabled, readLocalContainerSpecs } from "@/lib/localCms";
import type { ContainerStatus } from "@/lib/containerSpec";

export const dynamic = "force-dynamic";

export default async function LocalCmsContainersPage() {
  if (!isLocalCmsEnabled()) notFound();

  const containers = await readLocalContainerSpecs();

  return (
    <div className="min-h-[100dvh] bg-[#f7f9fc]">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-primary">Shiftbase Authoring</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">컨테이너 관리</h1>
            <p className="mt-1 text-xs font-medium text-muted">
              실제 운영 중인 컨테이너와 작성 중인 컨테이너를 관리합니다.
            </p>
          </div>
        </div>

        <details className="mt-4">
          <summary className="focus-ring ml-auto flex w-fit cursor-pointer list-none items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-dark [&::-webkit-details-marker]:hidden">
            <Plus size={14} aria-hidden="true" />
            새 컨테이너 만들기
          </summary>
          <div className="mt-3">
            <CreateContainerForm />
          </div>
        </details>

        <section className="mt-4 overflow-x-auto rounded-lg border border-line bg-white shadow-soft">
          <div className="min-w-[820px]">
            <div className="grid grid-cols-[48px_minmax(0,1fr)_104px_104px_64px_64px_128px] gap-3 border-b border-line bg-soft px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
              <span>No.</span>
              <span>컨테이너</span>
              <span>상태</span>
              <span>최종 편집</span>
              <span>모듈</span>
              <span>페이지</span>
              <span className="text-right">작업</span>
            </div>

            {containers.map((container, index) => {
              const pageCount = container.modules.reduce(
                (moduleTotal, module) =>
                  moduleTotal +
                  module.lessons.reduce((lessonTotal, lesson) => lessonTotal + lesson.pages.length, 0),
                0
              );

              return (
                <article
                  className="grid grid-cols-[48px_minmax(0,1fr)_104px_104px_64px_64px_128px] items-center gap-3 border-b border-line px-3 py-2 last:border-b-0"
                  key={container.slug}
                >
                  <span className="text-xs font-semibold tabular-nums text-muted">{index + 1}</span>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-ink">{container.title}</h2>
                    <p className="mt-0.5 truncate text-xs text-muted">{container.slug} · {container.summary}</p>
                  </div>
                  <span className={statusBadgeClass(container.status)}>{statusLabel(container.status)}</span>
                  <span className="text-xs font-semibold tabular-nums text-muted">{formatUpdatedAt(container.updatedAt)}</span>
                  <span className="text-xs font-semibold tabular-nums text-muted">{container.modules.length}</span>
                  <span className="text-xs font-semibold tabular-nums text-muted">{pageCount}</span>
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      className="focus-ring inline-flex h-8 items-center justify-end gap-1.5 rounded-lg px-2 text-xs font-semibold text-primary transition hover:bg-primary-light"
                      href={`/cms/containers/${container.slug}`}
                    >
                      <FilePenLine size={14} aria-hidden="true" />
                      편집
                    </Link>
                    <DeleteContainerButton slug={container.slug} title={container.title} />
                  </div>
                </article>
              );
            })}

            {containers.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-muted">
                아직 컨테이너가 없습니다.
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}

function statusLabel(status: ContainerStatus) {
  return status === "published" ? "Published" : "Draft";
}

function statusBadgeClass(status: ContainerStatus) {
  return status === "published"
    ? "inline-flex w-fit items-center rounded-full border border-success/20 bg-success/10 px-2 py-1 text-xs font-semibold text-success"
    : "inline-flex w-fit items-center rounded-full border border-warning/25 bg-warning/10 px-2 py-1 text-xs font-semibold text-warning";
}

function formatUpdatedAt(updatedAt?: string) {
  return updatedAt?.trim() || "-";
}
