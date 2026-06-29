import { notFound, redirect } from "next/navigation";
import { courses } from "@/lib/content";

export default async function CourseLearnRedirectPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = courses.find((item) => item.slug === slug);
  if (!course) notFound();

  redirect(`/learn/${course.slug}/${course.firstLessonSlug}`);
}
