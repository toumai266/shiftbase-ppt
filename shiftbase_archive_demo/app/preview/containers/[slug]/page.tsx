import { notFound } from "next/navigation";
import { ShiftPlayer } from "@/components/lesson/ShiftPlayer";
import { Header } from "@/components/SiteShell";
import { buildInteractiveLessonFromContainer, validateContainerSpec } from "@/lib/containerSpec";
import { isLocalCmsEnabled, readLocalContainerSpec } from "@/lib/localCms";

export const dynamic = "force-dynamic";

export default async function ContainerPreviewPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!isLocalCmsEnabled()) notFound();

  const { slug } = await params;
  const rawContainer = await readLocalContainerSpec(slug).catch(() => undefined);
  const container = rawContainer ? validateContainerSpec(rawContainer) : undefined;
  if (!container) notFound();

  const firstLesson = container.modules.flatMap((module) => module.lessons)[0];
  const lesson = buildInteractiveLessonFromContainer(container, firstLesson?.id);
  if (!lesson) notFound();

  return (
    <div className="min-h-[100dvh] bg-[#f7f9fc]">
      <Header />
      <ShiftPlayer
        lesson={lesson}
        preview={{
          cmsHref: `/cms/containers/${container.slug}`,
          reviewHref: `/cms/containers/${container.slug}/review`,
          status: container.status
        }}
        storageNamespace="preview-session"
      />
    </div>
  );
}
