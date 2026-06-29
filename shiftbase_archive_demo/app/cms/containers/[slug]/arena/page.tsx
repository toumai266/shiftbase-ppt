import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquareText } from "lucide-react";
import { EvaluationArena } from "@/components/cms/EvaluationArena";
import { Header } from "@/components/SiteShell";
import { evaluationService } from "@/lib/backend/evaluationService";
import { buildEvaluationTargetOptions } from "@/lib/backend/evaluationScope";
import { isLocalCmsEnabled, readLocalContainerSpec } from "@/lib/localCms";

export const dynamic = "force-dynamic";

export default async function LocalCmsEvaluationArenaPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!isLocalCmsEnabled()) notFound();
  const { slug } = await params;
  const container = await readLocalContainerSpec(slug).catch(() => undefined);
  if (!container) notFound();

  const threads = await evaluationService.listThreads(container.slug);
  const targetOptions = buildEvaluationTargetOptions(container);

  return (
    <div className="min-h-[100dvh] bg-[#f5f7fb] text-ink">
      <Header />
      <main className="mx-auto max-w-[1760px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link className="focus-ring inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-muted hover:bg-white" href={`/cms/containers/${container.slug}`}>
            <ArrowLeft size={16} aria-hidden="true" />
            컨테이너 편집
          </Link>
          <Link className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink shadow-soft hover:bg-soft" href={`/cms/containers/${container.slug}/review`}>
            <MessageSquareText size={14} aria-hidden="true" />
            기존 리뷰
          </Link>
        </div>
        <EvaluationArena
          containerTitle={container.title}
          containerSlug={container.slug}
          initialParticipants={evaluationService.participantCatalog}
          initialThreads={threads}
          targetOptions={targetOptions}
        />
      </main>
    </div>
  );
}
