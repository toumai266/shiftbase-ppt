import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/SiteShell";
import { isLocalCmsEnabled, readLocalContainerSpec } from "@/lib/localCms";
import type { ContainerSpec, LessonWorkspaceBlock } from "@/lib/containerSpec";

export const dynamic = "force-dynamic";

type ReviewItem = {
  level: "ok" | "warning";
  title: string;
  detail: string;
  href?: string;
};

export default async function LocalCmsReviewPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!isLocalCmsEnabled()) notFound();
  const { slug } = await params;
  const container = await readLocalContainerSpec(slug).catch(() => undefined);
  if (!container) notFound();

  const items = await buildReviewItems(container);
  const warnings = items.filter((item) => item.level === "warning");

  return (
    <div className="min-h-[100dvh] bg-[#f7f9fc]">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link className="focus-ring inline-flex items-center gap-2 text-sm font-semibold text-muted" href={`/cms/containers/${container.slug}`}>
          <ArrowLeft size={16} aria-hidden="true" />
          컨테이너 편집
        </Link>

        <section className="mt-5 rounded-xl border border-line bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold text-primary">Review</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">{container.title}</h1>
          <p className="mt-3 text-sm leading-7 text-muted">
            이미지 경로와 공개 전 확인할 항목만 보여줍니다.
          </p>
          <div className="mt-5 rounded-lg border border-line bg-soft p-4">
            {warnings.length === 0 ? (
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <CheckCircle2 size={17} className="text-success" aria-hidden="true" />
                현재 확인할 경고가 없습니다.
              </p>
            ) : (
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <AlertCircle size={17} className="text-warning" aria-hidden="true" />
                확인할 경고 {warnings.length}개가 있습니다.
              </p>
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-3">
          {items.map((item) => (
            <article className="rounded-xl border border-line bg-white p-4 shadow-soft" key={`${item.level}-${item.title}-${item.detail}`}>
              <div className="flex items-start gap-3">
                {item.level === "ok" ? (
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
                ) : (
                  <AlertCircle size={18} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-ink">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">{item.detail}</p>
                </div>
                {item.href ? (
                  <Link className="focus-ring shrink-0 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-soft" href={item.href}>
                    수정
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

async function buildReviewItems(container: ContainerSpec): Promise<ReviewItem[]> {
  const items: ReviewItem[] = [];
  const pageCount = container.modules.reduce(
    (moduleTotal, module) =>
      moduleTotal + module.lessons.reduce((lessonTotal, lesson) => lessonTotal + lesson.pages.length, 0),
    0
  );

  items.push({
    level: "warning",
    title: "로컬 파일 authoring backend",
    detail: "현재 저작 백엔드는 trusted operator 환경에서만 켜는 로컬 파일 저장소입니다. 공개 배포용 인증/DB/감사 로그를 대체하지 않습니다."
  });

  if (container.status !== "published") {
    items.push({
      level: "warning",
      title: "아직 draft 상태입니다",
      detail: "공개 학습 경로에는 production에서 draft 컨테이너가 노출되지 않습니다.",
      href: `/cms/containers/${container.slug}`
    });
  }

  if (pageCount < 2) {
    items.push({
      level: "warning",
      title: "페이지 수가 적습니다",
      detail: "인터랙티브 컨테이너는 보통 도입, 조작, 정리 페이지가 분리되어야 저작과 학습 흐름이 명확합니다.",
      href: `/cms/containers/${container.slug}`
    });
  }

  await pushMissingAssetWarning(items, container.coverImage, {
    title: "대표 이미지 경로 확인 필요",
    detailPrefix: "대표 이미지",
    href: `/cms/containers/${container.slug}`
  });

  for (const [cardIndex, card] of (container.recommendationCards ?? []).entries()) {
    await pushMissingAssetWarning(items, card.image, {
      title: "추천 카드 이미지 경로 확인 필요",
      detailPrefix: `추천 카드 ${cardIndex + 1}`,
      href: `/cms/containers/${container.slug}`
    });
  }

  for (const [imageIndex, image] of getMarkdownImagePaths(container.introMarkdown ?? "").entries()) {
    await pushMissingAssetWarning(items, image, {
      title: "본문 이미지 경로 확인 필요",
      detailPrefix: `본문 이미지 ${imageIndex + 1}`,
      href: `/cms/containers/${container.slug}`
    });
  }

  for (const module of container.modules) {
    for (const lesson of module.lessons) {
      for (const page of lesson.pages) {
        if (page.workspace.blocks.length === 0) {
          items.push({
            level: "warning",
            title: "우측 페이지 없음",
            detail: `${page.title} 페이지에 우측 페이지가 없습니다.`,
            href: `/cms/containers/${container.slug}`
          });
        }
        for (const block of page.workspace.blocks) {
          const image = getBlockImage(block);
          await pushMissingAssetWarning(items, image, {
            title: "블록 이미지 경로 확인 필요",
            detailPrefix: `${block.id} 블록`,
            href: `/cms/containers/${container.slug}`
          });
        }
      }
    }
  }

  if (items.every((item) => item.level === "ok")) {
    items.push({
      level: "ok",
      title: "학습자 미리보기 권장",
      detail: "편집 UI가 없는 실제 플레이어에서 인터랙션 상태 흐름을 한 번 확인하세요.",
      href: `/preview/containers/${container.slug}`
    });
  }

  return items;
}

function getBlockImage(block: LessonWorkspaceBlock) {
  if (block.type !== "image-definition") return undefined;
  return block.props.image;
}

function getMarkdownImagePaths(markdown: string) {
  return Array.from(markdown.matchAll(/!\[[^\]]*]\(([^)]+)\)/g), (match) => match[1]);
}

async function pushMissingAssetWarning(
  items: ReviewItem[],
  assetPath: string | undefined,
  options: {
    title: string;
    detailPrefix: string;
    href: string;
  }
) {
  if (!assetPath || await publicAssetExists(assetPath)) return;
  items.push({
    level: "warning",
    title: options.title,
    detail: `${options.detailPrefix}의 ${assetPath} 파일을 public 경로에서 찾지 못했습니다.`,
    href: options.href
  });
}

async function publicAssetExists(assetPath: string) {
  if (!assetPath.startsWith("/")) return true;
  const filePath = path.join(process.cwd(), "public", assetPath);
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
