"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  FileCheck2,
  Menu,
  MessageCircle,
  Monitor,
  PencilLine,
  Send,
  Sparkles,
  X
} from "lucide-react";
import { MarkdownContent } from "@/components/MarkdownContent";
import { Workspace } from "@/components/lesson/workspace/Workspace";
import {
  readTimelineState,
  type BlockBoardBlock,
  type CandidateSelectBlock,
  type LessonState
} from "@/components/lesson/workspace/types";
import type {
  InteractiveLesson,
  LessonPage,
  SlideElementSpec,
  SlideElementType,
  TimelineBlock
} from "@/lib/containerSpec";

type StoredLessonSession = {
  currentIndex?: number;
  lessonState?: LessonState;
  updatedAt?: string;
};

type PlayerCallbacks = {
  onAddBlock: (block: BlockBoardBlock, timelineBlock: TimelineBlock) => void;
  onRemoveBlock: (block: BlockBoardBlock, instanceId: string) => void;
  onReset: (block: BlockBoardBlock) => void;
  onSelectCandidate: (block: CandidateSelectBlock, instanceId: string) => void;
};

type PreviewMode = {
  cmsHref: string;
  reviewHref?: string;
  status: string;
};

type SlideContent = {
  bodyMarkdown: string;
  callout?: string;
};

type ViewportSize = {
  height: number;
  width: number;
};

const MIN_LEARNING_VIEWPORT: ViewportSize = {
  height: 800,
  width: 1280
};

function getReadingMarkdown(reading: LessonPage["left"]) {
  if (typeof reading.bodyMarkdown === "string" && reading.bodyMarkdown.trim()) return reading.bodyMarkdown;
  return reading.paragraphs.join("\n\n");
}

function getPageDescription(page: LessonPage) {
  return getReadingMarkdown(page.left)
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .find((block) => !block.startsWith(">") && !/^#{1,6}\s/.test(block))
    ?.replace(/[`*_>#-]/g, "")
    .trim() ?? "";
}

function getSlideContent(page: LessonPage): SlideContent {
  const blocks = getReadingMarkdown(page.left)
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .filter((block) => !/^#{1,6}\s/.test(block));
  const quote = blocks.find((block) => block.startsWith(">"))?.replace(/^>\s?/gm, "");
  const bodyBlocks = blocks.filter((block) => !block.startsWith(">")).slice(0, 1);

  return {
    bodyMarkdown: bodyBlocks.length > 0 ? bodyBlocks.join("\n\n") : getReadingMarkdown(page.left),
    callout: quote ?? page.left.checkpoints?.[0]
  };
}

function isSupportedViewport(viewport: ViewportSize) {
  return viewport.width >= MIN_LEARNING_VIEWPORT.width && viewport.height >= MIN_LEARNING_VIEWPORT.height;
}

function useViewportSize() {
  const [viewport, setViewport] = useState<ViewportSize | null>(null);

  useEffect(() => {
    function updateViewport() {
      setViewport({
        height: window.innerHeight,
        width: window.innerWidth
      });
    }

    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.visualViewport?.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
      window.visualViewport?.removeEventListener("resize", updateViewport);
    };
  }, []);

  return viewport;
}

function ViewportWarning({
  lesson,
  viewport
}: {
  lesson: InteractiveLesson;
  viewport: ViewportSize;
}) {
  return (
    <main className="min-h-[calc(100dvh-64px)] bg-[#eef0f4] px-6 py-10">
      <section className="mx-auto grid min-h-[520px] max-w-[880px] content-center">
        <div className="border border-[#d8dde6] bg-white px-8 py-8 shadow-[0_24px_70px_-58px_rgba(15,23,42,0.6)]">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#eef2ff] text-primary">
              <Monitor size={21} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary">{lesson.courseTitle}</p>
              <h1 className="mt-2 text-2xl font-semibold leading-tight text-ink">데스크톱 학습 화면입니다</h1>
              <p className="mt-4 text-sm leading-6 text-muted">
                학습 화면은 1280x800 환경부터 지원합니다.
              </p>
              <div className="mt-5 grid gap-2 text-sm font-semibold text-ink sm:grid-cols-2">
                <div className="border border-[#d8dde6] bg-[#fbfbfa] px-4 py-3">
                  현재 화면: {viewport.width} x {viewport.height}
                </div>
                <div className="border border-[#d8dde6] bg-[#fbfbfa] px-4 py-3">
                  최소 기준: {MIN_LEARNING_VIEWPORT.width} x {MIN_LEARNING_VIEWPORT.height}
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  className="focus-ring inline-flex h-10 items-center rounded-md border border-[#d8dde6] bg-white px-4 text-sm font-bold text-muted transition hover:bg-[#f5f6f8] hover:text-ink"
                  href={`/learning/${lesson.courseSlug}`}
                >
                  코스 정보로 돌아가기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ShiftTopBar({
  currentIndex,
  lesson,
  onNext,
  onOpenMenu,
  onPrev,
  preview,
  total
}: {
  currentIndex: number;
  lesson: InteractiveLesson;
  onNext: () => void;
  onOpenMenu: () => void;
  onPrev: () => void;
  preview?: PreviewMode;
  total: number;
}) {
  const progress = Math.round(((currentIndex + 1) / total) * 100);
  const currentPage = lesson.pages[currentIndex];

  return (
    <div className="sticky top-16 z-30 border-b border-[#d8dde6] bg-white/94 backdrop-blur supports-[backdrop-filter]:bg-white/82">
      <div className="flex min-h-12 items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            className="focus-ring hidden shrink-0 items-center gap-1 rounded-md text-xs font-bold text-muted transition hover:text-ink sm:inline-flex"
            href={preview?.cmsHref ?? `/learning/${lesson.courseSlug}`}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            {preview ? "CMS" : "나가기"}
          </Link>
            <span className="hidden h-4 w-px bg-[#d8dde6] sm:block" aria-hidden="true" />
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-sm font-semibold text-ink">{lesson.courseTitle}</p>
              {preview ? (
                <span className="hidden shrink-0 rounded-md border border-primary/25 bg-[#eef2ff] px-2 py-0.5 text-[11px] font-bold text-primary md:inline-flex">
                  프리뷰 · {preview.status}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 shrink-0 items-center gap-3">
          {preview ? (
            <div className="hidden items-center gap-1 xl:flex">
              <Link
                className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-md border border-[#d8dde6] bg-white px-2.5 text-xs font-semibold text-ink transition hover:bg-[#f5f6f8] active:translate-y-px"
                href={preview.cmsHref}
              >
                <PencilLine size={13} aria-hidden="true" />
                편집
              </Link>
              {preview.reviewHref ? (
                <Link
                  className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-md border border-[#d8dde6] bg-white px-2.5 text-xs font-semibold text-ink transition hover:bg-[#f5f6f8] active:translate-y-px"
                  href={preview.reviewHref}
                >
                  <FileCheck2 size={13} aria-hidden="true" />
                  검수
                </Link>
              ) : null}
            </div>
          ) : null}
          <p className="hidden max-w-[440px] truncate text-xs font-medium text-muted lg:block">{currentPage.title}</p>
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

function TableOfContentsDrawer({
  currentIndex,
  lesson,
  onClose,
  onSelect,
  open
}: {
  currentIndex: number;
  lesson: InteractiveLesson;
  onClose: () => void;
  onSelect: (index: number) => void;
  open: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="메뉴 닫기"
        className="absolute inset-0 bg-ink/24"
        onClick={onClose}
        type="button"
      />
      <aside className="absolute right-0 top-0 flex h-full w-[min(380px,calc(100vw-28px))] flex-col border-l border-[#d8dde6] bg-white shadow-elevated">
        <div className="flex items-center justify-between gap-3 border-b border-[#d8dde6] px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-primary">메뉴</p>
            <h2 className="mt-1 truncate text-base font-semibold text-ink">{lesson.title}</h2>
          </div>
          <button
            aria-label="메뉴 닫기"
            className="focus-ring rounded-md p-2 text-muted transition hover:bg-[#f5f6f8] hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3" aria-label="코스 메뉴">
          <div className="grid gap-1.5">
            {lesson.pages.map((page, index) => (
              <button
                className={`focus-ring border px-3 py-2.5 text-left transition active:translate-y-px ${
                  currentIndex === index
                    ? "border-[#6b63ff] bg-[#eef2ff]"
                    : "border-[#d8dde6] bg-white hover:border-primary/30 hover:bg-[#f5f6f8]"
                }`}
                key={page.id}
                onClick={() => {
                  onSelect(index);
                  onClose();
                }}
                type="button"
              >
                <p className="text-[11px] font-semibold text-primary">{String(index + 1).padStart(2, "0")}</p>
                <p className="mt-0.5 text-sm font-medium leading-5 text-ink">{page.title}</p>
              </button>
            ))}
          </div>
        </nav>
      </aside>
    </div>
  );
}

function UtilityPanel({
  currentIndex,
  lesson,
  page,
  total
}: {
  currentIndex: number;
  lesson: InteractiveLesson;
  page: LessonPage;
  total: number;
}) {
  const [coachInput, setCoachInput] = useState("");
  const [coachOpen, setCoachOpen] = useState(false);
  const pageDescription = getPageDescription(page);

  useEffect(() => {
    setCoachInput("");
    setCoachOpen(false);
  }, [page.id]);

  return (
    <aside className="min-w-0 overflow-hidden border-r border-[#d8dde6] bg-[#fbfbfa]">
      <div className="flex h-full min-h-0 flex-col">
        <div className="border-b border-[#d8dde6] px-5 py-5 lg:px-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="min-w-0 text-xl font-semibold leading-tight text-ink">{lesson.title}</h1>
            <p className="shrink-0 pt-1 text-xs font-bold tabular-nums text-primary">
              {String(currentIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </p>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-5 py-5 lg:px-6">
          <section className="shrink-0">
            <h2 className="text-lg font-semibold leading-tight text-ink">{page.left.title}</h2>
            {pageDescription ? (
              <p className="mt-3 text-sm leading-6 text-muted">{pageDescription}</p>
            ) : null}
          </section>

          <section className="mt-5 flex min-h-0 flex-1 flex-col border-t border-[#d8dde6] pt-5">
            <div className={`shift-coach-surface ${coachOpen ? "is-open" : ""}`}>
              <button
                aria-label={coachOpen ? "AI 코치 입력 닫기" : "AI 코치에게 질문하기"}
                className="shift-coach-surface__trigger focus-ring"
                type="button"
                onClick={() => setCoachOpen((open) => !open)}
              >
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
              </button>

              <div
                className={`shift-coach-surface__composer ${coachOpen ? "is-open" : ""}`}
                aria-hidden={!coachOpen}
              >
                <label className="sr-only" htmlFor="shift-player-ai-coach">AI 코치에게 질문</label>
                <div className="flex items-center gap-2 rounded-full border border-[#d8dde6] bg-white px-3 py-2 shadow-[0_22px_54px_-42px_rgba(15,23,42,0.72)] transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                  <input
                    id="shift-player-ai-coach"
                    className="min-w-0 flex-1 bg-transparent px-1 text-sm font-medium text-ink outline-none placeholder:text-muted/70"
                    placeholder="AI 코치에게 물어보기"
                    value={coachInput}
                    disabled={!coachOpen}
                    onChange={(event) => setCoachInput(event.target.value)}
                  />
                  <button
                    aria-label="보내기"
                    className="focus-ring inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40 active:translate-y-px"
                    disabled={!coachInput.trim()}
                    type="button"
                  >
                    <Send size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </aside>
  );
}

function SlideElementLayer({ elements }: { elements: SlideElementSpec[] }) {
  const textClass = {
    heading: "text-3xl font-semibold leading-[1.08] text-[#111827] xl:text-4xl",
    text: "text-[17px] font-medium leading-7 text-[#485262]",
    callout: "text-[15px] font-semibold leading-7 text-[#172033]",
    list: "text-[16px] font-medium leading-7 text-[#334155]"
  } satisfies Record<SlideElementType, string>;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {elements.map((element) => (
        <div
          className={`absolute overflow-hidden rounded-[5px] ${
            element.type === "callout" ? "border-l-4 border-primary bg-[#f2f4f8]" : "bg-white/72"
          }`}
          key={element.id}
          style={{
            height: `${element.height}%`,
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: `${element.width}%`
          }}
        >
          {element.type === "list" ? (
            <ul className={`h-full list-disc whitespace-pre-wrap px-7 py-3 ${textClass[element.type]}`}>
              {element.content.split("\n").filter(Boolean).map((item, index) => (
                <li key={`${element.id}-item-${index}`}>{item}</li>
              ))}
            </ul>
          ) : (
            <div className={`h-full whitespace-pre-wrap px-4 py-3 ${textClass[element.type]}`}>
              {element.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SlidePlayer({
  callbacks,
  lessonState,
  page
}: {
  callbacks: PlayerCallbacks;
  lessonState: LessonState;
  page: LessonPage;
}) {
  const slide = getSlideContent(page);

  return (
    <section className="flex min-h-full items-center justify-center bg-[#eef0f4] px-[clamp(20px,2.6vw,44px)] py-[clamp(20px,3vh,36px)]">
      <article
        className="relative grid aspect-video overflow-hidden rounded-[7px] border border-[#d8dde6] bg-[#fbfbfa] shadow-[0_28px_70px_-56px_rgba(15,23,42,0.62)]"
        style={{ width: "min(100%, calc((100dvh - 184px) * 16 / 9))" }}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-primary" aria-hidden="true" />
        <div className="min-h-0 overflow-y-auto px-9 py-8 xl:px-12 xl:py-10 2xl:px-16 2xl:py-12">
          <div className="grid min-h-0 content-center gap-5 xl:gap-6 2xl:gap-7">
            <h2 className="max-w-[980px] text-4xl font-semibold leading-[1.06] text-[#111827] xl:text-5xl 2xl:text-6xl">
              {page.left.title}
            </h2>
            <MarkdownContent
              className="max-w-[860px] text-[17px] leading-8 text-[#485262] xl:text-[19px] 2xl:text-[20px]"
              markdown={slide.bodyMarkdown}
            />
            {slide.callout ? (
              <MarkdownContent
                className="max-w-[820px] border-l-4 border-primary bg-[#f2f4f8] px-5 py-4 text-[15px] font-semibold leading-7 text-[#172033]"
                markdown={slide.callout}
              />
            ) : null}
          </div>
          <div className="mt-8 border-t border-[#d8dde6] pt-7">
            <Workspace
              page={page}
              lessonState={lessonState}
              onAddBlock={callbacks.onAddBlock}
              onRemoveBlock={callbacks.onRemoveBlock}
              onReset={callbacks.onReset}
              onSelectCandidate={callbacks.onSelectCandidate}
            />
          </div>
        </div>
        {page.slideElements?.length ? <SlideElementLayer elements={page.slideElements} /> : null}
      </article>
    </section>
  );
}

export function ShiftPlayer({
  lesson,
  preview,
  storageNamespace = "lesson-session"
}: {
  lesson: InteractiveLesson;
  preview?: PreviewMode;
  storageNamespace?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lessonState, setLessonState] = useState<LessonState>({});
  const viewport = useViewportSize();
  const page = lesson.pages[currentIndex];
  const total = lesson.pages.length;
  const storageKey = `shiftbase:${storageNamespace}:${lesson.courseSlug}:${lesson.lessonSlug}`;

  useEffect(() => {
    try {
      const rawSession = window.localStorage.getItem(storageKey);
      if (!rawSession) return;

      const session = JSON.parse(rawSession) as StoredLessonSession;
      if (session.lessonState && typeof session.lessonState === "object") {
        setLessonState(session.lessonState);
      }
      if (typeof session.currentIndex === "number") {
        setCurrentIndex(Math.min(total - 1, Math.max(0, session.currentIndex)));
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey, total]);

  useEffect(() => {
    const session: StoredLessonSession = {
      currentIndex,
      lessonState,
      updatedAt: new Date().toISOString()
    };
    window.localStorage.setItem(storageKey, JSON.stringify(session));
  }, [currentIndex, lessonState, storageKey]);

  function writeState(key: string | undefined, value: unknown) {
    if (!key) return;
    setLessonState((current) => ({
      ...current,
      [key]: value
    }));
  }

  function addBlock(block: BlockBoardBlock, timelineBlock: TimelineBlock) {
    const key = block.writes?.key;
    if (!key) return;

    setLessonState((current) => {
      const timeline = readTimelineState(current, key);
      return {
        ...current,
        [key]: [
          ...timeline,
          {
            ...timelineBlock,
            instanceId: `${timelineBlock.id}-${Date.now()}-${timeline.length}`
          }
        ]
      };
    });
  }

  function removeBlock(block: BlockBoardBlock, instanceId: string) {
    const key = block.writes?.key;
    if (!key) return;

    setLessonState((current) => {
      const timeline = readTimelineState(current, key);
      return Object.fromEntries(
        Object.entries({
          ...current,
          [key]: timeline.filter((item) => item.instanceId !== instanceId)
        }).map(([stateKey, value]) => [stateKey, value === instanceId ? "" : value])
      );
    });
  }

  function resetTimeline(block: BlockBoardBlock) {
    const key = block.writes?.key;
    if (!key) return;

    setLessonState((current) => {
      const timelineIds = new Set(readTimelineState(current, key).map((item) => item.instanceId));
      return Object.fromEntries(
        Object.entries({
          ...current,
          [key]: []
        }).map(([stateKey, value]) => [
          stateKey,
          typeof value === "string" && timelineIds.has(value) ? "" : value
        ])
      );
    });
  }

  function selectCandidate(block: CandidateSelectBlock, instanceId: string) {
    writeState(block.writes?.key, instanceId);
  }

  const callbacks: PlayerCallbacks = {
    onAddBlock: addBlock,
    onRemoveBlock: removeBlock,
    onReset: resetTimeline,
    onSelectCandidate: selectCandidate
  };
  const goPrev = () => setCurrentIndex((index) => Math.max(0, index - 1));
  const goNext = () => setCurrentIndex((index) => Math.min(total - 1, index + 1));

  if (!viewport) {
    return <main className="min-h-[calc(100dvh-64px)] bg-[#eef0f4]" />;
  }

  if (!isSupportedViewport(viewport)) {
    return (
      <ViewportWarning
        lesson={lesson}
        viewport={viewport}
      />
    );
  }

  return (
    <div className="min-w-[1280px]">
      <ShiftTopBar
        lesson={lesson}
        currentIndex={currentIndex}
        onNext={goNext}
        total={total}
        onOpenMenu={() => setMenuOpen(true)}
        onPrev={goPrev}
        preview={preview}
      />
      <TableOfContentsDrawer
        currentIndex={currentIndex}
        lesson={lesson}
        onClose={() => setMenuOpen(false)}
        onSelect={setCurrentIndex}
        open={menuOpen}
      />
      <main className="h-[calc(100dvh-112px)] overflow-hidden bg-[#eceff3]">
        <div className="grid h-full grid-cols-[minmax(320px,30%)_minmax(0,1fr)]">
          <UtilityPanel
            currentIndex={currentIndex}
            lesson={lesson}
            page={page}
            total={total}
          />
          <div className="min-h-0 min-w-0 overflow-y-auto">
            <SlidePlayer
              callbacks={callbacks}
              lessonState={lessonState}
              page={page}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
