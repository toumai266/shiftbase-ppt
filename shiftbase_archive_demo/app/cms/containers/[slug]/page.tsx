import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, MessageSquareText } from "lucide-react";
import { ContainerInlineEditor } from "@/components/cms/AuthoringWorkflow";
import { Header } from "@/components/SiteShell";
import { isLocalCmsEnabled, readLocalContainerSpec } from "@/lib/localCms";

export const dynamic = "force-dynamic";

export default async function LocalCmsContainerPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!isLocalCmsEnabled()) notFound();
  const { slug } = await params;
  const container = await readLocalContainerSpec(slug).catch(() => undefined);
  if (!container) notFound();

  return (
    <div className="min-h-[100dvh] bg-white">
      <Header />
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link className="focus-ring inline-flex items-center gap-2 text-sm font-semibold text-muted" href="/cms/containers">
          <ArrowLeft size={16} aria-hidden="true" />
          컨테이너 목록
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Link className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink shadow-soft hover:bg-soft" href={`/preview/containers/${container.slug}`}>
            <Eye size={14} aria-hidden="true" />
            실제 화면 프리뷰
          </Link>
          <Link className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink shadow-soft hover:bg-soft" href={`/cms/containers/${container.slug}/arena`}>
            <MessageSquareText size={14} aria-hidden="true" />
            평가 아레나
          </Link>
        </div>
      </div>
      <ContainerInlineEditor initialSpec={container} />
    </div>
  );
}
