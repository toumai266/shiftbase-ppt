"use client";

import { forwardRef, type PointerEvent as ReactPointerEvent, type ReactNode, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bold,
  BookOpenText,
  CheckCircle2,
  ChevronDown,
  Code,
  Copy,
  Eye,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Menu,
  MessageCircle,
  Move,
  PackageOpen,
  PlayCircle,
  Plus,
  Quote,
  Save,
  SeparatorHorizontal,
  SlidersHorizontal,
  Sparkles,
  Table2,
  Trash2,
  UsersRound,
  X
} from "lucide-react";
import { CodeCanvasFrame } from "@/components/lesson/CodeCanvasFrame";
import { MarkdownContent } from "@/components/MarkdownContent";
import type {
  ContainerDifficulty,
  ContainerRecommendation,
  ContainerSpec,
  ExampleGroup,
  LessonSpec,
  LessonWorkspaceBlock,
  ModuleSpec,
  PageSpec,
  SlideElementSpec,
  SlideElementType,
  TimelineBlock,
  TimelineBlockCategory,
  TimelineBlockGroup
} from "@/lib/containerSpec";
import { workspaceBlockTypes, type WorkspaceBlockType } from "@/lib/workspaceBlockRegistry";

type EditableBlock = {
  id: string;
  type: WorkspaceBlockType;
  props: Record<string, unknown>;
  reads?: { key: string };
  writes?: { key: string };
};

type SaveState = "idle" | "saving" | "saved" | "error";
type DraftUpdater = (mutator: (next: ContainerSpec) => void) => void;
type PagePointer = {
  moduleIndex: number;
  lessonIndex: number;
  pageIndex: number;
  lessonId: string;
  moduleTitle: string;
  lessonTitle: string;
  page: PageSpec;
};

const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";
const labelClass = "block text-xs font-semibold text-muted";
const difficulties: ContainerDifficulty[] = ["beginner", "intermediate", "advanced"];
const categories: TimelineBlockCategory[] = ["input", "organize", "judge"];
const blockTypeLabels = {
  "code-canvas": "코드 캔버스",
  "intro-summary": "산출물 요약",
  "image-definition": "이미지 설명",
  "block-board": "업무 블록 보드",
  "state-summary": "상태 요약",
  "example-list": "예시 목록",
  "candidate-select": "후보 선택",
  quiz: "퀴즈",
  checklist: "체크리스트",
  "result-card": "결과 카드"
} satisfies Record<WorkspaceBlockType, string>;
const categoryLabels = {
  input: "입력",
  organize: "정리",
  judge: "판단"
} satisfies Record<TimelineBlockCategory, string>;

function cloneSpec(spec: ContainerSpec) {
  return structuredClone(spec);
}

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

const slideElementDefaults: Record<SlideElementType, Omit<SlideElementSpec, "id" | "type">> = {
  heading: {
    x: 9,
    y: 12,
    width: 58,
    height: 18,
    content: "제목을 입력하세요"
  },
  text: {
    x: 9,
    y: 34,
    width: 56,
    height: 22,
    content: "텍스트를 입력하세요."
  },
  callout: {
    x: 9,
    y: 63,
    width: 54,
    height: 14,
    content: "도형 텍스트"
  },
  list: {
    x: 9,
    y: 42,
    width: 48,
    height: 24,
    content: "첫 번째 항목\n두 번째 항목"
  }
};

function createSlideElement(type: SlideElementType): SlideElementSpec {
  return {
    id: newId("slide-element"),
    type,
    ...slideElementDefaults[type]
  };
}

function getSlideElementToolLabel(type: SlideElementType) {
  if (type === "text") return "텍스트 상자";
  if (type === "callout") return "도형";
  if (type === "list") return "글머리";
  return "텍스트";
}

function clampSlidePercent(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundSlidePercent(value: number) {
  return Math.round(value * 10) / 10;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function textToLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function linesToText(value: string[] | undefined) {
  return (value ?? []).join("\n");
}

function getReadingMarkdown(reading: PageSpec["left"]) {
  if (typeof reading.bodyMarkdown === "string" && reading.bodyMarkdown.trim()) return reading.bodyMarkdown;
  return reading.paragraphs.join("\n\n");
}

function markdownToPlainParagraphs(markdown: string) {
  const plain = markdown
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/^[-*]\s+\[[xX ]]\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .split(/\n{2,}/)
    .map((block) => block.replace(/\n+/g, " ").trim())
    .filter(Boolean);
  return plain.length > 0 ? plain : ["텍스트를 입력하세요."];
}

function createDefaultCodeCanvasSource() {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { box-sizing: border-box; }
    html, body { height: 100%; margin: 0; }
    body {
      display: grid;
      place-items: center;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #121826;
      background: #ffffff;
    }
    .canvas {
      width: min(100%, 720px);
      min-height: 360px;
      display: grid;
      place-items: center;
      border: 1px solid #d9e1ec;
      background: #f8fafc;
    }
  </style>
</head>
<body>
  <main class="canvas">
    <p>오른쪽 실행 영역을 구현하세요.</p>
  </main>
</body>
</html>`;
}

function createTimelineBlock(): TimelineBlock {
  return {
    id: newId("work"),
    label: "업무",
    category: "input",
    description: "업무 설명",
    axReason: "AI가 도울 수 있는 이유",
    examples: ["예시"]
  };
}

function createDefaultProps(type: WorkspaceBlockType): Record<string, unknown> {
  if (type === "code-canvas") {
    const code = createDefaultCodeCanvasSource();
    return {
      kind: "html",
      artifactId: newId("artifact"),
      prompt: "오른쪽 페이지에 들어갈 실행 산출물을 자연어로 설명하세요.",
      promptHistory: [],
      code,
      entry: "index.html",
      files: { "index.html": code },
      assets: [],
      runtime: "sandboxed-iframe",
      version: 1,
      status: "draft",
      history: []
    };
  }
  if (type === "intro-summary") return { outputs: ["학습 산출물"] };
  if (type === "image-definition") {
    return {
      image: "/assets/ax-course-dashboard-mockup.png",
      alt: "설명 이미지",
      label: "Definition",
      text: "핵심 설명을 입력하세요."
    };
  }
  if (type === "block-board") return { blockGroups: [{ title: "업무 그룹", description: "설명", blocks: [createTimelineBlock()] }] };
  if (type === "example-list") return { examples: [{ title: "예시 그룹", items: ["예시"] }] };
  if (type === "quiz") return { question: "질문을 입력하세요.", options: ["선택지 1", "선택지 2"], answer: "선택지 1" };
  if (type === "checklist") return { title: "체크리스트", items: ["확인 항목 1"] };
  if (type === "result-card") return { title: "결과 카드", emptyText: "선택한 항목이 없습니다." };
  return {};
}

function applyDefaultBindings(block: EditableBlock) {
  delete block.reads;
  delete block.writes;
  if (block.type === "block-board") block.writes = { key: "workTimeline" };
  if (block.type === "state-summary") block.reads = { key: "workTimeline" };
  if (block.type === "candidate-select") {
    block.reads = { key: "workTimeline" };
    block.writes = { key: "selectedCandidate" };
  }
  if (block.type === "result-card") block.reads = { key: "selectedCandidate" };
}

function createBlock(type: WorkspaceBlockType): LessonWorkspaceBlock {
  const block: EditableBlock = { id: newId(type), type, props: createDefaultProps(type) };
  applyDefaultBindings(block);
  return block as LessonWorkspaceBlock;
}

function createPage(): PageSpec {
  return {
    id: newId("page"),
    title: "새 페이지",
    left: {
      title: "세부 목차 이름",
      bodyMarkdown: "학습 내용을 입력하세요.",
      paragraphs: ["학습 내용을 입력하세요."],
      checkpoints: ["확인 항목을 입력하세요."]
    },
    slideElements: [],
    workspace: { layout: "focus", blocks: [createBlock("code-canvas")] }
  };
}

function createLesson(): LessonSpec {
  return { id: newId("lesson"), title: "새 레슨", pages: [createPage()] };
}

function createModule(): ModuleSpec {
  return { id: newId("module"), title: "새 모듈", lessons: [createLesson()] };
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className={labelClass}>
      {label}
      <input className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({
  label,
  hideLabel = false,
  value,
  onChange,
  rows = 4
}: {
  label: string;
  hideLabel?: boolean;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className={labelClass}>
      <span className={hideLabel ? "sr-only" : ""}>{label}</span>
      <textarea className={`${inputClass} resize-y leading-6`} rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className={labelClass}>
      {label}
      <select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function SaveBar({
  label = "저장",
  idleMessage = "",
  state,
  message,
  onSave
}: {
  label?: string;
  idleMessage?: string;
  state: SaveState;
  message: string;
  onSave: () => void;
}) {
  return (
    <div className="sticky bottom-0 z-20 mt-6 border-t border-line bg-white/95 px-4 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {message ? (
          <div className={`flex gap-2 rounded-lg px-3 py-2 text-xs ${state === "error" ? "bg-danger/10 text-danger" : "bg-success/10 text-ink"}`}>
            {state === "error" ? <AlertCircle size={15} className="shrink-0" aria-hidden="true" /> : <CheckCircle2 size={15} className="shrink-0 text-success" aria-hidden="true" />}
            <span>{message}</span>
          </div>
        ) : idleMessage ? (
          <p className="text-xs font-semibold text-muted">{idleMessage}</p>
        ) : (
          <span aria-hidden="true" />
        )}
        <button
          type="button"
          className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-wait disabled:opacity-70"
          onClick={onSave}
          disabled={state === "saving"}
        >
          <Save size={16} aria-hidden="true" />
          {label}
        </button>
      </div>
    </div>
  );
}

function useSpecDraft(initialSpec: ContainerSpec) {
  const [draft, setDraft] = useState(() => cloneSpec(initialSpec));
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  function updateDraft(mutator: (next: ContainerSpec) => void) {
    setDraft((previous) => {
      const next = cloneSpec(previous);
      mutator(next);
      return next;
    });
    if (saveState !== "saving") setSaveState("idle");
  }

  async function save() {
    setSaveState("saving");
    setMessage("저장 중입니다.");
    try {
      const specToSave: ContainerSpec = {
        ...draft,
        displayBadges: (draft.displayBadges ?? []).map((badge) => badge.trim()).filter(Boolean)
      };
      if ((specToSave.displayBadges?.length ?? 0) === 0) delete specToSave.displayBadges;

      const response = await fetch(`/api/local-cms/containers/${initialSpec.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(specToSave)
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string | { message?: string } };
      if (!response.ok) {
        setSaveState("error");
        setMessage(readApiError(result, "저장에 실패했습니다."));
        return;
      }
      setSaveState("saved");
      setMessage("저장했습니다.");
    } catch {
      setSaveState("error");
      setMessage("저장 요청을 완료하지 못했습니다. 로컬 서버 상태와 네트워크를 확인하세요.");
    }
  }

  return { draft, updateDraft, save, saveState, message };
}

export function CreateContainerForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");

  async function create() {
    setError("");
    const finalSlug = slugify(slug || title);
    try {
      const response = await fetch("/api/local-cms/containers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: finalSlug, title })
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string | { message?: string }; slug?: string };
      if (!response.ok || !result.slug) {
        setError(readApiError(result, "컨테이너 생성에 실패했습니다."));
        return;
      }
      router.push(`/cms/containers/${result.slug}`);
    } catch {
      setError("컨테이너 생성 요청을 완료하지 못했습니다. 로컬 서버 상태와 네트워크를 확인하세요.");
    }
  }

  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-soft">
      <div className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
        <Field label="새 컨테이너 제목" value={title} onChange={setTitle} />
        <Field label="slug" value={slug} onChange={setSlug} />
        <button
          type="button"
          className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-40"
          onClick={create}
          disabled={!title.trim()}
        >
          <Plus size={16} aria-hidden="true" />
          만들기
        </button>
      </div>
      {error ? <p className="mt-3 text-xs font-semibold text-danger">{error}</p> : null}
    </section>
  );
}

export function DeleteContainerButton({ slug, title }: { slug: string; title: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteContainer() {
    const confirmed = window.confirm(`"${title}" 컨테이너를 삭제합니다. 계속할까요?`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/local-cms/containers/${slug}`, { method: "DELETE" });
      const result = (await response.json().catch(() => ({}))) as { error?: string | { message?: string } };
      if (!response.ok) {
        window.alert(readApiError(result, "컨테이너 삭제에 실패했습니다."));
        return;
      }
      router.refresh();
    } catch {
      window.alert("컨테이너 삭제 요청을 완료하지 못했습니다. 로컬 서버 상태와 네트워크를 확인하세요.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      className="focus-ring inline-flex h-8 items-center justify-end gap-1.5 rounded-lg px-2 text-xs font-semibold text-danger transition hover:bg-danger/5 disabled:cursor-wait disabled:opacity-60"
      onClick={deleteContainer}
      disabled={isDeleting}
    >
      <Trash2 size={14} aria-hidden="true" />
      삭제
    </button>
  );
}

function readApiError(result: { error?: string | { message?: string } }, fallback: string) {
  if (typeof result.error === "string") return result.error;
  if (result.error?.message) return result.error.message;
  return fallback;
}

export function ContainerInlineEditor({ initialSpec }: { initialSpec: ContainerSpec }) {
  const { draft, updateDraft, save, saveState, message } = useSpecDraft(initialSpec);
  const heroThumbnail = draft.coverImage ?? "/assets/container-ai-workshift/work-map.png";
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [openModules, setOpenModules] = useState(() => draft.modules.map(() => false));
  const pricing = getPricing(draft);
  const recommendationCards = normalizeRecommendationCards(draft);
  const lessonCount = getLessonCount(draft);
  const hasDiscount = pricing.originalPrice > pricing.salePrice && pricing.discountRate > 0;
  const introMarkdown = draft.introMarkdown ?? buildDefaultIntroMarkdown(draft);
  const isAllOpen = openModules.length > 0 && openModules.every(Boolean);

  useEffect(() => {
    setOpenModules((current) => draft.modules.map((_, index) => current[index] ?? false));
  }, [draft.modules.length]);

  const setModuleOpen = (index: number, isOpen: boolean) => {
    setOpenModules((current) => {
      const next = [...current];
      next[index] = isOpen;
      return next;
    });
  };

  const toggleAllModules = () => {
    setOpenModules(draft.modules.map(() => !isAllOpen));
  };

  return (
    <>
      <main className="bg-white">
        <section className="relative overflow-hidden border-b border-line bg-ink">
          <Image
            src={heroThumbnail}
            alt=""
            className="scale-110 object-cover opacity-28 blur-2xl"
            fill
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.9),rgba(15,23,42,0.72)_48%,rgba(15,23,42,0.56))]" />
          <div className="relative mx-auto grid h-[408px] max-w-5xl items-center px-4 sm:px-6 lg:grid-cols-[minmax(0,640px)_300px] lg:gap-8 lg:px-8">
            <div className="min-w-0 pt-6">
              <InlineInput
                ariaLabel="컨테이너 제목"
                className="w-full text-[32px] font-semibold leading-[1.14] tracking-tight text-white placeholder:text-white/45"
                value={draft.title}
                onChange={(value) => updateDraft((next) => { next.title = value; })}
              />
              <InlineTextarea
                ariaLabel="컨테이너 요약"
                className="mt-3 w-full pb-4 text-base font-normal leading-6 text-white placeholder:text-white/45"
                rows={1}
                value={draft.summary}
                onChange={(value) => updateDraft((next) => { next.summary = value; })}
              />
              <EditableDisplayBadges
                items={draft.displayBadges ?? []}
                onChange={(items) => updateDraft((next) => { next.displayBadges = items; })}
              />
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,640px)_300px] lg:items-start lg:px-8">
          <div className="min-w-0">
            <section>
              <EditableOutcomeGrid
                learningItems={draft.outcomes}
                onLearningChange={(items) => updateDraft((next) => { next.outcomes = items.length > 0 ? items : ["학습 관점을 입력하세요."]; })}
              />
            </section>

            <section className="relative mt-12 overflow-hidden rounded-2xl border border-line bg-white">
              <div className="grid gap-4 p-6 sm:grid-cols-[1fr_220px] sm:items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">인터랙션 학습</h2>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    이 학습은 사용자의 조작을 필요로 합니다. 학습을 도와주는 다양한 인터랙션으로 쉽고 빠르게 익힐 수 있습니다.
                  </p>
                  <span className="mt-4 inline-flex text-sm font-semibold text-primary underline underline-offset-4">
                    인터랙션 학습 자세히 알아보기
                  </span>
                </div>
                <div className="relative hidden h-40 w-[220px] sm:block">
                  <Image
                    src="/assets/courses/interactive-learning-3d.png"
                    alt=""
                    className="rounded-2xl object-contain"
                    fill
                    sizes="220px"
                  />
                </div>
              </div>
            </section>

            <MarkdownEditor
              slug={draft.slug}
              value={introMarkdown}
              onChange={(value) => updateDraft((next) => { next.introMarkdown = value; })}
            />

            <section className="mt-12">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
                    <BookOpenText className="text-primary" size={20} strokeWidth={2} aria-hidden="true" />
                    <span>모듈</span>
                  </h2>
                  <p className="mt-1 text-xs font-medium text-muted">전체 {lessonCount}개 레슨</p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <button
                    className="focus-ring rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold text-muted transition hover:border-primary/20 hover:bg-[#FAF8FF] hover:text-primary"
                    onClick={toggleAllModules}
                    type="button"
                  >
                    {isAllOpen ? "모두 접기" : "모두 펼치기"}
                  </button>
                  <button
                    className="focus-ring rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold text-muted transition hover:border-primary/20 hover:bg-[#FAF8FF] hover:text-primary"
                    type="button"
                    onClick={() => setIsModuleModalOpen(true)}
                  >
                    모듈/레슨 편집
                  </button>
                </div>
              </div>
              <div className="grid overflow-hidden rounded-2xl border border-line bg-white">
                {draft.modules.map((module, moduleIndex) => (
                  <details
                    className="group border-b border-line last:border-b-0"
                    key={module.id}
                    onToggle={(event) => setModuleOpen(moduleIndex, event.currentTarget.open)}
                    open={openModules[moduleIndex]}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-[#FAF8FF] px-5 py-4 transition hover:bg-[#F6F2FF]">
                      <span className="text-sm font-semibold text-ink">
                        모듈 {moduleIndex + 1}. {module.title.replace(/^모듈\s*\d+\.\s*/, "")}
                      </span>
                      <ChevronDown className="shrink-0 text-muted transition group-open:rotate-180" size={17} strokeWidth={1.8} aria-hidden="true" />
                    </summary>
                    <div className="border-t border-line bg-white">
                      <ol className="divide-y divide-line text-sm">
                        {module.lessons.map((lesson, lessonIndex) => {
                          const firstPage = lesson.pages[0];
                          const status = draft.status === "published" ? "학습 가능" : "준비 중";
                          return (
                            <li className="list-none" key={lesson.id}>
                              <Link
                                className={`focus-ring flex items-center justify-between gap-4 py-3.5 pl-9 pr-5 font-medium transition hover:bg-soft/70 hover:text-primary ${status === "학습 가능" ? "text-ink" : "text-muted"}`}
                                href={firstPage ? `/cms/containers/${draft.slug}/pages/${firstPage.id}` : `/cms/containers/${draft.slug}`}
                              >
                                <span>{lessonIndex + 1}) {lesson.title}</span>
                                <span className={`text-xs font-medium ${status === "학습 가능" ? "text-primary" : "text-muted"}`}>{status}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </details>
                ))}
              </div>
            </section>

            <section className="mt-12">
              <h2 className="mb-5 flex items-center gap-2 text-xl font-bold tracking-tight">
                <UsersRound className="text-primary" size={20} strokeWidth={2} aria-hidden="true" />
                <span>이런 분들에게 추천해요</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {recommendationCards.map((item, index) => (
                  <article className="grid min-h-[132px] overflow-hidden rounded-2xl border border-line bg-white sm:grid-cols-[112px_1fr]" key={`recommendation-${index}`}>
                    <AssetPicker
                      className="h-full min-h-[132px]"
                      image={item.image}
                      slug={draft.slug}
                      onChange={(image) => updateDraft((next) => {
                        const cards = setRecommendationCard(recommendationCards, index, { ...item, image });
                        next.recommendationCards = cards;
                        next.audience = cards.map((card) => card.text);
                      })}
                    />
                    <div className="flex items-center px-4 py-4">
                      <InlineTextarea
                        ariaLabel={`추천 카드 ${index + 1}`}
                        className="w-full text-sm font-semibold leading-6 text-ink"
                        rows={1}
                        value={item.text}
                        onChange={(text) => updateDraft((next) => {
                          const cards = setRecommendationCard(recommendationCards, index, { ...item, text });
                          next.recommendationCards = cards;
                          next.audience = cards.map((card) => card.text);
                        })}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="h-fit overflow-hidden rounded-2xl border border-line bg-white shadow-[0_24px_80px_-52px_rgba(15,23,42,0.75)] lg:sticky lg:top-20 lg:-mt-[22rem]">
            <AssetPicker
              image={heroThumbnail}
              slug={draft.slug}
              onChange={(image) => updateDraft((next) => { next.coverImage = image; })}
            />
            <div className="p-5">
              <button
                className="focus-ring mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-muted transition hover:border-primary/20 hover:bg-[#FAF8FF] hover:text-primary"
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
              >
                <SlidersHorizontal size={14} aria-hidden="true" />
                컨테이너 설정
              </button>
              {hasDiscount ? (
                <div className="mb-1 mt-4 flex items-center gap-2 text-sm font-semibold">
                  <span className="text-danger">{pricing.discountRate}%</span>
                  <span className="text-muted line-through">{formatWon(pricing.originalPrice)}</span>
                </div>
              ) : null}
              <p className={`${hasDiscount ? "" : "mt-4"} text-3xl font-bold tracking-tight`}>{formatWon(pricing.salePrice)}</p>
              {pricing.salePrice === 0 ? (
              <div className="mt-5 grid gap-3 text-sm">
                <span className="flex items-center gap-2 text-muted">
                  <PlayCircle size={15} className="text-success" />
                  무료 즉시 학습
                </span>
              </div>
              ) : null}
              <button className="mt-5 flex w-full cursor-default items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white" type="button" disabled>
                바로 시작하기 <PlayCircle size={16} aria-hidden="true" />
              </button>
              <div className="mt-6 border-t border-line pt-5">
                <p className="text-sm font-semibold">추천 대상</p>
                <ul className="mt-3 grid gap-2">
                  {recommendationCards.map((item, index) => (
                    <li className="text-sm leading-relaxed text-muted" key={`${item.text}-${index}`}>· {item.text}</li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>
      {isModuleModalOpen ? (
        <ModuleManagerModal
          draft={draft}
          message={message}
          onClose={() => setIsModuleModalOpen(false)}
          onSave={save}
          saveState={saveState}
          updateDraft={updateDraft}
        />
      ) : null}
      {isSettingsModalOpen ? (
        <ContainerSettingsModal
          draft={draft}
          pricing={pricing}
          onClose={() => setIsSettingsModalOpen(false)}
          updateDraft={updateDraft}
        />
      ) : null}
      <SaveBar state={saveState} message={message} onSave={save} />
    </>
  );
}

function InlineInput({
  ariaLabel,
  className,
  id,
  readOnly = false,
  value,
  onChange
}: {
  ariaLabel: string;
  className: string;
  id?: string;
  readOnly?: boolean;
  value: string;
  onChange?: (value: string) => void;
}) {
  return (
    <input
      aria-label={ariaLabel}
      className={`${inlineEditClass} ${className}`}
      id={id}
      readOnly={readOnly}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  );
}

function InlineNumberInput({
  ariaLabel,
  className,
  value,
  onChange
}: {
  ariaLabel: string;
  className: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <input
      aria-label={ariaLabel}
      className={`${inlineEditClass} ${className}`}
      min={0}
      type="number"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  );
}

function InlineTextarea({
  ariaLabel,
  className,
  value,
  onChange,
  rows,
  autoGrow = true
}: {
  ariaLabel: string;
  className: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
  autoGrow?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!autoGrow || !ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  }, [autoGrow, value]);

  return (
    <textarea
      ref={ref}
      aria-label={ariaLabel}
      className={`${inlineEditClass} ${autoGrow ? "resize-none overflow-hidden" : ""} ${className}`}
      rows={rows}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
        if (autoGrow) {
          event.currentTarget.style.height = "auto";
          event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
        }
      }}
    />
  );
}

function EditableDisplayBadges({
  items,
  onChange
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  function updateItem(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-1.5">
      {items.map((item, index) => (
        <span
          className="inline-flex h-7 items-center gap-1 rounded-full bg-white px-2.5 text-[11px] font-medium text-ink shadow-sm"
          key={`display-badge-${index}`}
        >
          <input
            aria-label={`노출 뱃지 ${index + 1}`}
            className="w-20 bg-transparent outline-none"
            value={item}
            onChange={(event) => updateItem(index, event.target.value)}
          />
          <button
            type="button"
            className="-mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-muted transition hover:bg-soft hover:text-danger"
            aria-label={`${item || "노출 뱃지"} 삭제`}
            title="뱃지 삭제"
            onClick={() => removeItem(index)}
          >
            <X size={12} aria-hidden="true" />
          </button>
        </span>
      ))}
      <button
        type="button"
        className="focus-ring inline-flex h-7 items-center gap-1 rounded-full border border-white/50 bg-white/10 px-2.5 text-[11px] font-semibold text-white transition hover:bg-white/18"
        onClick={() => onChange([...items, "새 뱃지"])}
      >
        <Plus size={12} aria-hidden="true" />
        뱃지 추가
      </button>
    </div>
  );
}

type MarkdownAction = {
  label: string;
  title: string;
  icon: ReactNode;
  run: () => void;
};

type MarkdownEditorCommand =
  | "h2"
  | "h3"
  | "bold"
  | "italic"
  | "link"
  | "ul"
  | "ol"
  | "task"
  | "quote"
  | "code"
  | "table"
  | "hr";

type VisualMarkdownEditorHandle = {
  runCommand: (command: MarkdownEditorCommand) => void;
  insertImage: (path: string) => void;
  rememberInsertionPoint: () => void;
};

const VisualMarkdownEditor = forwardRef<VisualMarkdownEditorHandle, {
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  minHeightClassName?: string;
}>(function VisualMarkdownEditor({
  value,
  onChange,
  ariaLabel = "본문",
  minHeightClassName = "min-h-[520px]"
}, ref) {
  const editorRef = useRef<HTMLDivElement>(null);
  const rememberedBlockIndexRef = useRef<number | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused || !editorRef.current) return;
    editorRef.current.innerHTML = markdownToEditableHtml(value);
  }, [isFocused, value]);

  function commit() {
    if (!editorRef.current) return;
    onChange(editableHtmlToMarkdown(editorRef.current));
  }

  function normalizeAndCommit() {
    if (!editorRef.current) return;
    const markdown = editableHtmlToMarkdown(editorRef.current);
    onChange(markdown);
    editorRef.current.innerHTML = markdownToEditableHtml(markdown);
  }

  function getSelectionRange() {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return null;
    return range;
  }

  function getCurrentBlockIndex() {
    const editor = editorRef.current;
    const range = getSelectionRange();
    if (!editor || !range) return rememberedBlockIndexRef.current ?? Math.max(0, (editor?.children.length ?? 1) - 1);
    const children = Array.from(editor.children);
    const anchor = range.startContainer.nodeType === Node.ELEMENT_NODE ? range.startContainer as Element : range.startContainer.parentElement;
    const blockIndex = children.findIndex((child) => anchor ? child.contains(anchor) || child === anchor : false);
    if (blockIndex >= 0) {
      rememberedBlockIndexRef.current = blockIndex;
      return blockIndex;
    }
    return rememberedBlockIndexRef.current ?? Math.max(0, children.length - 1);
  }

  function rememberInsertionPoint() {
    rememberedBlockIndexRef.current = getCurrentBlockIndex();
  }

  function setCaretAfter(node: Node) {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function insertBlockHtml(html: string, useRememberedBlock = false) {
    const editor = editorRef.current;
    if (!editor) return;
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    const nodes = Array.from(template.content.childNodes);
    if (nodes.length === 0) return;

    const children = Array.from(editor.children);
    const index = useRememberedBlock ? rememberedBlockIndexRef.current ?? getCurrentBlockIndex() : getCurrentBlockIndex();
    const reference = index !== null && index >= 0 ? children[index] : null;
    if (reference?.parentElement === editor) {
      reference.after(...nodes);
    } else {
      editor.append(...nodes);
    }
    const lastNode = nodes[nodes.length - 1];
    editor.focus();
    setCaretAfter(lastNode);
    rememberedBlockIndexRef.current = Array.from(editor.children).findIndex((child) => child === lastNode || child.contains(lastNode));
    commit();
  }

  function insertInlineHtml(html: string) {
    const editor = editorRef.current;
    if (!editor) return;
    const range = getSelectionRange();
    if (!range) {
      insertBlockHtml(`<p>${html}</p>`);
      return;
    }
    const template = document.createElement("template");
    template.innerHTML = html;
    const fragment = template.content;
    const lastNode = fragment.lastChild;
    range.deleteContents();
    range.insertNode(fragment);
    editor.focus();
    if (lastNode) setCaretAfter(lastNode);
    rememberInsertionPoint();
    commit();
  }

  function getSelectedText() {
    return getSelectionRange()?.toString().trim() ?? "";
  }

  function runCommand(command: MarkdownEditorCommand) {
    const selectedText = getSelectedText();
    if (command === "h2") insertBlockHtml(`<h2 data-md-block="heading" data-level="2">${escapeHtml(selectedText || "소제목")}</h2>`);
    if (command === "h3") insertBlockHtml(`<h3 data-md-block="heading" data-level="3">${escapeHtml(selectedText || "작은 소제목")}</h3>`);
    if (command === "bold") insertInlineHtml(`<strong>${escapeHtml(selectedText || "강조할 문장")}</strong>`);
    if (command === "italic") insertInlineHtml(`<em>${escapeHtml(selectedText || "기울임 문장")}</em>`);
    if (command === "link") insertInlineHtml(`<a href="https://example.com">${escapeHtml(selectedText || "링크 텍스트")}</a>`);
    if (command === "ul") insertBlockHtml(`<ul data-md-block="ul"><li>${escapeHtml(selectedText || "항목")}</li></ul>`);
    if (command === "ol") insertBlockHtml(`<ol data-md-block="ol"><li>${escapeHtml(selectedText || "첫 번째 항목")}</li><li>두 번째 항목</li></ol>`);
    if (command === "task") insertBlockHtml(`<ul data-md-block="task"><li data-checked="false">${escapeHtml(selectedText || "확인할 항목")}</li></ul>`);
    if (command === "quote") insertBlockHtml(`<blockquote>${escapeHtml(selectedText || "인용할 문장")}</blockquote>`);
    if (command === "code") {
      if (selectedText && !selectedText.includes("\n")) {
        insertInlineHtml(`<code>${escapeHtml(selectedText)}</code>`);
        return;
      }
      insertBlockHtml(`<pre data-md-block="code"><code>${escapeHtml(selectedText || "코드")}</code></pre>`);
    }
    if (command === "table") {
      insertBlockHtml(markdownTableToEditableHtml(["| 항목 | 설명 |", "| --- | --- |", "| 기준 | 내용을 입력하세요 |"]));
    }
    if (command === "hr") insertBlockHtml("<hr />");
  }

  useImperativeHandle(ref, () => ({
    runCommand,
    insertImage: (path: string) => {
      insertBlockHtml(`<figure data-md-block="image"><img src="${escapeHtml(path)}" alt="" /><button type="button" contenteditable="false" data-md-delete-image aria-label="이미지 삭제">삭제</button></figure>`, true);
    },
    rememberInsertionPoint
  }));

  return (
    <div
      ref={editorRef}
      className={`${minHeightClassName} bg-white px-6 py-6 text-[15px] leading-8 text-ink outline-none [&>*+*]:mt-4 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-soft [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.92em] [&_code]:text-ink [&_strong]:font-bold [&_strong]:text-ink [&_td]:border-t [&_td]:border-line [&_td]:px-3 [&_td]:py-2 [&_th]:bg-soft [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:text-ink [&>blockquote]:border-l-4 [&>blockquote]:border-primary/30 [&>blockquote]:bg-soft [&>blockquote]:px-4 [&>blockquote]:py-3 [&>figure]:relative [&>figure]:overflow-hidden [&>figure]:rounded-xl [&>figure>button]:absolute [&>figure>button]:right-3 [&>figure>button]:top-3 [&>figure>button]:rounded-full [&>figure>button]:bg-ink/80 [&>figure>button]:px-3 [&>figure>button]:py-1.5 [&>figure>button]:text-xs [&>figure>button]:font-semibold [&>figure>button]:text-white [&>figure>button]:shadow-soft [&>figure>button]:transition [&>figure>button:hover]:bg-danger [&>figure>figcaption]:mt-2 [&>figure>figcaption]:text-xs [&>figure>figcaption]:font-semibold [&>figure>figcaption]:text-muted [&>figure>img]:w-full [&>figure>img]:rounded-xl [&>figure>img]:border [&>figure>img]:border-line [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:tracking-tight [&>h2]:text-xl [&>h2]:font-bold [&>h2]:tracking-tight [&>h3]:text-lg [&>h3]:font-bold [&>ol]:list-decimal [&>ol]:pl-5 [&>p]:text-muted [&>pre]:overflow-x-auto [&>pre]:rounded-xl [&>pre]:border [&>pre]:border-line [&>pre]:bg-ink [&>pre]:p-4 [&>pre]:text-xs [&>pre]:leading-6 [&>pre]:text-white [&>table]:w-full [&>table]:overflow-hidden [&>table]:rounded-xl [&>table]:border [&>table]:border-line [&>table]:text-sm [&>ul]:list-disc [&>ul]:pl-5`}
      contentEditable
      role="textbox"
      aria-label={ariaLabel}
      suppressContentEditableWarning
      onFocus={() => {
        setIsFocused(true);
        rememberInsertionPoint();
      }}
      onBlur={(event) => {
        setIsFocused(false);
        normalizeAndCommit();
      }}
      onInput={(event) => onChange(editableHtmlToMarkdown(event.currentTarget))}
      onKeyUp={rememberInsertionPoint}
      onMouseUp={rememberInsertionPoint}
      onMouseDown={(event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        if (target.closest("[data-md-delete-image]")) event.preventDefault();
      }}
      onClick={(event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const deleteButton = target.closest("[data-md-delete-image]");
        if (!deleteButton || !editorRef.current?.contains(deleteButton)) return;
        event.preventDefault();
        deleteButton.closest("figure")?.remove();
        onChange(editableHtmlToMarkdown(editorRef.current));
      }}
      onPaste={(event) => {
        event.preventDefault();
        const text = event.clipboardData.getData("text/plain");
        if (hasMarkdownBlock(text)) {
          insertBlockHtml(markdownToEditableHtml(text));
          return;
        }
        if (hasInlineMarkdown(text)) {
          insertInlineHtml(inlineMarkdownToEditableHtml(text));
          return;
        }
        document.execCommand("insertText", false, text);
      }}
    />
  );
});

function MarkdownEditor({
  slug,
  value,
  onChange,
  title = "컨테이너 소개 본문",
  eyebrow = "본문 편집",
  className = "mt-12 overflow-hidden rounded-2xl border border-line bg-white shadow-soft",
  editorMinHeightClassName = "min-h-[520px]",
  showHeader = true
}: {
  slug: string;
  value: string;
  onChange: (value: string) => void;
  title?: string;
  eyebrow?: string;
  className?: string;
  editorMinHeightClassName?: string;
  showHeader?: boolean;
}) {
  const visualEditorRef = useRef<VisualMarkdownEditorHandle>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  function insertImage(path: string) {
    visualEditorRef.current?.insertImage(path);
  }

  const actions: MarkdownAction[] = [
    {
      label: "제목",
      title: "소제목",
      icon: <Heading2 size={15} aria-hidden="true" />,
      run: () => visualEditorRef.current?.runCommand("h2")
    },
    {
      label: "소제목",
      title: "작은 소제목",
      icon: <Heading3 size={15} aria-hidden="true" />,
      run: () => visualEditorRef.current?.runCommand("h3")
    },
    {
      label: "굵게",
      title: "굵게",
      icon: <Bold size={15} aria-hidden="true" />,
      run: () => visualEditorRef.current?.runCommand("bold")
    },
    {
      label: "기울임",
      title: "기울임",
      icon: <Italic size={15} aria-hidden="true" />,
      run: () => visualEditorRef.current?.runCommand("italic")
    },
    {
      label: "링크",
      title: "링크",
      icon: <Link2 size={15} aria-hidden="true" />,
      run: () => visualEditorRef.current?.runCommand("link")
    },
    {
      label: "목록",
      title: "글머리 목록",
      icon: <List size={15} aria-hidden="true" />,
      run: () => visualEditorRef.current?.runCommand("ul")
    },
    {
      label: "번호",
      title: "번호 목록",
      icon: <ListOrdered size={15} aria-hidden="true" />,
      run: () => visualEditorRef.current?.runCommand("ol")
    },
    {
      label: "체크",
      title: "체크 목록",
      icon: <CheckCircle2 size={15} aria-hidden="true" />,
      run: () => visualEditorRef.current?.runCommand("task")
    },
    {
      label: "인용",
      title: "인용문",
      icon: <Quote size={15} aria-hidden="true" />,
      run: () => visualEditorRef.current?.runCommand("quote")
    },
    {
      label: "코드",
      title: "코드",
      icon: <Code size={15} aria-hidden="true" />,
      run: () => visualEditorRef.current?.runCommand("code")
    },
    {
      label: "표",
      title: "표",
      icon: <Table2 size={15} aria-hidden="true" />,
      run: () => visualEditorRef.current?.runCommand("table")
    },
    {
      label: "구분선",
      title: "구분선",
      icon: <SeparatorHorizontal size={15} aria-hidden="true" />,
      run: () => visualEditorRef.current?.runCommand("hr")
    }
  ];

  return (
    <section className={className}>
      {showHeader ? (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <p className="text-xs font-semibold text-primary">{eyebrow}</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">{title}</h2>
          </div>
          <button
            className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink transition hover:bg-soft active:translate-y-px"
            type="button"
            onClick={() => setIsPreviewOpen(true)}
          >
            <Eye size={14} aria-hidden="true" />
            보기
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-soft/70 px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action) => (
            <FormatButton action={action} key={action.label} />
          ))}
          <MarkdownImageAttachmentButton
            className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 text-xs font-semibold text-ink transition hover:bg-soft active:translate-y-px"
            slug={slug}
            onBeforeOpen={() => visualEditorRef.current?.rememberInsertionPoint()}
            onAttach={insertImage}
          >
            <ImagePlus size={15} aria-hidden="true" />
            이미지
          </MarkdownImageAttachmentButton>
        </div>
        {!showHeader ? (
          <button
            className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 text-xs font-semibold text-ink transition hover:bg-soft active:translate-y-px"
            type="button"
            onClick={() => setIsPreviewOpen(true)}
          >
            <Eye size={14} aria-hidden="true" />
            보기
          </button>
        ) : null}
      </div>

      <div className="grid">
        <VisualMarkdownEditor
          ref={visualEditorRef}
          ariaLabel={title}
          minHeightClassName={editorMinHeightClassName}
          value={value}
          onChange={onChange}
        />
      </div>

      {isPreviewOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 py-6" role="dialog" aria-modal="true" aria-label="본문 미리보기">
          <div className="flex max-h-[88dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="text-xs font-semibold text-primary">미리보기</p>
                <h3 className="mt-1 text-lg font-bold tracking-tight text-ink">{title}</h3>
              </div>
              <button
                className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-ink transition hover:bg-soft"
                type="button"
                aria-label="미리보기 닫기"
                onClick={() => setIsPreviewOpen(false)}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-6">
              <MarkdownContent markdown={value} />
            </div>
          </div>
        </div>
      ) : null}

    </section>
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineMarkdownToEditableHtml(text: string) {
  const pattern = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]\n]+]\([^)]+\))/g;
  let cursor = 0;
  let html = "";
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) html += escapeHtml(text.slice(cursor, match.index));
    const token = match[0];
    if (token.startsWith("`")) {
      html += `<code>${escapeHtml(token.slice(1, -1))}</code>`;
    } else if (token.startsWith("**")) {
      html += `<strong>${escapeHtml(token.slice(2, -2))}</strong>`;
    } else if (token.startsWith("*")) {
      html += `<em>${escapeHtml(token.slice(1, -1))}</em>`;
    } else {
      const linkMatch = token.match(/^\[([^\]]+)]\(([^)]+)\)$/);
      html += linkMatch ? `<a href="${escapeHtml(linkMatch[2])}">${escapeHtml(linkMatch[1])}</a>` : escapeHtml(token);
    }
    cursor = match.index + token.length;
  }

  if (cursor < text.length) html += escapeHtml(text.slice(cursor));
  return html;
}

function hasMarkdownBlock(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .some((line) => isMarkdownEditorBlockStart(line.trim()));
}

function hasInlineMarkdown(text: string) {
  return /(`[^`\n]+`|\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]\n]+]\([^)]+\))/.test(text);
}

function editableInlineToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  if (!(node instanceof HTMLElement)) return "";
  if (node.matches("[data-md-delete-image]")) return "";
  const tag = node.tagName.toLowerCase();
  if (tag === "br") return "\n";
  const children = Array.from(node.childNodes).map(editableInlineToMarkdown).join("");
  if (!children) return "";
  if (tag === "strong" || tag === "b") return `**${children}**`;
  if (tag === "em" || tag === "i") return `*${children}*`;
  if (tag === "code") return `\`${cleanEditableText(node.textContent)}\``;
  if (tag === "a") {
    const href = node.getAttribute("href");
    return href ? `[${children}](${href})` : children;
  }
  return children;
}

function editableChildrenToMarkdown(element: Element) {
  return Array.from(element.childNodes).map(editableInlineToMarkdown).join("").trim();
}

function isMarkdownEditorBlockStart(line: string) {
  return (
    /^#{1,3}\s+/.test(line) ||
    /^!\[.*]\(.*\)$/.test(line) ||
    /^[-*]\s+\[[xX ]]\s+/.test(line) ||
    /^[-*]\s+/.test(line) ||
    /^\d+\.\s+/.test(line) ||
    /^>\s?/.test(line) ||
    /^(-{3,}|\*{3,})$/.test(line) ||
    line.startsWith("|") ||
    line.startsWith("```")
  );
}

function markdownToEditableHtml(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();
    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      html.push(`<pre data-md-block="code"><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      continue;
    }

    if (trimmed.startsWith("|")) {
      const tableLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        tableLines.push(lines[index].trim());
        index += 1;
      }
      html.push(markdownTableToEditableHtml(tableLines));
      continue;
    }

    const imageMatch = trimmed.match(/^!\[(.*)]\((.*)\)$/);
    if (imageMatch) {
      const alt = imageMatch[1].trim();
      const caption = alt ? `<figcaption>${escapeHtml(alt)}</figcaption>` : "";
      html.push(`<figure data-md-block="image"><img src="${escapeHtml(imageMatch[2])}" alt="${escapeHtml(alt)}" />${caption}<button type="button" contenteditable="false" data-md-delete-image aria-label="이미지 삭제">삭제</button></figure>`);
      index += 1;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      html.push(`<h${level} data-md-block="heading" data-level="${level}">${inlineMarkdownToEditableHtml(headingMatch[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      html.push("<hr />");
      index += 1;
      continue;
    }

    if (/^[-*]\s+\[[xX ]]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length) {
        const match = lines[index].trim().match(/^[-*]\s+\[([xX ])]\s+(.+)$/);
        if (!match) break;
        items.push(`<li data-checked="${match[1].toLowerCase() === "x"}">${inlineMarkdownToEditableHtml(match[2])}</li>`);
        index += 1;
      }
      html.push(`<ul data-md-block="task">${items.join("")}</ul>`);
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length) {
        const match = lines[index].trim().match(/^[-*]\s+(.+)$/);
        if (!match) break;
        items.push(`<li>${inlineMarkdownToEditableHtml(match[1])}</li>`);
        index += 1;
      }
      html.push(`<ul data-md-block="ul">${items.join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length) {
        const match = lines[index].trim().match(/^\d+\.\s+(.+)$/);
        if (!match) break;
        items.push(`<li>${inlineMarkdownToEditableHtml(match[1])}</li>`);
        index += 1;
      }
      html.push(`<ol data-md-block="ol">${items.join("")}</ol>`);
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      html.push(`<blockquote>${inlineMarkdownToEditableHtml(quoteLines.join(" "))}</blockquote>`);
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length && lines[index].trim() && !isMarkdownEditorBlockStart(lines[index].trim())) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }
    html.push(`<p>${inlineMarkdownToEditableHtml(paragraphLines.join(" "))}</p>`);
  }

  return html.join("");
}

function cleanEditableText(value: string | null | undefined) {
  return (value ?? "").replace(/\u00a0/g, " ").trim();
}

function editableHtmlToMarkdown(root: HTMLElement) {
  const blocks = Array.from(root.children).map((child) => {
    const tag = child.tagName.toLowerCase();
    const text = cleanEditableText(child.textContent);
    const inlineText = editableChildrenToMarkdown(child);
    if (!text && tag !== "hr" && tag !== "figure") return "";

    if (tag === "h1" || tag === "h2" || tag === "h3") {
      const level = Number(child.getAttribute("data-level") ?? tag.slice(1));
      return `${"#".repeat(Math.min(3, Math.max(1, level)))} ${inlineText}`;
    }
    if (tag === "ul" && child.getAttribute("data-md-block") === "task") {
      return Array.from(child.querySelectorAll("li"))
        .map((item) => `- [${item.getAttribute("data-checked") === "true" ? "x" : " "}] ${editableChildrenToMarkdown(item)}`)
        .join("\n");
    }
    if (tag === "ul") {
      return Array.from(child.querySelectorAll("li")).map((item) => `- ${editableChildrenToMarkdown(item)}`).join("\n");
    }
    if (tag === "ol") {
      return Array.from(child.querySelectorAll("li")).map((item, index) => `${index + 1}. ${editableChildrenToMarkdown(item)}`).join("\n");
    }
    if (tag === "blockquote") return inlineText.split("\n").map((line) => `> ${line}`).join("\n");
    if (tag === "figure") {
      const image = child.querySelector("img");
      const captionElement = child.querySelector("figcaption");
      const caption = captionElement ? editableChildrenToMarkdown(captionElement) : image?.getAttribute("alt") || "";
      const src = image?.getAttribute("src") ?? "";
      return src ? `![${caption}](${src})` : "";
    }
    if (tag === "table") return editableTableToMarkdown(child);
    if (tag === "pre") {
      if (child.getAttribute("data-md-block") === "table") return text;
      return `\`\`\`\n${text}\n\`\`\``;
    }
    if (tag === "hr") return "---";
    return inlineText;
  });

  return blocks.filter(Boolean).join("\n\n");
}

function parseMarkdownEditorTableRow(line: string) {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isMarkdownEditorTableSeparator(line: string) {
  return parseMarkdownEditorTableRow(line).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function markdownTableToEditableHtml(tableLines: string[]) {
  const rows = tableLines
    .filter((line) => !isMarkdownEditorTableSeparator(line))
    .map(parseMarkdownEditorTableRow)
    .filter((row) => row.length > 0);
  const [header = ["항목", "설명"], ...bodyRows] = rows;
  const headerHtml = header.map((cell) => `<th>${inlineMarkdownToEditableHtml(cell)}</th>`).join("");
  const bodyHtml = (bodyRows.length > 0 ? bodyRows : [["기준", "내용을 입력하세요"]])
    .map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdownToEditableHtml(cell)}</td>`).join("")}</tr>`)
    .join("");

  return `<table data-md-block="table"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
}

function editableTableToMarkdown(table: Element) {
  const rows = Array.from(table.querySelectorAll("tr"))
    .map((row) => Array.from(row.querySelectorAll("th,td")).map((cell) => editableChildrenToMarkdown(cell).trim()))
    .filter((row) => row.length > 0);
  if (rows.length === 0) return "";

  const columnCount = Math.max(...rows.map((row) => row.length));
  const normalizeRow = (row: string[]) => Array.from({ length: columnCount }, (_, index) => row[index] ?? "");
  const toMarkdownRow = (row: string[]) => `| ${normalizeRow(row).join(" | ")} |`;
  const [header, ...bodyRows] = rows;
  const separator = Array.from({ length: columnCount }, () => "---");

  return [toMarkdownRow(header), toMarkdownRow(separator), ...bodyRows.map(toMarkdownRow)].join("\n");
}

function FormatButton({ action }: { action: MarkdownAction }) {
  return (
    <button
      type="button"
      className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 text-xs font-semibold text-ink transition hover:bg-soft active:translate-y-px"
      title={action.title}
      onMouseDown={(event) => event.preventDefault()}
      onClick={action.run}
    >
      {action.icon}
      {action.label}
    </button>
  );
}

function getPageCount(container: ContainerSpec) {
  return container.modules.reduce(
    (moduleTotal, module) =>
      moduleTotal + module.lessons.reduce((lessonTotal, lesson) => lessonTotal + lesson.pages.length, 0),
    0
  );
}

function getLessonCount(container: ContainerSpec) {
  return container.modules.reduce((total, module) => total + module.lessons.length, 0);
}

function getModulePages(module: ModuleSpec) {
  return module.lessons.flatMap((lesson) => lesson.pages);
}

const inlineEditClass =
  "-mx-1.5 rounded-md border border-transparent bg-transparent px-1.5 outline-none transition hover:border-current/20 focus:border-primary/40 focus:bg-transparent focus:ring-2 focus:ring-primary/10 read-only:hover:border-transparent";
const compactFieldClass =
  "h-8 w-full rounded-md border border-line bg-white px-2 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

function getPricing(container: ContainerSpec) {
  const originalPrice = Math.max(0, Math.round(container.pricing?.originalPrice ?? 0));
  const discountRate = Math.min(100, Math.max(0, Math.round(container.pricing?.discountRate ?? 0)));
  return {
    originalPrice,
    discountRate,
    salePrice: getSalePrice({ originalPrice, discountRate })
  };
}

function getSalePrice(pricing: { originalPrice: number; discountRate: number }) {
  return Math.round(pricing.originalPrice * (100 - pricing.discountRate) / 100);
}

function formatWon(value: number) {
  return value === 0 ? "0원" : `${value.toLocaleString("ko-KR")}원`;
}

function buildDefaultIntroMarkdown(container: ContainerSpec) {
  return [
    "## 컨테이너 소개",
    "",
    container.summary,
    "",
    ...container.outcomes.map((outcome) => `- ${outcome}`)
  ].join("\n");
}

function normalizeRecommendationCards(container: ContainerSpec): ContainerRecommendation[] {
  const fallbackImages = [
    "/assets/audiences/ai-beginner.png",
    "/assets/audiences/automation-worker.png",
    "/assets/audiences/team-leader.png",
    "/assets/audiences/result-learner.png"
  ];
  const fallbackTexts = [
    container.audience[0] ?? "AI 적용 지점을 찾고 싶은 실무자",
    container.audience[1] ?? "반복 업무를 줄이고 싶은 팀원",
    container.audience[2] ?? "팀의 AI 활용 기준이 필요한 리더",
    "결과물 중심으로 배우고 싶은 학습자"
  ];

  return Array.from({ length: 4 }, (_, index) => ({
    image: container.recommendationCards?.[index]?.image ?? fallbackImages[index],
    text: container.recommendationCards?.[index]?.text ?? fallbackTexts[index]
  }));
}

function setRecommendationCard(cards: ContainerRecommendation[], index: number, card: ContainerRecommendation) {
  const next = [...cards];
  next[index] = card;
  return next;
}

function EditableOutcomeGrid({
  learningItems,
  onLearningChange
}: {
  learningItems: string[];
  onLearningChange: (items: string[]) => void;
}) {
  function updateItem(items: string[], index: number, value: string, onChange: (items: string[]) => void) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function removeItem(items: string[], index: number, onChange: (items: string[]) => void) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  const group = {
    id: "capability",
    heading: "이 학습 후에는",
    iconClassName: "text-primary",
    items: learningItems,
    addLabel: "항목 추가",
    newItem: "새 항목",
    ariaPrefix: "이 학습 후에는",
    onChange: onLearningChange
  };

  return (
    <article className="rounded-xl border border-line bg-white p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="flex min-w-0 items-center gap-2 text-lg font-bold tracking-tight">
          <PackageOpen className={group.iconClassName} size={18} strokeWidth={2} aria-hidden="true" />
          <span className="min-w-0">{group.heading}</span>
        </h2>
        <button
          type="button"
          className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white text-ink transition hover:bg-soft active:translate-y-px"
          title={group.addLabel}
          aria-label={group.addLabel}
          onClick={() => group.onChange([...group.items, group.newItem])}
        >
          <Plus size={14} aria-hidden="true" />
        </button>
      </div>
      <ul className="grid gap-2.5">
        {group.items.map((item, itemIndex) => (
          <li className="flex gap-2.5 text-sm font-semibold leading-6 text-ink" key={`${group.id}-${itemIndex}`}>
            <CheckCircle2 className={`mt-1 shrink-0 ${group.iconClassName}`} size={14} aria-hidden="true" />
            <InlineInput
              ariaLabel={`${group.ariaPrefix} ${itemIndex + 1}`}
              className="min-w-0 flex-1 text-sm font-semibold leading-6 text-ink"
              value={item}
              onChange={(value) => updateItem(group.items, itemIndex, value, group.onChange)}
            />
            <button
              type="button"
              className="focus-ring rounded-md px-1.5 text-xs font-semibold text-danger transition hover:bg-danger/5 disabled:opacity-30"
              disabled={group.items.length <= 1}
              onClick={() => removeItem(group.items, itemIndex, group.onChange)}
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
    </article>
  );
}

function EditableIconList({
  items,
  iconClassName,
  onChange,
  addLabel = "항목 추가",
  newItemLabel = "새 항목"
}: {
  items: string[];
  iconClassName: string;
  onChange?: (items: string[]) => void;
  addLabel?: string;
  newItemLabel?: string;
}) {
  const canEdit = Boolean(onChange);

  return (
    <div className="grid gap-3">
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-soft px-3 py-2 text-sm font-medium text-muted">아직 입력된 항목이 없습니다.</p>
      ) : null}
      <ul className="grid gap-3">
        {items.map((item, index) => (
          <li className="flex gap-3 text-sm font-semibold leading-6 text-ink" key={index}>
            <CheckCircle2 className={`mt-1 shrink-0 ${iconClassName}`} size={15} aria-hidden="true" />
            <InlineInput
              ariaLabel={`항목 ${index + 1}`}
              className="min-w-0 flex-1 text-sm font-semibold leading-6 text-ink"
              value={item}
              readOnly={!onChange}
              onChange={onChange ? (value) => {
                const next = [...items];
                next[index] = value;
                onChange(next);
              } : undefined}
            />
            {canEdit ? (
              <button
                type="button"
                className="focus-ring rounded-md px-1.5 text-xs font-semibold text-danger transition hover:bg-danger/5 disabled:opacity-30"
                disabled={items.length <= 1}
                onClick={() => onChange?.(items.filter((_, itemIndex) => itemIndex !== index))}
              >
                삭제
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      {canEdit ? (
        <button
          type="button"
          className="focus-ring inline-flex h-8 w-fit items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink transition hover:bg-soft active:translate-y-px"
          onClick={() => onChange?.([...items, newItemLabel])}
        >
          <Plus size={14} aria-hidden="true" />
          {addLabel}
        </button>
      ) : null}
    </div>
  );
}

function AssetPicker({
  className = "aspect-[16/10]",
  image,
  slug,
  onChange
}: {
  className?: string;
  image: string;
  slug: string;
  onChange: (image: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("slug", slug);
      body.append("file", file);
      const response = await fetch("/api/local-cms/assets", { method: "POST", body });
      const result = (await response.json().catch(() => ({}))) as { path?: string; error?: string | { message?: string } };
      if (!response.ok || !result.path) {
        window.alert(readApiError(result, "이미지 업로드에 실패했습니다."));
        return;
      }
      onChange(result.path);
    } catch {
      window.alert("이미지 업로드 요청을 완료하지 못했습니다.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className={`group relative block overflow-hidden bg-soft ${className}`}>
      <Image
        src={image}
        alt=""
        className="object-cover transition group-hover:scale-[1.02]"
        fill
        sizes="(min-width: 640px) 260px, 100vw"
      />
      <button
        className="focus-ring absolute inset-0 text-left disabled:cursor-wait"
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        <span className="absolute inset-x-0 bottom-0 bg-ink/70 px-3 py-2 text-xs font-semibold text-white transition group-hover:bg-ink/85">
          {isUploading ? "업로드 중" : "섬네일 첨부"}
        </span>
      </button>
      <input
        ref={inputRef}
        accept="image/*"
        className="sr-only"
        disabled={isUploading}
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.currentTarget.value = "";
        }}
      />
    </div>
  );
}

function MarkdownImageAttachmentButton({
  children,
  className = "focus-ring cursor-pointer rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-soft",
  slug,
  onBeforeOpen,
  onAttach
}: {
  children?: ReactNode;
  className?: string;
  slug: string;
  onBeforeOpen?: () => void;
  onAttach: (path: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("slug", slug);
      body.append("file", file);
      const response = await fetch("/api/local-cms/assets", { method: "POST", body });
      const result = (await response.json().catch(() => ({}))) as { path?: string; error?: string | { message?: string } };
      if (!response.ok || !result.path) {
        window.alert(readApiError(result, "이미지 업로드에 실패했습니다."));
        return;
      }
      onAttach(result.path);
    } catch {
      window.alert("이미지 업로드 요청을 완료하지 못했습니다.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <>
      <button
        className={className}
        type="button"
        disabled={isUploading}
        onMouseDown={(event) => {
          event.preventDefault();
          onBeforeOpen?.();
        }}
        onClick={() => {
          onBeforeOpen?.();
          inputRef.current?.click();
        }}
      >
        <span className="inline-flex items-center gap-1.5">{isUploading ? "업로드 중" : children ?? "이미지 첨부"}</span>
      </button>
      <input
        ref={inputRef}
        accept="image/*"
        className="sr-only"
        disabled={isUploading}
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.currentTarget.value = "";
        }}
      />
    </>
  );
}

function ContainerSettingsModal({
  draft,
  pricing,
  onClose,
  updateDraft
}: {
  draft: ContainerSpec;
  pricing: ReturnType<typeof getPricing>;
  onClose: () => void;
  updateDraft: DraftUpdater;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 px-4 py-6">
      <div className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.6)]">
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">컨테이너 설정</h2>
            <p className="mt-1 text-xs font-medium text-muted">서비스 화면에 직접 보이는 본문 외 설정만 관리합니다.</p>
          </div>
          <button className="focus-ring rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-soft" type="button" onClick={onClose}>
            닫기
          </button>
        </div>
        <div className="grid gap-5 p-5">
          <label className={labelClass}>
            허브
            <input
              className={inputClass}
              value={draft.hub}
              onChange={(event) => updateDraft((next) => { next.hub = event.target.value; })}
            />
          </label>
          <label className={labelClass}>
            난이도
            <select
              className={inputClass}
              value={draft.difficulty}
              onChange={(event) => updateDraft((next) => { next.difficulty = event.target.value as ContainerDifficulty; })}
            >
              {difficulties.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}
            </select>
          </label>
          <label className={labelClass}>
            트랙
            <input
              className={inputClass}
              value={draft.tracks.join(", ")}
              onChange={(event) => updateDraft((next) => {
                const tracks = event.target.value.split(",").map((track) => track.trim()).filter(Boolean);
                next.tracks = tracks.length > 0 ? tracks : next.tracks;
              })}
            />
          </label>
          <div className="grid gap-4 rounded-xl border border-line bg-soft p-4 sm:grid-cols-2">
            <label className={labelClass}>
              원가
              <InlineNumberInput
                ariaLabel="원가"
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-ink focus:border-primary"
                value={pricing.originalPrice}
                onChange={(value) => updateDraft((next) => {
                  const nextPricing = { ...getPricing(next), originalPrice: value };
                  next.pricing = { originalPrice: nextPricing.originalPrice, discountRate: nextPricing.discountRate };
                })}
              />
            </label>
            <label className={labelClass}>
              할인률
              <InlineNumberInput
                ariaLabel="할인률"
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-ink focus:border-primary"
                value={pricing.discountRate}
                onChange={(value) => updateDraft((next) => {
                  const nextPricing = { ...getPricing(next), discountRate: Math.min(100, Math.max(0, value)) };
                  next.pricing = { originalPrice: nextPricing.originalPrice, discountRate: nextPricing.discountRate };
                })}
              />
            </label>
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold text-muted">표시 가격</p>
              <p className="mt-1 text-2xl font-bold tracking-tight">{formatWon(pricing.salePrice)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleManagerModal({
  draft,
  message,
  onClose,
  onSave,
  saveState,
  updateDraft
}: {
  draft: ContainerSpec;
  message: string;
  onClose: () => void;
  onSave: () => void;
  saveState: SaveState;
  updateDraft: DraftUpdater;
}) {
  const [activeModuleId, setActiveModuleId] = useState(() => draft.modules[0]?.id ?? "");
  const lessonTotal = draft.modules.reduce((total, module) => total + module.lessons.length, 0);
  const pageTotal = draft.modules.reduce(
    (moduleTotal, module) =>
      moduleTotal + module.lessons.reduce((lessonTotal, lesson) => lessonTotal + lesson.pages.length, 0),
    0
  );
  const activeModuleIndex = Math.max(0, draft.modules.findIndex((module) => module.id === activeModuleId));
  const activeModule = draft.modules[activeModuleIndex];
  const activeModulePages = activeModule ? getModulePages(activeModule) : [];

  useEffect(() => {
    if (draft.modules.length === 0) return;
    if (!draft.modules.some((module) => module.id === activeModuleId)) {
      setActiveModuleId(draft.modules[Math.min(activeModuleIndex, draft.modules.length - 1)]?.id ?? draft.modules[0].id);
    }
  }, [activeModuleId, activeModuleIndex, draft.modules]);

  const addModule = () => {
    const module = createModule();
    updateDraft((next) => { next.modules.push(module); });
    setActiveModuleId(module.id);
  };

  const addLesson = () => {
    if (!activeModule) return;
    const lesson = createLesson();
    updateDraft((next) => { next.modules[activeModuleIndex].lessons.push(lesson); });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/35 p-3 sm:p-5 lg:p-6">
      <section className="flex h-[90dvh] max-h-[900px] w-full max-w-7xl flex-col overflow-hidden rounded-xl border border-line bg-white shadow-elevated">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-ink">모듈/레슨 목록 편집</h2>
            <p className="mt-0.5 text-xs font-medium text-muted">
              모듈 {draft.modules.length}개 · 레슨 {lessonTotal}개 · 페이지 {pageTotal}개
            </p>
          </div>
          <button
            className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-white text-ink hover:bg-soft"
            type="button"
            title="닫기"
            aria-label="모듈/레슨 목록 편집 닫기"
            onClick={onClose}
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]">
          <aside className="min-h-0 overflow-y-auto border-b border-line bg-soft/45 lg:border-b-0 lg:border-r">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-soft px-4 py-2.5">
              <p className="text-xs font-bold text-muted">모듈</p>
              <button
                className="focus-ring inline-flex h-8 items-center gap-1 rounded-md border border-line bg-white px-2.5 text-xs font-semibold text-ink hover:bg-soft"
                type="button"
                onClick={addModule}
              >
                <Plus size={13} aria-hidden="true" />
                모듈 추가
              </button>
            </div>
            <ol className="divide-y divide-line">
              {draft.modules.map((module, moduleIndex) => {
                const isActive = module.id === activeModule?.id;
                return (
                  <li
                    className={`grid grid-cols-[34px_minmax(0,1fr)_76px] gap-2 px-4 py-2.5 transition ${isActive ? "bg-white" : "hover:bg-white/70"}`}
                    key={module.id}
                    onFocusCapture={() => setActiveModuleId(module.id)}
                    onMouseDown={() => setActiveModuleId(module.id)}
                  >
                    <button
                      className={`focus-ring h-8 rounded-md font-mono text-[11px] font-bold ${isActive ? "bg-primary text-white" : "text-muted hover:bg-white"}`}
                      type="button"
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => setActiveModuleId(module.id)}
                    >
                      {moduleIndex + 1}
                    </button>
                    <input
                      aria-label={`모듈 ${moduleIndex + 1} 제목`}
                      className={`${compactFieldClass} ${isActive ? "border-primary/35" : ""}`}
                      value={module.title}
                      onChange={(event) => updateDraft((next) => { next.modules[moduleIndex].title = event.target.value; })}
                    />
                    <div className="flex items-center justify-end gap-1">
                      <MoveButton direction="up" disabled={moduleIndex === 0} label="모듈 위로 이동" onClick={() => updateDraft((next) => moveItem(next.modules, moduleIndex, moduleIndex - 1))} />
                      <MoveButton direction="down" disabled={moduleIndex === draft.modules.length - 1} label="모듈 아래로 이동" onClick={() => updateDraft((next) => moveItem(next.modules, moduleIndex, moduleIndex + 1))} />
                    </div>
                  </li>
                );
              })}
            </ol>
          </aside>

          <section className="min-h-0 overflow-y-auto bg-white">
            {activeModule ? (
              <>
                <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-line bg-white px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-primary">모듈 {activeModuleIndex + 1}</p>
                    <h3 className="truncate text-sm font-bold text-ink">{activeModule.title}</h3>
                    <p className="mt-0.5 text-xs font-semibold text-muted">레슨 {activeModule.lessons.length}개 · 페이지 {activeModulePages.length}개</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      className="focus-ring inline-flex h-8 items-center gap-1 rounded-md border border-line bg-white px-2 text-xs font-semibold text-ink hover:bg-soft"
                      type="button"
                      onClick={addLesson}
                    >
                      <Plus size={13} aria-hidden="true" />
                      레슨 추가
                    </button>
                    <button
                      className="focus-ring inline-flex h-8 items-center gap-1 rounded-md border border-danger/25 bg-white px-2 text-xs font-semibold text-danger hover:bg-danger/5 disabled:opacity-40"
                      type="button"
                      disabled={draft.modules.length <= 1}
                      onClick={() => updateDraft((next) => { next.modules.splice(activeModuleIndex, 1); })}
                    >
                      <Trash2 size={13} aria-hidden="true" />
                      모듈 삭제
                    </button>
                  </div>
                </div>

                <div className="hidden border-b border-line bg-soft/60 px-5 py-1.5 text-[11px] font-bold text-muted lg:grid lg:grid-cols-[52px_minmax(0,1fr)_88px_84px_128px] lg:gap-2">
                  <span>#</span>
                  <span>레슨 제목</span>
                  <span>페이지</span>
                  <span>열기</span>
                  <span className="text-right">작업</span>
                </div>
                <ol className="divide-y divide-line">
                  {activeModule.lessons.map((lesson, lessonIndex) => (
                    <li
                      className="grid gap-2 px-5 py-3 lg:grid-cols-[52px_minmax(0,1fr)_88px_84px_128px] lg:items-center lg:gap-2"
                      key={lesson.id}
                    >
                      <p className="font-mono text-[11px] font-bold text-muted">{activeModuleIndex + 1}.{lessonIndex + 1}</p>
                      <input
                        aria-label={`레슨 ${lessonIndex + 1} 제목`}
                        className={compactFieldClass}
                        value={lesson.title}
                        onChange={(event) => updateDraft((next) => { next.modules[activeModuleIndex].lessons[lessonIndex].title = event.target.value; })}
                      />
                      <p className="text-xs font-semibold text-muted">{lesson.pages.length}개</p>
                      <Link
                        className="focus-ring w-fit rounded-md border border-line bg-white px-2 py-1.5 text-xs font-semibold text-primary hover:bg-soft"
                        href={`/cms/containers/${draft.slug}/pages/${lesson.pages[0].id}`}
                      >
                        페이지
                      </Link>
                      <div className="flex flex-wrap justify-start gap-1.5 lg:justify-end">
                        <MoveButton direction="up" disabled={lessonIndex === 0} label="레슨 위로 이동" onClick={() => updateDraft((next) => moveItem(next.modules[activeModuleIndex].lessons, lessonIndex, lessonIndex - 1))} />
                        <MoveButton direction="down" disabled={lessonIndex === activeModule.lessons.length - 1} label="레슨 아래로 이동" onClick={() => updateDraft((next) => moveItem(next.modules[activeModuleIndex].lessons, lessonIndex, lessonIndex + 1))} />
                        <button
                          className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-md border border-danger/25 bg-white text-danger hover:bg-danger/5 disabled:opacity-40"
                          type="button"
                          title="레슨 삭제"
                          aria-label={`레슨 ${lessonIndex + 1} 삭제`}
                          disabled={activeModule.lessons.length <= 1}
                          onClick={() => updateDraft((next) => { next.modules[activeModuleIndex].lessons.splice(lessonIndex, 1); })}
                        >
                          <Trash2 size={13} aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            ) : null}
          </section>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-white px-5 py-3">
          <p className={`text-xs font-semibold ${saveState === "error" ? "text-danger" : "text-muted"}`}>
            {message || "모듈/레슨 변경 후 저장하세요."}
          </p>
          <button
            type="button"
            className="focus-ring inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-dark disabled:cursor-wait disabled:opacity-70"
            onClick={onSave}
            disabled={saveState === "saving"}
          >
            <Save size={14} aria-hidden="true" />
            변경사항 저장
          </button>
        </div>
      </section>
    </div>
  );
}

function MoveButton({
  direction,
  disabled,
  label,
  onClick
}: {
  direction: "up" | "down";
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-md border border-line bg-white text-ink hover:bg-soft disabled:opacity-40"
      disabled={disabled}
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
    >
      {direction === "up" ? <ArrowUp size={13} aria-hidden="true" /> : <ArrowDown size={13} aria-hidden="true" />}
    </button>
  );
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const [item] = items.splice(fromIndex, 1);
  items.splice(toIndex, 0, item);
}

export function StructureEditor({ initialSpec }: { initialSpec: ContainerSpec }) {
  const { draft, updateDraft, save, saveState, message } = useSpecDraft(initialSpec);

  return (
    <div className="mt-5 rounded-xl border border-line bg-white shadow-soft">
      <div className="border-b border-line p-5">
        <p className="text-sm font-semibold text-primary">Structure</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">{draft.title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">모듈, 레슨, 페이지의 뼈대만 정리합니다. 본문과 블록 내용은 페이지/블록 편집에서 다룹니다.</p>
      </div>
      <div className="grid gap-5 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="컨테이너 제목" value={draft.title} onChange={(value) => updateDraft((next) => { next.title = value; })} />
          <TextArea label="요약" value={draft.summary} rows={3} onChange={(value) => updateDraft((next) => { next.summary = value; })} />
          <TextArea label="노출 뱃지" value={linesToText(draft.displayBadges ?? [])} rows={3} onChange={(value) => updateDraft((next) => {
            const badges = textToLines(value);
            next.displayBadges = badges.length > 0 ? badges : [];
          })} />
          <TextArea label="이 학습 후에는" value={linesToText(draft.outcomes)} rows={4} onChange={(value) => updateDraft((next) => { next.outcomes = textToLines(value); })} />
        </div>
        <div className="flex justify-end">
          <button className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:bg-soft" type="button" onClick={() => updateDraft((next) => { next.modules.push(createModule()); })}>
            <Plus size={14} aria-hidden="true" />
            모듈 추가
          </button>
        </div>
        {draft.modules.map((module, moduleIndex) => (
          <section className="rounded-xl border border-line bg-soft p-4" key={module.id}>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <Field label="모듈 제목" value={module.title} onChange={(value) => updateDraft((next) => { next.modules[moduleIndex].title = value; })} />
              <Field label="모듈 id" value={module.id} onChange={(value) => updateDraft((next) => { next.modules[moduleIndex].id = value; })} />
              <button className="focus-ring inline-flex h-9 items-center justify-center rounded-lg border border-danger/30 bg-white px-3 text-xs font-semibold text-danger hover:bg-danger/5 disabled:opacity-40" type="button" disabled={draft.modules.length <= 1} onClick={() => updateDraft((next) => { next.modules.splice(moduleIndex, 1); })}>
                삭제
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              {module.lessons.map((lesson, lessonIndex) => (
                <article className="rounded-lg border border-line bg-white p-3" key={lesson.id}>
                  <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                    <Field label="레슨 제목" value={lesson.title} onChange={(value) => updateDraft((next) => { next.modules[moduleIndex].lessons[lessonIndex].title = value; })} />
                    <button className="focus-ring inline-flex h-9 items-center justify-center rounded-lg border border-danger/30 bg-white px-3 text-xs font-semibold text-danger hover:bg-danger/5 disabled:opacity-40" type="button" disabled={module.lessons.length <= 1} onClick={() => updateDraft((next) => { next.modules[moduleIndex].lessons.splice(lessonIndex, 1); })}>
                      삭제
                    </button>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {lesson.pages.map((page, pageIndex) => (
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-soft px-3 py-2" key={page.id}>
                        <div className="min-w-0 flex-1">
                          <input className="w-full bg-transparent text-sm font-semibold text-ink outline-none" value={page.title} onChange={(event) => updateDraft((next) => {
                            const nextPage = next.modules[moduleIndex].lessons[lessonIndex].pages[pageIndex];
                            nextPage.title = event.target.value;
                            nextPage.left.title = event.target.value;
                          })} />
                          <p className="mt-0.5 text-xs text-muted">{page.id}</p>
                        </div>
                        <div className="flex gap-2">
                          <Link className="focus-ring rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-soft" href={`/cms/containers/${draft.slug}/pages/${page.id}`}>
                            페이지 편집
                          </Link>
                          <button className="focus-ring rounded-lg border border-danger/30 bg-white px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/5 disabled:opacity-40" type="button" disabled={lesson.pages.length <= 1} onClick={() => updateDraft((next) => { next.modules[moduleIndex].lessons[lessonIndex].pages.splice(pageIndex, 1); })}>
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="focus-ring mt-3 inline-flex h-8 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:bg-soft" type="button" onClick={() => updateDraft((next) => { next.modules[moduleIndex].lessons[lessonIndex].pages.push(createPage()); })}>
                    <Plus size={14} aria-hidden="true" />
                    페이지 추가
                  </button>
                </article>
              ))}
            </div>
            <button className="focus-ring mt-3 inline-flex h-8 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:bg-soft" type="button" onClick={() => updateDraft((next) => { next.modules[moduleIndex].lessons.push(createLesson()); })}>
              <Plus size={14} aria-hidden="true" />
              레슨 추가
            </button>
          </section>
        ))}
      </div>
      <SaveBar state={saveState} message={message} onSave={save} />
    </div>
  );
}

export function PageContentEditor({ initialSpec, pageId }: { initialSpec: ContainerSpec; pageId: string }) {
  const { draft, updateDraft, save, saveState, message } = useSpecDraft(initialSpec);
  const [activePageId, setActivePageId] = useState(pageId);
  const [thumbnailDrawerOpen, setThumbnailDrawerOpen] = useState(false);
  const pagePointers = useMemo(() => getPagePointers(draft), [draft]);
  const pointer = pagePointers.find((item) => item.page.id === activePageId) ?? pagePointers.find((item) => item.page.id === pageId) ?? pagePointers[0];

  if (!pointer) return <p className="mt-6 rounded-xl border border-line bg-white p-6 text-sm text-muted">페이지를 찾을 수 없습니다.</p>;

  const page = pointer.page;
  const currentLessonPages = draft.modules[pointer.moduleIndex].lessons[pointer.lessonIndex].pages;
  const currentLessonPagePointers = pagePointers.filter(
    (item) => item.moduleIndex === pointer.moduleIndex && item.lessonIndex === pointer.lessonIndex
  );
  const updatePage = (mutator: (page: PageSpec) => void) => {
    updateDraft((next) => {
      mutator(next.modules[pointer.moduleIndex].lessons[pointer.lessonIndex].pages[pointer.pageIndex]);
    });
  };

  function addPageAfterCurrent() {
    const nextPage = createPage();
    updateDraft((next) => {
      next.modules[pointer.moduleIndex].lessons[pointer.lessonIndex].pages.splice(pointer.pageIndex + 1, 0, nextPage);
    });
    setActivePageId(nextPage.id);
  }

  function duplicateCurrentPage() {
    const nextPage = duplicatePage(page);
    updateDraft((next) => {
      next.modules[pointer.moduleIndex].lessons[pointer.lessonIndex].pages.splice(pointer.pageIndex + 1, 0, nextPage);
    });
    setActivePageId(nextPage.id);
  }

  function deleteCurrentPage() {
    if (currentLessonPages.length <= 1) return;
    const fallbackPage = currentLessonPages[pointer.pageIndex + 1] ?? currentLessonPages[pointer.pageIndex - 1] ?? currentLessonPages[0];
    updateDraft((next) => {
      next.modules[pointer.moduleIndex].lessons[pointer.lessonIndex].pages.splice(pointer.pageIndex, 1);
    });
    setActivePageId(fallbackPage.id);
  }

  function moveCurrentPage(direction: "up" | "down") {
    const targetIndex = direction === "up" ? pointer.pageIndex - 1 : pointer.pageIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentLessonPages.length) return;
    updateDraft((next) => {
      moveItem(next.modules[pointer.moduleIndex].lessons[pointer.lessonIndex].pages, pointer.pageIndex, targetIndex);
    });
  }

  return (
    <div className="min-w-[1280px]">
      <CmsPlayerTopBar
        container={draft}
        currentPageTitle={page.title}
        currentIndex={pointer.pageIndex}
        total={currentLessonPages.length}
        onNext={() => {
          const nextPage = currentLessonPages[pointer.pageIndex + 1];
          if (nextPage) setActivePageId(nextPage.id);
        }}
        onOpenMenu={() => setThumbnailDrawerOpen(true)}
        onPrev={() => {
          const previousPage = currentLessonPages[pointer.pageIndex - 1];
          if (previousPage) setActivePageId(previousPage.id);
        }}
      />

      <PageThumbnailDrawer
        activePageId={page.id}
        open={thumbnailDrawerOpen}
        onClose={() => setThumbnailDrawerOpen(false)}
        onAddPage={addPageAfterCurrent}
        onDeletePage={deleteCurrentPage}
        onDuplicatePage={duplicateCurrentPage}
        onMovePage={moveCurrentPage}
        onSelectPage={(nextPageId) => {
          setActivePageId(nextPageId);
          setThumbnailDrawerOpen(false);
        }}
        pages={currentLessonPagePointers}
        canDelete={currentLessonPages.length > 1}
        canMoveDown={pointer.pageIndex < currentLessonPages.length - 1}
        canMoveUp={pointer.pageIndex > 0}
      />

      <main className="relative h-[calc(100dvh-112px)] overflow-hidden bg-[#eceff3]">
        <PptPageEditor
          canDeleteSlide={currentLessonPages.length > 1}
          canMoveSlideDown={pointer.pageIndex < currentLessonPages.length - 1}
          canMoveSlideUp={pointer.pageIndex > 0}
          lessonPageTotal={currentLessonPages.length}
          onAddSlide={addPageAfterCurrent}
          onDeleteSlide={deleteCurrentPage}
          onDuplicateSlide={duplicateCurrentPage}
          onMoveSlide={moveCurrentPage}
          page={page}
          pointer={pointer}
          slug={draft.slug}
          updatePage={updatePage}
        />
        <FloatingSaveButton
          label="저장"
          message={message}
          state={saveState}
          onSave={save}
        />
      </main>
    </div>
  );
}

function CmsPlayerTopBar({
  container,
  currentIndex,
  currentPageTitle,
  onNext,
  onOpenMenu,
  onPrev,
  total
}: {
  container: ContainerSpec;
  currentIndex: number;
  currentPageTitle: string;
  onNext: () => void;
  onOpenMenu: () => void;
  onPrev: () => void;
  total: number;
}) {
  const progress = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="sticky top-16 z-30 border-b border-[#d8dde6] bg-white/94 backdrop-blur supports-[backdrop-filter]:bg-white/82">
      <div className="flex min-h-12 items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            className="focus-ring hidden shrink-0 items-center gap-1 rounded-md text-xs font-bold text-muted transition hover:text-ink sm:inline-flex"
            href={`/cms/containers/${container.slug}`}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            나가기
          </Link>
          <span className="hidden h-4 w-px bg-[#d8dde6] sm:block" aria-hidden="true" />
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-sm font-semibold text-ink">{container.title}</p>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 shrink-0 items-center gap-3">
          <p className="hidden max-w-[440px] truncate text-xs font-medium text-muted lg:block">{currentPageTitle}</p>
          <div className="flex w-[132px] items-center gap-2 sm:w-[220px]">
            <span className="text-xs font-bold tabular-nums text-muted">
              {currentIndex + 1}/{total}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e8ebf0]">
              <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <span className="w-9 text-right text-xs font-bold tabular-nums text-ink">{progress}%</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              aria-label="이전"
              className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#d8dde6] bg-white text-muted transition hover:bg-[#f5f6f8] hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 active:translate-y-px"
              disabled={currentIndex === 0}
              onClick={onPrev}
              type="button"
            >
              <ArrowLeft size={16} aria-hidden="true" />
            </button>
            <button
              aria-label="다음"
              className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-35 active:translate-y-px"
              disabled={currentIndex === total - 1}
              onClick={onNext}
              type="button"
            >
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
          <button
            className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-md border border-[#d8dde6] bg-white px-3 text-xs font-semibold text-ink transition hover:bg-[#f5f6f8] active:translate-y-px"
            onClick={onOpenMenu}
            type="button"
          >
            <Menu size={15} aria-hidden="true" />
            메뉴
          </button>
        </div>
      </div>
    </div>
  );
}

function FloatingSaveButton({
  label,
  message,
  onSave,
  state
}: {
  label: string;
  message: string;
  onSave: () => void;
  state: SaveState;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex max-w-[420px] items-center gap-2">
      {message ? (
        <span className={`hidden rounded-md border px-3 py-2 text-xs font-semibold shadow-[0_20px_60px_-48px_rgba(15,23,42,0.7)] xl:inline-flex ${
          state === "error" ? "border-danger/25 bg-white text-danger" : "border-success/20 bg-white text-ink"
        }`}>
          {message}
        </span>
      ) : null}
      <button
        className="focus-ring inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.72)] transition hover:bg-primary-dark disabled:cursor-wait disabled:opacity-70 active:translate-y-px"
        disabled={state === "saving"}
        type="button"
        onClick={onSave}
      >
        {state === "error" ? <AlertCircle size={16} aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
        {state === "saving" ? "저장 중" : label}
      </button>
    </div>
  );
}

function getSlideCallout(page: PageSpec) {
  const quote = getReadingMarkdown(page.left)
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .find((block) => block.startsWith(">"))
    ?.replace(/^>\s?/gm, "");
  return quote ?? page.left.checkpoints?.[0];
}

function getPageDescription(page: PageSpec) {
  return getReadingMarkdown(page.left)
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .find((block) => !block.startsWith(">") && !/^#{1,6}\s/.test(block))
    ?.replace(/[`*_>#-]/g, "")
    .trim() ?? "";
}

function getSlideBodyText(page: PageSpec) {
  return getReadingMarkdown(page.left)
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .find((block) => !block.startsWith(">") && !/^#{1,6}\s/.test(block))
    ?.trim() ?? "";
}

function PptEditorToolbar({
  canDeleteSlide,
  canMoveSlideDown,
  canMoveSlideUp,
  onAddCallout,
  onAddCanvas,
  onAddChecklist,
  onAddImage,
  onAddList,
  onAddQuiz,
  onAddSlide,
  onAddText,
  onDeleteSlide,
  onDuplicateSlide,
  onDeleteSelectedElement,
  onMoveSlide,
  onUpdateSelectedMetric,
  selectedElement
}: {
  canDeleteSlide: boolean;
  canMoveSlideDown: boolean;
  canMoveSlideUp: boolean;
  onAddCallout: () => void;
  onAddCanvas: () => void;
  onAddChecklist: () => void;
  onAddImage: () => void;
  onAddList: () => void;
  onAddQuiz: () => void;
  onAddSlide: () => void;
  onAddText: () => void;
  onDeleteSlide: () => void;
  onDuplicateSlide: () => void;
  onDeleteSelectedElement: () => void;
  onMoveSlide: (direction: "up" | "down") => void;
  onUpdateSelectedMetric: (metric: "x" | "y" | "width" | "height", value: number) => void;
  selectedElement?: SlideElementSpec;
}) {
  return (
    <div className="absolute left-1/2 top-3 z-30 flex max-w-[calc(100%-48px)] -translate-x-1/2 items-center gap-1.5 overflow-x-auto rounded-md border border-[#d8dde6] bg-white/95 p-1.5 shadow-[0_22px_64px_-48px_rgba(15,23,42,0.72)] backdrop-blur">
      <div className="flex shrink-0 items-center gap-1 border-r border-[#d8dde6] pr-1.5">
        <PptToolbarButton icon={<Plus size={15} />} label="새 슬라이드" onClick={onAddSlide} />
        <PptToolbarButton icon={<Copy size={15} />} label="복제" onClick={onDuplicateSlide} />
        <PptToolbarButton icon={<ArrowUp size={15} />} label="위로" onClick={() => onMoveSlide("up")} disabled={!canMoveSlideUp} />
        <PptToolbarButton icon={<ArrowDown size={15} />} label="아래로" onClick={() => onMoveSlide("down")} disabled={!canMoveSlideDown} />
        <PptToolbarButton icon={<Trash2 size={15} />} label="삭제" onClick={onDeleteSlide} disabled={!canDeleteSlide} danger />
      </div>

      <div className="flex shrink-0 items-center gap-1 border-r border-[#d8dde6] px-1.5">
        <PptToolbarButton icon={<BookOpenText size={15} />} label="텍스트 상자" onClick={onAddText} />
        <PptToolbarButton icon={<Quote size={15} />} label="도형" onClick={onAddCallout} />
        <PptToolbarButton icon={<List size={15} />} label="글머리" onClick={onAddList} />
        <PptToolbarButton icon={<ImagePlus size={15} />} label="그림" onClick={onAddImage} />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <PptToolbarButton icon={<Code size={15} />} label="코드" onClick={onAddCanvas} />
        <PptToolbarButton icon={<CheckCircle2 size={15} />} label="체크박스" onClick={onAddChecklist} />
        <PptToolbarButton icon={<Table2 size={15} />} label="선택지" onClick={onAddQuiz} />
      </div>
      {selectedElement ? (
        <div className="ml-1.5 flex shrink-0 items-center gap-1.5 border-l border-[#d8dde6] pl-1.5">
          <span className="rounded-sm bg-[#eef2ff] px-2 py-1 text-[11px] font-bold text-primary">{getSlideElementToolLabel(selectedElement.type)}</span>
          <ElementMetricInput label="X" value={selectedElement.x} onChange={(value) => onUpdateSelectedMetric("x", value)} compact />
          <ElementMetricInput label="Y" value={selectedElement.y} onChange={(value) => onUpdateSelectedMetric("y", value)} compact />
          <ElementMetricInput label="W" value={selectedElement.width} onChange={(value) => onUpdateSelectedMetric("width", value)} compact />
          <ElementMetricInput label="H" value={selectedElement.height} onChange={(value) => onUpdateSelectedMetric("height", value)} compact />
          <button
            className="focus-ring inline-flex h-8 items-center justify-center rounded-md border border-danger/25 bg-white px-2 text-xs font-semibold text-danger transition hover:bg-danger/5 active:translate-y-px"
            type="button"
            onClick={onDeleteSelectedElement}
          >
            <Trash2 size={13} aria-hidden="true" />
            <span className="hidden 2xl:inline">삭제</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

function PptToolbarButton({
  danger,
  disabled,
  icon,
  label,
  onClick
}: {
  danger?: boolean;
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`focus-ring inline-flex h-8 items-center justify-center gap-1.5 rounded-md border px-2 text-xs font-semibold transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-35 ${
        danger
          ? "border-danger/25 bg-white text-danger hover:bg-danger/5"
          : "border-[#d8dde6] bg-white text-ink hover:border-primary/30 hover:bg-[#eef2ff]"
      }`}
      disabled={disabled}
      type="button"
      onClick={onClick}
      title={label}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </button>
  );
}

function PptPageEditor({
  canDeleteSlide,
  canMoveSlideDown,
  canMoveSlideUp,
  lessonPageTotal,
  onAddSlide,
  onDeleteSlide,
  onDuplicateSlide,
  onMoveSlide,
  page,
  pointer,
  slug,
  updatePage
}: {
  canDeleteSlide: boolean;
  canMoveSlideDown: boolean;
  canMoveSlideUp: boolean;
  lessonPageTotal: number;
  onAddSlide: () => void;
  onDeleteSlide: () => void;
  onDuplicateSlide: () => void;
  onMoveSlide: (direction: "up" | "down") => void;
  page: PageSpec;
  pointer: PagePointer;
  slug: string;
  updatePage: (mutator: (page: PageSpec) => void) => void;
}) {
  const slideBodyText = getSlideBodyText(page);
  const slideCallout = getSlideCallout(page);
  const pageDescription = getPageDescription(page);
  const slideElements = page.slideElements ?? [];
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const selectedElement = slideElements.find((element) => element.id === selectedElementId);

  useEffect(() => {
    setSelectedElementId(null);
  }, [page.id]);

  function updatePageTitle(value: string) {
    updatePage((next) => {
      next.title = value;
      next.left.title = value;
    });
  }

  function updateBodyMarkdown(value: string) {
    updatePage((next) => {
      next.left.bodyMarkdown = value;
      next.left.paragraphs = markdownToPlainParagraphs(value);
      next.left.checkpoints = [];
      delete next.left.footnote;
    });
  }

  function updateFirstBodyBlock(value: string) {
    const blocks = getReadingMarkdown(page.left)
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean);
    const descriptionIndex = blocks.findIndex((block) => !block.startsWith(">") && !/^#{1,6}\s/.test(block));
    if (descriptionIndex >= 0) {
      blocks[descriptionIndex] = value;
    } else {
      blocks.unshift(value);
    }
    updateBodyMarkdown(blocks.join("\n\n"));
  }

  function updateSlideCallout(value: string) {
    const blocks = getReadingMarkdown(page.left)
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter((block) => block && !block.startsWith(">"));
    const callout = value.trim()
      ? value.split("\n").map((line) => `> ${line}`).join("\n")
      : "";
    updateBodyMarkdown([...blocks, callout].filter(Boolean).join("\n\n"));
  }

  function addWorkspaceBlock(type: WorkspaceBlockType) {
    updatePage((next) => {
      const block = createBlock(type);
      next.workspace.blocks.push(block);
      if (type === "code-canvas") next.workspace.layout = "focus";
    });
  }

  function addSlideElement(type: SlideElementType) {
    const element = createSlideElement(type);
    updatePage((next) => {
      next.slideElements = [...(next.slideElements ?? []), element];
    });
    setSelectedElementId(element.id);
  }

  function updateSlideElement(id: string, mutator: (element: SlideElementSpec) => void) {
    updatePage((next) => {
      const target = (next.slideElements ?? []).find((element) => element.id === id);
      if (target) mutator(target);
    });
  }

  function updateElementMetric(id: string, metric: "x" | "y" | "width" | "height", value: number) {
    if (!Number.isFinite(value)) return;
    updateSlideElement(id, (element) => {
      if (metric === "x") element.x = roundSlidePercent(clampSlidePercent(value, 0, Math.max(0, 100 - element.width)));
      if (metric === "y") element.y = roundSlidePercent(clampSlidePercent(value, 0, Math.max(0, 100 - element.height)));
      if (metric === "width") element.width = roundSlidePercent(clampSlidePercent(value, 6, 100 - element.x));
      if (metric === "height") element.height = roundSlidePercent(clampSlidePercent(value, 6, 100 - element.y));
    });
  }

  function deleteSlideElement(id: string) {
    updatePage((next) => {
      next.slideElements = (next.slideElements ?? []).filter((element) => element.id !== id);
    });
    setSelectedElementId((current) => current === id ? null : current);
  }

  function startElementDrag(event: ReactPointerEvent<HTMLButtonElement>, element: SlideElementSpec) {
    event.preventDefault();
    event.stopPropagation();
    const canvas = event.currentTarget.closest("[data-cms-slide-canvas]");
    if (!(canvas instanceof HTMLElement)) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    setSelectedElementId(element.id);
    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const startX = element.x;
    const startY = element.y;

    function handlePointerMove(moveEvent: PointerEvent) {
      const deltaX = ((moveEvent.clientX - startClientX) / rect.width) * 100;
      const deltaY = ((moveEvent.clientY - startClientY) / rect.height) * 100;
      updateSlideElement(element.id, (target) => {
        target.x = roundSlidePercent(clampSlidePercent(startX + deltaX, 0, Math.max(0, 100 - target.width)));
        target.y = roundSlidePercent(clampSlidePercent(startY + deltaY, 0, Math.max(0, 100 - target.height)));
      });
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  }

  return (
    <section className="relative h-full overflow-hidden bg-[#eceff3]">
      <div className="grid h-full grid-cols-[minmax(320px,30%)_minmax(0,1fr)] overflow-hidden">
        <aside className="min-w-0 overflow-hidden border-r border-[#d8dde6] bg-[#fbfbfa]">
          <div className="flex h-full min-h-0 flex-col">
            <div className="border-b border-[#d8dde6] px-5 py-5 lg:px-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="min-w-0 text-xl font-semibold leading-tight text-ink">{pointer.lessonTitle}</h2>
                <p className="shrink-0 pt-1 text-xs font-bold tabular-nums text-primary">
                  {String(pointer.pageIndex + 1).padStart(2, "0")} / {String(lessonPageTotal).padStart(2, "0")}
                </p>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col px-5 py-5 lg:px-6">
              <section className="shrink-0">
                <label className="block">
                  <span className="sr-only">현재 페이지 제목</span>
                  <input
                    className="w-full bg-transparent text-lg font-semibold leading-tight text-ink outline-none transition focus:text-primary"
                    value={page.left.title}
                    onChange={(event) => updatePageTitle(event.target.value)}
                  />
                </label>
                <label className="mt-3 block">
                  <span className="sr-only">현재 페이지 설명</span>
                  <textarea
                    className="w-full resize-none overflow-hidden bg-transparent text-sm leading-6 text-muted outline-none transition focus:text-ink"
                    rows={2}
                    value={pageDescription}
                    onChange={(event) => updateFirstBodyBlock(event.target.value)}
                  />
                </label>
              </section>

              <section className="mt-5 flex min-h-0 flex-1 flex-col border-t border-[#d8dde6] pt-5">
                <div className="shift-coach-surface pointer-events-none opacity-95">
                  <div className="shift-coach-surface__trigger">
                    <span className="shift-coach-surface__wash" aria-hidden="true" />
                    <span className="shift-coach-icon" aria-hidden="true">
                      <span className="shift-coach-icon__halo" />
                      <span className="shift-coach-icon__bubble">
                        <MessageCircle size={28} strokeWidth={1.9} />
                        <Sparkles className="shift-coach-icon__spark" size={15} strokeWidth={2.1} />
                      </span>
                    </span>
                    <span className="shift-coach-surface__copy">
                      <span className="shift-coach-surface__eyebrow">AI 코치</span>
                      <span className="shift-coach-surface__title">이 페이지를 보고 있어요</span>
                      <span className="shift-coach-surface__hint">궁금한 사항이 있다면 여기를 클릭해서 물어보세요</span>
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </aside>

        <main className="relative min-h-0 min-w-0 overflow-y-auto bg-[#eef0f4]">
          <PptEditorToolbar
            canDeleteSlide={canDeleteSlide}
            canMoveSlideDown={canMoveSlideDown}
            canMoveSlideUp={canMoveSlideUp}
            onAddCallout={() => addSlideElement("callout")}
            onAddCanvas={() => addWorkspaceBlock("code-canvas")}
            onAddChecklist={() => addWorkspaceBlock("checklist")}
            onAddImage={() => addWorkspaceBlock("image-definition")}
            onAddList={() => addSlideElement("list")}
            onAddQuiz={() => addWorkspaceBlock("quiz")}
            onAddSlide={onAddSlide}
            onAddText={() => addSlideElement("text")}
            onDeleteSelectedElement={() => selectedElement ? deleteSlideElement(selectedElement.id) : undefined}
            onDeleteSlide={onDeleteSlide}
            onDuplicateSlide={onDuplicateSlide}
            onMoveSlide={onMoveSlide}
            onUpdateSelectedMetric={(metric, value) => {
              if (selectedElement) updateElementMetric(selectedElement.id, metric, value);
            }}
            selectedElement={selectedElement}
          />
          <section className="flex min-h-full items-center justify-center bg-[#eef0f4] px-[clamp(20px,2.6vw,44px)] py-[clamp(20px,3vh,36px)]">
            <article
              className="relative grid aspect-video overflow-hidden rounded-[7px] border border-[#d8dde6] bg-[#fbfbfa] shadow-[0_28px_70px_-56px_rgba(15,23,42,0.62)]"
              data-cms-slide-canvas
              style={{ width: "min(100%, calc((100dvh - 184px) * 16 / 9))" }}
              onPointerDown={() => setSelectedElementId(null)}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-primary" aria-hidden="true" />
              <div className="min-h-0 overflow-y-auto px-9 py-8 xl:px-12 xl:py-10 2xl:px-16 2xl:py-12">
                <div className="grid min-h-0 content-center gap-5 xl:gap-6 2xl:gap-7">
                  <input
                    className="max-w-[980px] bg-transparent text-4xl font-semibold leading-[1.06] text-[#111827] outline-none transition focus:text-primary xl:text-5xl 2xl:text-6xl"
                    value={page.left.title}
                    onChange={(event) => updatePageTitle(event.target.value)}
                  />
                  <textarea
                    className="min-h-[116px] max-w-[860px] resize-none bg-transparent text-[17px] leading-8 text-[#485262] outline-none transition placeholder:text-muted/50 focus:text-[#172033] xl:text-[19px] 2xl:text-[20px]"
                    value={slideBodyText}
                    onChange={(event) => updateFirstBodyBlock(event.target.value)}
                  />
                  {slideCallout !== undefined ? (
                    <textarea
                      className="max-w-[820px] resize-none border-l-4 border-primary bg-[#f2f4f8] px-5 py-4 text-[15px] font-semibold leading-7 text-[#172033] outline-none transition focus:bg-white/85"
                      rows={2}
                      value={slideCallout ?? ""}
                      onChange={(event) => updateSlideCallout(event.target.value)}
                    />
                  ) : null}
                  <CmsWorkspaceOnSlide page={page} slug={slug} updatePage={updatePage} />
                </div>
              </div>
              {slideElements.map((element) => (
                <CmsSlideElement
                  element={element}
                  key={element.id}
                  selected={element.id === selectedElementId}
                  onDelete={() => deleteSlideElement(element.id)}
                  onDragStart={(event) => startElementDrag(event, element)}
                  onSelect={() => setSelectedElementId(element.id)}
                  onUpdateContent={(content) => updateSlideElement(element.id, (target) => {
                    target.content = content;
                  })}
                />
              ))}
            </article>
          </section>
        </main>
      </div>
    </section>
  );
}

function ElementMetricInput({
  compact = false,
  label,
  value,
  onChange
}: {
  compact?: boolean;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className={`inline-flex h-8 items-center gap-1 rounded-md border border-[#d8dde6] bg-white px-2 text-[11px] font-bold text-muted ${compact ? "px-1.5" : ""}`}>
      {label}
      <input
        className={`${compact ? "w-9" : "w-12"} bg-transparent text-xs font-semibold tabular-nums text-ink outline-none`}
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function CmsSlideElement({
  element,
  onDelete,
  onDragStart,
  onSelect,
  onUpdateContent,
  selected
}: {
  element: SlideElementSpec;
  onDelete: () => void;
  onDragStart: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onSelect: () => void;
  onUpdateContent: (content: string) => void;
  selected: boolean;
}) {
  const textClass = {
    heading: "text-3xl font-semibold leading-[1.08] text-[#111827] xl:text-4xl",
    text: "text-[17px] font-medium leading-7 text-[#485262]",
    callout: "text-[15px] font-semibold leading-7 text-[#172033]",
    list: "text-[16px] font-medium leading-7 text-[#334155]"
  } satisfies Record<SlideElementType, string>;
  const surfaceClass = element.type === "callout"
    ? "border-l-4 border-primary bg-[#f2f4f8]"
    : "border border-transparent bg-white/72";

  return (
    <div
      className={`group absolute z-20 overflow-hidden rounded-[5px] ${surfaceClass} transition ${
        selected ? "ring-2 ring-primary/35 shadow-[0_20px_48px_-38px_rgba(15,23,42,0.8)]" : "hover:ring-1 hover:ring-primary/25"
      }`}
      style={{
        height: `${element.height}%`,
        left: `${element.x}%`,
        top: `${element.y}%`,
        width: `${element.width}%`
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <div
        className={`absolute inset-x-0 top-0 z-10 flex h-7 items-center justify-between border-b border-[#d8dde6] bg-white/92 px-1.5 transition ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
        }`}
      >
        <button
          className="inline-flex h-5 items-center gap-1 px-1.5 text-[10px] font-bold text-muted transition hover:text-primary active:cursor-grabbing"
          type="button"
          onPointerDown={onDragStart}
        >
          <Move size={11} aria-hidden="true" />
          이동
        </button>
        <button
          aria-label="슬라이드 요소 삭제"
          className="inline-flex h-5 w-5 items-center justify-center text-muted transition hover:text-danger"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
        >
          <X size={12} aria-hidden="true" />
        </button>
      </div>
      <textarea
        aria-label="슬라이드 요소 내용"
        className={`h-full w-full resize-none bg-transparent px-4 pb-3 pt-8 outline-none ${textClass[element.type]}`}
        value={element.content}
        onChange={(event) => onUpdateContent(event.target.value)}
        onPointerDown={(event) => {
          event.stopPropagation();
          onSelect();
        }}
      />
    </div>
  );
}

function CmsWorkspaceOnSlide({
  page,
  slug,
  updatePage
}: {
  page: PageSpec;
  slug: string;
  updatePage: (mutator: (page: PageSpec) => void) => void;
}) {
  const canvasBlock = page.workspace.blocks.find(isCodeCanvasBlock);
  const canvasProps = readCodeCanvasProps(canvasBlock?.props);
  const artifactSource = canvasBlock ? getArtifactSource(canvasProps) : "";

  function addCanvasBlock() {
    updatePage((next) => {
      const block = createBlock("code-canvas");
      next.workspace.layout = "focus";
      next.workspace.blocks = [block];
    });
  }

  if (!page.workspace.blocks.length) {
    return (
      <button
        className="focus-ring mt-2 max-w-[820px] border border-dashed border-[#cbd5e1] bg-white/72 px-5 py-4 text-left text-sm font-semibold text-muted transition hover:border-primary/40 hover:bg-white"
        type="button"
        onClick={addCanvasBlock}
      >
        실행 요소 추가
      </button>
    );
  }

  return (
    <section className="mt-2 max-w-[860px] border-t border-[#d8dde6] pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold text-primary">실행 영역</p>
        <div className="flex flex-wrap gap-2">
          {page.workspace.blocks.map((block) => (
            <Link
              className="focus-ring inline-flex h-8 items-center border border-[#d8dde6] bg-white px-3 text-xs font-semibold text-ink transition hover:border-primary/40 hover:bg-[#eef2ff]"
              href={`/cms/containers/${slug}/blocks/${block.id}`}
              key={block.id}
            >
              {blockTypeLabels[block.type as keyof typeof blockTypeLabels] ?? block.type}
            </Link>
          ))}
        </div>
      </div>
      {canvasBlock ? (
        <div className="mt-3 overflow-hidden border border-[#d8dde6] bg-white">
          <CodeCanvasFrame className="h-[220px]" source={artifactSource} title="실행 영역 미리보기" />
        </div>
      ) : (
        <div className="mt-3 border border-[#d8dde6] bg-white px-4 py-3 text-sm font-medium text-muted">
          이 페이지에는 {page.workspace.blocks.length}개의 실행 블록이 있습니다.
        </div>
      )}
    </section>
  );
}

function PageThumbnailDrawer({
  activePageId,
  canDelete,
  canMoveDown,
  canMoveUp,
  onClose,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
  onMovePage,
  onSelectPage,
  open,
  pages
}: {
  activePageId: string;
  canDelete: boolean;
  canMoveDown: boolean;
  canMoveUp: boolean;
  onClose: () => void;
  onAddPage: () => void;
  onDeletePage: () => void;
  onDuplicatePage: () => void;
  onMovePage: (direction: "up" | "down") => void;
  onSelectPage: (pageId: string) => void;
  open: boolean;
  pages: PagePointer[];
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="슬라이드 메뉴 닫기"
        className="absolute inset-0 bg-ink/18"
        onClick={onClose}
        type="button"
      />
      <aside className="absolute left-0 top-0 flex h-full w-[240px] flex-col border-r border-[#d8dde6] bg-[#f8fafc] shadow-elevated">
        <div className="flex items-center justify-between gap-2 border-b border-[#d8dde6] px-3 py-3">
          <div>
            <p className="text-[11px] font-bold text-primary">슬라이드</p>
            <p className="mt-0.5 text-xs font-semibold text-muted">현재 레슨</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d8dde6] bg-white text-ink transition hover:bg-[#eef2ff]"
              type="button"
              aria-label="현재 위치 뒤에 페이지 추가"
              title="슬라이드 추가"
              onClick={onAddPage}
            >
              <Plus size={15} aria-hidden="true" />
            </button>
            <button
              aria-label="슬라이드 메뉴 닫기"
              className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition hover:bg-white hover:text-ink"
              onClick={onClose}
              type="button"
            >
              <X size={17} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 border-b border-[#d8dde6] p-3">
          <button
            className="focus-ring inline-flex h-8 items-center justify-center rounded-md border border-[#d8dde6] bg-white text-ink hover:bg-[#eef2ff]"
            type="button"
            aria-label="현재 슬라이드 복제"
            title="복제"
            onClick={onDuplicatePage}
          >
            <Copy size={14} aria-hidden="true" />
          </button>
          <button
            className="focus-ring inline-flex h-8 items-center justify-center rounded-md border border-[#d8dde6] bg-white text-ink hover:bg-[#eef2ff] disabled:opacity-40"
            type="button"
            aria-label="현재 슬라이드 위로 이동"
            title="위로"
            disabled={!canMoveUp}
            onClick={() => onMovePage("up")}
          >
            <ArrowUp size={14} aria-hidden="true" />
          </button>
          <button
            className="focus-ring inline-flex h-8 items-center justify-center rounded-md border border-[#d8dde6] bg-white text-ink hover:bg-[#eef2ff] disabled:opacity-40"
            type="button"
            aria-label="현재 슬라이드 아래로 이동"
            title="아래로"
            disabled={!canMoveDown}
            onClick={() => onMovePage("down")}
          >
            <ArrowDown size={14} aria-hidden="true" />
          </button>
          <button
            className="focus-ring inline-flex h-8 items-center justify-center rounded-md border border-danger/30 bg-white text-danger hover:bg-danger/5 disabled:opacity-40"
            type="button"
            aria-label="현재 슬라이드 삭제"
            title="삭제"
            disabled={!canDelete}
            onClick={onDeletePage}
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto p-3" aria-label="슬라이드 썸네일">
          <div className="grid gap-2">
            {pages.map((item, index) => {
              const isActive = item.page.id === activePageId;
              return (
                <button
                  className={`focus-ring group border p-1.5 transition ${
                    isActive ? "border-primary bg-[#eef2ff] shadow-soft" : "border-[#d8dde6] bg-white hover:border-primary/30 hover:bg-[#f5f6f8]"
                  }`}
                  key={item.page.id}
                  type="button"
                  aria-label={`페이지 ${index + 1}: ${item.page.title}`}
                  title={item.page.title}
                  onClick={() => onSelectPage(item.page.id)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-line bg-white">
                    <span className={`absolute left-2 top-2 z-10 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                      isActive ? "bg-primary text-white" : "bg-ink/75 text-white"
                    }`}>
                      {index + 1}
                    </span>
                    <div className="grid h-full grid-cols-[46%_1fr]">
                      <div className="border-r border-line bg-white" />
                      <div className="bg-soft/80" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>
      </aside>
    </div>
  );
}

type CodeCanvasBlock = Extract<LessonWorkspaceBlock, { type: "code-canvas" }>;
type CodeCanvasProps = CodeCanvasBlock["props"];

function isCodeCanvasBlock(block: LessonWorkspaceBlock): block is CodeCanvasBlock {
  return block.type === "code-canvas";
}

function readCodeCanvasProps(value: unknown): CodeCanvasProps {
  const props = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : createDefaultProps("code-canvas");
  const kind =
    props.kind === "react" ||
    props.kind === "canvas" ||
    props.kind === "image" ||
    props.kind === "mixed"
      ? props.kind
      : "html";
  const files = readArtifactFiles(props.files);
  const entry = typeof props.entry === "string" && props.entry.trim() ? props.entry : "index.html";
  const fallbackCode = typeof props.code === "string" && props.code.trim() ? props.code : createDefaultCodeCanvasSource();
  const code = files[entry] || fallbackCode;
  const status =
    props.status === "generating" ||
    props.status === "generated" ||
    props.status === "verified" ||
    props.status === "failed"
      ? props.status
      : "draft";
  const promptHistory = readPromptHistory(props.promptHistory ?? props.history);

  return {
    kind,
    artifactId: typeof props.artifactId === "string" && props.artifactId.trim() ? props.artifactId : newId("artifact"),
    prompt: typeof props.prompt === "string" && props.prompt.trim() ? props.prompt : "오른쪽 페이지에 들어갈 실행 산출물을 자연어로 설명하세요.",
    promptHistory,
    code,
    entry,
    files: Object.keys(files).length > 0 ? { ...files, [entry]: code } : { [entry]: code },
    assets: readArtifactAssets(props.assets),
    runtime: "sandboxed-iframe",
    version: typeof props.version === "number" && Number.isFinite(props.version) ? props.version : 1,
    status,
    notes: typeof props.notes === "string" ? props.notes : undefined,
    history: readPromptHistory(props.history),
    generatedAt: typeof props.generatedAt === "string" ? props.generatedAt : undefined,
    model: typeof props.model === "string" ? props.model : undefined,
    lastError: typeof props.lastError === "string" ? props.lastError : undefined
  };
}

function readArtifactFiles(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {} as Record<string, string>;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === "string")
  );
}

function readPromptHistory(value: unknown): NonNullable<CodeCanvasProps["promptHistory"]> {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is NonNullable<CodeCanvasProps["promptHistory"]>[number] => {
      if (!item || typeof item !== "object") return false;
      const entry = item as { role?: unknown; text?: unknown; createdAt?: unknown };
      return (
        (entry.role === "user" || entry.role === "assistant") &&
        typeof entry.text === "string" &&
        typeof entry.createdAt === "string"
      );
    });
}

function readArtifactAssets(value: unknown): NonNullable<CodeCanvasProps["assets"]> {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is NonNullable<CodeCanvasProps["assets"]>[number] => {
    if (!item || typeof item !== "object") return false;
    const asset = item as { path?: unknown; mime?: unknown };
    return typeof asset.path === "string" && typeof asset.mime === "string";
  });
}

function getArtifactSource(props: CodeCanvasProps) {
  const entry = props.entry ?? "index.html";
  return props.files?.[entry] ?? props.code;
}

function duplicatePage(page: PageSpec): PageSpec {
  const copy = structuredClone(page) as PageSpec;
  copy.id = newId("page");
  copy.title = `${page.title} 복사본`;
  copy.workspace.blocks = copy.workspace.blocks.map(duplicateBlock);
  return copy;
}

function duplicateBlock(block: LessonWorkspaceBlock): LessonWorkspaceBlock {
  const copy = structuredClone(block) as EditableBlock;
  copy.id = newId(copy.type);
  if (copy.type === "block-board" && Array.isArray(copy.props.blockGroups)) {
    copy.props.blockGroups = (copy.props.blockGroups as TimelineBlockGroup[]).map((group) => ({
      ...group,
      blocks: group.blocks.map((timelineBlock) => ({ ...timelineBlock, id: newId("work") }))
    }));
  }
  return copy as LessonWorkspaceBlock;
}

function getPagePointers(spec: ContainerSpec) {
  return spec.modules.flatMap((module, moduleIndex) =>
    module.lessons.flatMap((lesson, lessonIndex) =>
      lesson.pages.map((page, pageIndex) => ({
        moduleIndex,
        lessonIndex,
        pageIndex,
        lessonId: lesson.id,
        moduleTitle: module.title,
        lessonTitle: lesson.title,
        page
      }))
    )
  );
}

export function BlockDetailEditor({ initialSpec, blockId }: { initialSpec: ContainerSpec; blockId: string }) {
  const { draft, updateDraft, save, saveState, message } = useSpecDraft(initialSpec);
  const pointer = useMemo(() => findBlock(draft, blockId), [draft, blockId]);

  if (!pointer) return <p className="mt-6 rounded-xl border border-line bg-white p-6 text-sm text-muted">블록을 찾을 수 없습니다.</p>;

  const block = pointer.block as EditableBlock;
  const page = pointer.page;
  const updateBlock = (mutator: (block: EditableBlock) => void) => {
    updateDraft((next) => {
      mutator(next.modules[pointer.moduleIndex].lessons[pointer.lessonIndex].pages[pointer.pageIndex].workspace.blocks[pointer.blockIndex] as EditableBlock);
    });
  };

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-xl border border-line bg-white p-5 shadow-soft">
        <p className="text-sm font-semibold text-primary">{page.title}</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">{block.id}</h1>
        <div className="mt-5 grid gap-4">
          <Field label="블록 id" value={block.id} onChange={(value) => updateBlock((next) => { next.id = value; })} />
          <SelectField label="블록 타입" value={block.type} options={workspaceBlockTypes} onChange={(value) => updateBlock((next) => {
            next.type = value as WorkspaceBlockType;
            next.props = createDefaultProps(next.type);
            applyDefaultBindings(next);
          })} />
          <BlockPropsEditor block={block} slug={draft.slug} updateProps={(mutator) => updateBlock((next) => { mutator(next.props); })} />
          <details className="rounded-lg border border-line bg-soft px-3 py-2">
            <summary className="cursor-pointer text-xs font-semibold text-muted">상태 키</summary>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Field label="reads.key" value={block.reads?.key ?? ""} onChange={(value) => updateBlock((next) => { value.trim() ? (next.reads = { key: value.trim() }) : delete next.reads; })} />
              <Field label="writes.key" value={block.writes?.key ?? ""} onChange={(value) => updateBlock((next) => { value.trim() ? (next.writes = { key: value.trim() }) : delete next.writes; })} />
            </div>
          </details>
        </div>
        <SaveBar state={saveState} message={message} onSave={save} />
      </section>
      <aside className="rounded-xl border border-line bg-white p-5 shadow-soft lg:sticky lg:top-4 lg:self-start">
        <p className="text-sm font-semibold text-ink">작업 위치</p>
        <p className="mt-2 text-sm leading-6 text-muted">{page.title}</p>
        <Link className="focus-ring mt-4 inline-flex h-9 items-center rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:bg-soft" href={`/cms/containers/${draft.slug}/pages/${page.id}`}>
          페이지로 돌아가기
        </Link>
        <button className="focus-ring mt-3 inline-flex h-9 items-center gap-2 rounded-lg border border-danger/30 bg-white px-3 text-xs font-semibold text-danger hover:bg-danger/5 disabled:opacity-40" type="button" disabled={page.workspace.blocks.length <= 1} onClick={() => updateDraft((next) => { next.modules[pointer.moduleIndex].lessons[pointer.lessonIndex].pages[pointer.pageIndex].workspace.blocks.splice(pointer.blockIndex, 1); })}>
          <Trash2 size={14} aria-hidden="true" />
          블록 삭제
        </button>
      </aside>
    </div>
  );
}

function BlockPropsEditor({
  block,
  slug,
  updateProps
}: {
  block: EditableBlock;
  slug: string;
  updateProps: (mutator: (props: Record<string, unknown>) => void) => void;
}) {
  const props = block.props;
  if (block.type === "code-canvas") {
    const canvasProps = readCodeCanvasProps(props);
    return (
      <div className="grid gap-4">
        <TextArea label="요청" rows={4} value={canvasProps.prompt} onChange={(value) => updateProps((next) => { next.prompt = value; })} />
        <TextArea label="코드" rows={14} value={canvasProps.code} onChange={(value) => updateProps((next) => {
          next.kind = "html";
          next.code = value;
          next.runtime = "sandboxed-iframe";
          next.version = Number(next.version ?? 1) + 1;
        })} />
      </div>
    );
  }
  if (block.type === "intro-summary") {
    return (
      <>
        <TextArea label="완료 산출물" value={linesToText(props.outputs as string[])} onChange={(value) => updateProps((next) => { next.outputs = textToLines(value); })} />
      </>
    );
  }
  if (block.type === "image-definition") {
    const image = String(props.image ?? "/assets/ax-course-dashboard-mockup.png");
    return (
      <>
        <div className="grid gap-3">
          <p className={labelClass}>이미지 첨부</p>
          <AssetPicker
            className="aspect-[16/9] rounded-lg border border-line"
            image={image}
            slug={slug}
            onChange={(value) => updateProps((next) => { next.image = value; })}
          />
        </div>
        <Field label="이미지 경로" value={image} onChange={(value) => updateProps((next) => { next.image = value; })} />
        <Field label="대체 텍스트" value={String(props.alt ?? "")} onChange={(value) => updateProps((next) => { next.alt = value; })} />
        <Field label="라벨" value={String(props.label ?? "")} onChange={(value) => updateProps((next) => { next.label = value; })} />
        <TextArea label="설명" rows={5} value={String(props.text ?? "")} onChange={(value) => updateProps((next) => { next.text = value; })} />
      </>
    );
  }
  if (block.type === "block-board") {
    const groups = Array.isArray(props.blockGroups) ? (props.blockGroups as TimelineBlockGroup[]) : [];
    return (
      <div className="grid gap-4">
        {groups.map((group, groupIndex) => (
          <section className="rounded-lg border border-line bg-soft p-4" key={`${group.title}-${groupIndex}`}>
            <div className="flex justify-between gap-3">
              <p className="text-xs font-semibold text-primary">업무 그룹 {groupIndex + 1}</p>
              <button className="text-xs font-semibold text-danger" type="button" onClick={() => updateProps((next) => { next.blockGroups = groups.filter((_, index) => index !== groupIndex); })}>삭제</button>
            </div>
            <div className="mt-3 grid gap-3">
              <Field label="그룹 제목" value={group.title} onChange={(value) => updateProps((next) => {
                const copy = [...groups];
                copy[groupIndex] = { ...group, title: value };
                next.blockGroups = copy;
              })} />
              <TextArea label="그룹 설명" value={group.description} rows={2} onChange={(value) => updateProps((next) => {
                const copy = [...groups];
                copy[groupIndex] = { ...group, description: value };
                next.blockGroups = copy;
              })} />
              {group.blocks.map((timelineBlock, blockIndex) => (
                <TimelineBlockFields
                  block={timelineBlock}
                  key={`${timelineBlock.id}-${blockIndex}`}
                  onChange={(nextTimelineBlock) => updateProps((next) => {
                    const copy = [...groups];
                    const blocks = [...group.blocks];
                    blocks[blockIndex] = nextTimelineBlock;
                    copy[groupIndex] = { ...group, blocks };
                    next.blockGroups = copy;
                  })}
                  onDelete={() => updateProps((next) => {
                    const copy = [...groups];
                    copy[groupIndex] = { ...group, blocks: group.blocks.filter((_, index) => index !== blockIndex) };
                    next.blockGroups = copy;
                  })}
                />
              ))}
              <button className="focus-ring h-8 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:bg-soft" type="button" onClick={() => updateProps((next) => {
                const copy = [...groups];
                copy[groupIndex] = { ...group, blocks: [...group.blocks, createTimelineBlock()] };
                next.blockGroups = copy;
              })}>
                업무 블럭 추가
              </button>
            </div>
          </section>
        ))}
        <button className="focus-ring h-9 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:bg-soft" type="button" onClick={() => updateProps((next) => { next.blockGroups = [...groups, { title: "업무 그룹", description: "설명", blocks: [createTimelineBlock()] }]; })}>
          그룹 추가
        </button>
      </div>
    );
  }
  if (block.type === "example-list") {
    const examples = Array.isArray(props.examples) ? (props.examples as ExampleGroup[]) : [];
    return (
      <div className="grid gap-4">
        {examples.map((group, groupIndex) => (
          <section className="rounded-lg border border-line bg-soft p-4" key={`${group.title}-${groupIndex}`}>
            <Field label="제목" value={group.title} onChange={(value) => updateProps((next) => {
              const copy = [...examples];
              copy[groupIndex] = { ...group, title: value };
              next.examples = copy;
            })} />
            <TextArea label="항목" rows={5} value={linesToText(group.items)} onChange={(value) => updateProps((next) => {
              const copy = [...examples];
              copy[groupIndex] = { ...group, items: textToLines(value) };
              next.examples = copy;
            })} />
          </section>
        ))}
        <button className="focus-ring h-9 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:bg-soft" type="button" onClick={() => updateProps((next) => { next.examples = [...examples, { title: "예시 그룹", items: ["예시"] }]; })}>
          예시 그룹 추가
        </button>
      </div>
    );
  }
  if (block.type === "quiz") {
    return (
      <>
        <TextArea label="질문" rows={3} value={String(props.question ?? "")} onChange={(value) => updateProps((next) => { next.question = value; })} />
        <TextArea label="선택지" rows={5} value={linesToText(props.options as string[])} onChange={(value) => updateProps((next) => { next.options = textToLines(value); })} />
        <Field label="정답" value={String(props.answer ?? "")} onChange={(value) => updateProps((next) => { next.answer = value || undefined; })} />
      </>
    );
  }
  if (block.type === "checklist") {
    return (
      <>
        <Field label="제목" value={String(props.title ?? "")} onChange={(value) => updateProps((next) => { next.title = value; })} />
        <TextArea label="항목" rows={6} value={linesToText(props.items as string[])} onChange={(value) => updateProps((next) => { next.items = textToLines(value); })} />
      </>
    );
  }
  if (block.type === "result-card") {
    return (
      <>
        <Field label="제목" value={String(props.title ?? "")} onChange={(value) => updateProps((next) => { next.title = value; })} />
        <TextArea label="빈 상태 문구" rows={4} value={String(props.emptyText ?? "")} onChange={(value) => updateProps((next) => { next.emptyText = value || undefined; })} />
      </>
    );
  }
  return <p className="rounded-lg border border-line bg-soft p-3 text-sm leading-6 text-muted">이 블록은 상태 흐름 중심이라 별도 props가 없습니다.</p>;
}

function TimelineBlockFields({
  block,
  onChange,
  onDelete
}: {
  block: TimelineBlock;
  onChange: (block: TimelineBlock) => void;
  onDelete: () => void;
}) {
  return (
    <section className="rounded-lg border border-line bg-white p-3">
      <div className="flex justify-between gap-3">
        <p className="text-xs font-semibold text-muted">{block.label}</p>
        <button className="text-xs font-semibold text-danger" type="button" onClick={onDelete}>삭제</button>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Field label="id" value={block.id} onChange={(value) => onChange({ ...block, id: value })} />
        <Field label="라벨" value={block.label} onChange={(value) => onChange({ ...block, label: value })} />
        <SelectField label="카테고리" value={block.category} options={categories} onChange={(value) => onChange({ ...block, category: value as TimelineBlockCategory })} />
        <Field label="AI 적용 이유" value={block.axReason} onChange={(value) => onChange({ ...block, axReason: value })} />
        <TextArea label="설명" value={block.description} rows={2} onChange={(value) => onChange({ ...block, description: value })} />
        <TextArea label="예시" value={linesToText(block.examples)} rows={3} onChange={(value) => onChange({ ...block, examples: textToLines(value) })} />
      </div>
    </section>
  );
}

function findPage(spec: ContainerSpec, pageId: string) {
  for (let moduleIndex = 0; moduleIndex < spec.modules.length; moduleIndex += 1) {
    const module = spec.modules[moduleIndex];
    for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex += 1) {
      const lesson = module.lessons[lessonIndex];
      const pageIndex = lesson.pages.findIndex((page) => page.id === pageId);
      if (pageIndex >= 0) {
        return {
          moduleIndex,
          lessonIndex,
          pageIndex,
          moduleTitle: module.title,
          lessonTitle: lesson.title,
          page: lesson.pages[pageIndex]
        };
      }
    }
  }
  return undefined;
}

function findBlock(spec: ContainerSpec, blockId: string) {
  for (let moduleIndex = 0; moduleIndex < spec.modules.length; moduleIndex += 1) {
    const module = spec.modules[moduleIndex];
    for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex += 1) {
      const lesson = module.lessons[lessonIndex];
      for (let pageIndex = 0; pageIndex < lesson.pages.length; pageIndex += 1) {
        const page = lesson.pages[pageIndex];
        const blockIndex = page.workspace.blocks.findIndex((block) => block.id === blockId);
        if (blockIndex >= 0) return { moduleIndex, lessonIndex, pageIndex, blockIndex, page, block: page.workspace.blocks[blockIndex] };
      }
    }
  }
  return undefined;
}
