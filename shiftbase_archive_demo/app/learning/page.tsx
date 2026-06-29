import { CourseCatalog } from "@/components/courses/CourseCatalog";
import { SiteShell } from "@/components/SiteShell";

export default function LearningPage() {
  return (
    <SiteShell>
      <main className="bg-white">
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <CourseCatalog />
        </section>
      </main>
    </SiteShell>
  );
}
