"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, MessageCircle } from "lucide-react";
import { DemoBubbleGuide, syncDemoAnchorHighlight } from "@/components/demo/DemoBubbleGuide";
import {
  ChatPromptWorkspace,
  DEFAULT_PROMPT,
  FinalEmailWorkspace,
  MotivationWorkspace,
  ResponseReviewWorkspace
} from "@/components/demo/DemoSampleWorkspaces";
import type { DemoBubbleAnchor, DemoPage, DemoSampleSpec } from "@/lib/demo/sampleDemoTypes";

type DemoSamplePlayerProps = {
  spec: DemoSampleSpec;
};

function DemoLeftPanel({ page }: { page: DemoPage }) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-[#d8dde6] bg-white">
      <div className="border-b border-[#e2e8f0] px-6 py-5">
        <p className="text-[11px] font-bold tracking-[0.04em] text-primary">
          {page.left.eyebrow ?? `Step ${page.step}`}
        </p>
        <h1 className="mt-2 text-xl font-semibold leading-8 text-[#111827]">{page.left.title}</h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <div className="space-y-4 text-sm leading-7 text-[#475569]">
          {page.left.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
        {page.left.bullets?.length ? (
          <ul className="mt-5 list-disc space-y-3 border-t border-[#e2e8f0] pt-5 pl-5 text-sm leading-6 text-[#334155]">
            {page.left.bullets.map((bullet) => (
              <li key={bullet.slice(0, 24)}>{bullet}</li>
            ))}
          </ul>
        ) : null}
        {page.left.link ? (
          <div className="mt-6 border-t border-[#e2e8f0] pt-5">
            <p className="text-xs font-semibold text-muted">추가 안내</p>
            <a
              className="focus-ring mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
              href={page.left.link.href}
              rel="noopener noreferrer"
              target="_blank"
            >
              {page.left.link.label}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        ) : null}
        {page.left.footnote ? (
          <p className="mt-6 rounded-xl bg-[#f8fafc] px-4 py-3 text-xs leading-5 text-muted">{page.left.footnote}</p>
        ) : null}
      </div>
    </aside>
  );
}

function DemoTopBar({
  currentIndex,
  isLastPage,
  onNext,
  onPrev,
  onReplayGuide,
  specTitle,
  pageTitle,
  total
}: {
  currentIndex: number;
  isLastPage: boolean;
  onNext: () => void;
  onPrev: () => void;
  onReplayGuide: () => void;
  specTitle: string;
  pageTitle: string;
  total: number;
}) {
  const progress = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="sticky top-16 z-30 border-b border-[#d8dde6] bg-white/94 backdrop-blur supports-[backdrop-filter]:bg-white/82">
      <div className="flex min-h-12 items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{specTitle}</p>
          <p className="truncate text-xs font-medium text-muted">{pageTitle}</p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-md border border-[#d8dde6] bg-white px-3 text-xs font-semibold text-ink transition hover:bg-[#f5f6f8] active:translate-y-px"
            onClick={onReplayGuide}
            type="button"
          >
            <MessageCircle size={15} aria-hidden="true" />
            <span className="hidden sm:inline">다시 설명 보기</span>
            <span className="sm:hidden">안내</span>
          </button>

          <div className="flex w-[132px] items-center gap-2 sm:w-[220px]">
            <span className="text-xs font-bold tabular-nums text-muted">
              {currentIndex + 1}/{total}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e8ebf0]">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
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
              disabled={isLastPage}
              onClick={onNext}
              type="button"
            >
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DemoSamplePlayer({ spec }: DemoSamplePlayerProps) {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [bubbleIndex, setBubbleIndex] = useState(0);
  const [guideReplayToken, setGuideReplayToken] = useState(0);
  const [attachedIds, setAttachedIds] = useState<string[]>([]);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [attachExplorerOpen, setAttachExplorerOpen] = useState(false);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [sent, setSent] = useState(false);
  const [showImproved, setShowImproved] = useState(false);

  const page = spec.pages[pageIndex];
  const bubble = page.bubbles[bubbleIndex];
  const bubblesComplete = bubbleIndex >= page.bubbles.length;
  const isLastPage = pageIndex >= spec.pages.length - 1;

  useEffect(() => {
    syncDemoAnchorHighlight(workspaceRef.current, bubblesComplete ? null : bubble?.anchor ?? null);
  }, [bubble?.anchor, bubblesComplete, pageIndex, bubbleIndex]);

  useEffect(() => {
    setBubbleIndex(0);
    setGuideReplayToken(0);
    setSent(false);
    setShowImproved(false);
    setAttachedIds([]);
    setAttachMenuOpen(false);
    setAttachExplorerOpen(false);
    setPrompt(DEFAULT_PROMPT);
  }, [pageIndex]);

  function handleGuideStepComplete(anchor: DemoBubbleAnchor) {
    if (bubblesComplete || bubble?.anchor !== anchor || bubble.advanceOn !== "click") {
      return;
    }
    handleBubbleNext();
  }

  function handleBubbleNext() {
    const isLastBubble = bubbleIndex >= page.bubbles.length - 1;

    if (!isLastBubble) {
      setBubbleIndex((index) => index + 1);
      return;
    }

    if (page.kind === "prompt" && !sent) {
      setSent(true);
    }
    if (page.kind === "review") {
      setShowImproved(true);
    }

    if (!isLastPage) {
      setPageIndex((index) => index + 1);
      return;
    }

    setBubbleIndex(page.bubbles.length);
  }

  function handleSend() {
    setSent(true);
  }

  function handleReplayGuide() {
    setBubbleIndex(0);
    setGuideReplayToken((token) => token + 1);
    setAttachMenuOpen(false);
    setAttachExplorerOpen(false);
    setAttachedIds([]);
  }

  function goPrev() {
    setPageIndex((index) => Math.max(0, index - 1));
  }

  function goNext() {
    setPageIndex((index) => Math.min(spec.pages.length - 1, index + 1));
  }

  function renderWorkspace() {
    switch (page.kind) {
      case "motivation":
        return <MotivationWorkspace />;
      case "prompt":
        return (
          <ChatPromptWorkspace
            activeGuideAnchor={bubblesComplete ? null : bubble?.anchor ?? null}
            attachedIds={attachedIds}
            attachExplorerOpen={attachExplorerOpen}
            attachMenuOpen={attachMenuOpen}
            onAttach={(id) => setAttachedIds((current) => [...new Set([...current, id])])}
            onAttachExplorerOpenChange={setAttachExplorerOpen}
            onAttachMenuOpenChange={setAttachMenuOpen}
            onDetach={(id) => setAttachedIds((current) => current.filter((item) => item !== id))}
            onGuideStepComplete={handleGuideStepComplete}
            onPromptChange={setPrompt}
            onSend={handleSend}
            prompt={prompt}
            sent={sent}
          />
        );
      case "review":
        return <ResponseReviewWorkspace onShowImproved={() => setShowImproved(true)} showImproved={showImproved} />;
      case "final":
        return <FinalEmailWorkspace />;
      default:
        return null;
    }
  }

  return (
    <div className="min-w-[1280px]">
      <DemoTopBar
        currentIndex={pageIndex}
        isLastPage={isLastPage}
        onNext={goNext}
        onPrev={goPrev}
        onReplayGuide={handleReplayGuide}
        specTitle={spec.title}
        pageTitle={page.title}
        total={spec.pages.length}
      />

      <main className="h-[calc(100dvh-112px)] overflow-hidden bg-[#eceff3]">
        <div className="grid h-full grid-cols-[minmax(320px,30%)_minmax(0,1fr)]">
          <DemoLeftPanel page={page} />
          <div className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white" ref={workspaceRef}>
            {renderWorkspace()}
            {!bubblesComplete && bubble ? (
              <DemoBubbleGuide
                key={`${pageIndex}-${guideReplayToken}-${bubble.id}`}
                anchor={bubble.anchor}
                bubble={bubble}
                bubbleIndex={bubbleIndex}
                bubbleTotal={page.bubbles.length}
                lastButtonLabel={isLastPage ? "안내 완료" : "다음 페이지"}
                onNext={handleBubbleNext}
                rootRef={workspaceRef}
              />
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
