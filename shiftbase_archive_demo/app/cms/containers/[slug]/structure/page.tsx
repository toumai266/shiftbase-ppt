import { notFound, redirect } from "next/navigation";
import { isLocalCmsEnabled } from "@/lib/localCms";

export const dynamic = "force-dynamic";

export default async function LocalCmsStructurePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!isLocalCmsEnabled()) notFound();

  const { slug } = await params;
  redirect(`/cms/containers/${slug}`);
}
