import { notFound } from "next/navigation";
import { PageContentEditor } from "@/components/cms/AuthoringWorkflow";
import { Header } from "@/components/SiteShell";
import { isLocalCmsEnabled, readLocalContainerSpec } from "@/lib/localCms";

export const dynamic = "force-dynamic";

export default async function LocalCmsPageEditor({
  params
}: {
  params: Promise<{ slug: string; pageId: string }>;
}) {
  if (!isLocalCmsEnabled()) notFound();
  const { slug, pageId } = await params;
  const container = await readLocalContainerSpec(slug).catch(() => undefined);
  if (!container) notFound();

  return (
    <div className="min-h-[100dvh] bg-[#eceff3]">
      <Header />
      <main className="min-w-[1280px] bg-[#eceff3]">
        <PageContentEditor initialSpec={container} pageId={pageId} />
      </main>
    </div>
  );
}
