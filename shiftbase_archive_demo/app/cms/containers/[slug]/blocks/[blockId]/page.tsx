import { notFound, redirect } from "next/navigation";
import { isLocalCmsEnabled, readLocalContainerSpec } from "@/lib/localCms";

export const dynamic = "force-dynamic";

export default async function LocalCmsBlockRedirect({
  params
}: {
  params: Promise<{ slug: string; blockId: string }>;
}) {
  if (!isLocalCmsEnabled()) notFound();
  const { slug, blockId } = await params;
  const container = await readLocalContainerSpec(slug).catch(() => undefined);
  if (!container) notFound();

  for (const module of container.modules) {
    for (const lesson of module.lessons) {
      const page = lesson.pages.find((candidate) => candidate.workspace.blocks.some((block) => block.id === blockId));
      if (page) redirect(`/cms/containers/${container.slug}/pages/${page.id}`);
    }
  }

  notFound();
}
