import { notFound } from "next/navigation";
import { ShiftPlayer } from "@/components/lesson/ShiftPlayer";
import { Header } from "@/components/SiteShell";
import { getInteractiveLesson, getInteractiveLessonParams } from "@/lib/containerSpec";

export function generateStaticParams() {
  return getInteractiveLessonParams();
}

export default async function InteractiveLessonPage({
  params
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  const { courseSlug, lessonSlug } = await params;
  const lesson = getInteractiveLesson(courseSlug, lessonSlug);
  if (!lesson) notFound();

  return (
    <div className="min-h-[100dvh] bg-[#f7f9fc]">
      <Header />
      <ShiftPlayer lesson={lesson} />
    </div>
  );
}
