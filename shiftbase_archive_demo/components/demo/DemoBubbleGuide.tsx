"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { DemoBubble, DemoBubbleAnchor } from "@/lib/demo/sampleDemoTypes";

type DemoBubbleGuideProps = {
  anchor: DemoBubbleAnchor;
  bubble: DemoBubble;
  bubbleIndex: number;
  bubbleTotal: number;
  lastButtonLabel?: string;
  onNext: () => void;
  rootRef: React.RefObject<HTMLElement | null>;
};

type BubbleLayout = {
  left: number;
  tailLeft: number;
  top: number;
  placement: "below" | "above" | "center";
};

function parseInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong className="font-semibold text-[#111827]" key={index}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function getScrollableAncestors(element: HTMLElement, root: HTMLElement) {
  const ancestors: HTMLElement[] = [];
  let node: HTMLElement | null = element.parentElement;

  while (node && root.contains(node)) {
    const { overflow, overflowY } = window.getComputedStyle(node);
    if (["auto", "scroll", "overlay"].includes(overflowY) || ["auto", "scroll", "overlay"].includes(overflow)) {
      ancestors.push(node);
    }
    node = node.parentElement;
  }

  return ancestors;
}

function isElementVisibleInRoot(target: HTMLElement, root: HTMLElement, padding = 80) {
  const rootRect = root.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  return (
    targetRect.top >= rootRect.top + padding &&
    targetRect.bottom <= rootRect.bottom - padding
  );
}

function computeBubbleLayout(
  root: HTMLElement,
  target: HTMLElement,
  bubbleEl: HTMLElement
): BubbleLayout {
  const rootRect = root.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const bubbleRect = bubbleEl.getBoundingClientRect();
  const gap = 16;
  const padding = 16;
  const placementMode = target.dataset.demoPlacement;

  if (placementMode === "center") {
    let left = targetRect.left - rootRect.left + (targetRect.width - bubbleRect.width) / 2;
    let top = targetRect.top - rootRect.top + (targetRect.height - bubbleRect.height) / 2;
    left = Math.max(padding, Math.min(left, rootRect.width - bubbleRect.width - padding));
    top = Math.max(padding, Math.min(top, rootRect.height - bubbleRect.height - padding));

    return {
      left,
      top,
      tailLeft: bubbleRect.width / 2,
      placement: "center"
    };
  }

  const targetCenterX = targetRect.left - rootRect.left + targetRect.width / 2;
  let left = targetCenterX - bubbleRect.width / 2;
  left = Math.max(padding, Math.min(left, rootRect.width - bubbleRect.width - padding));

  const tailLeft = Math.max(20, Math.min(bubbleRect.width - 20, targetCenterX - left));

  let top = targetRect.bottom - rootRect.top + gap;
  let placement: BubbleLayout["placement"] = "below";

  if (top + bubbleRect.height > rootRect.height - padding) {
    top = targetRect.top - rootRect.top - bubbleRect.height - gap;
    placement = "above";
  }

  top = Math.max(padding, Math.min(top, rootRect.height - bubbleRect.height - padding));

  return { left, tailLeft, top, placement };
}

export function DemoBubbleGuide({
  anchor,
  bubble,
  bubbleIndex,
  bubbleTotal,
  lastButtonLabel = "안내 완료",
  onNext,
  rootRef
}: DemoBubbleGuideProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<BubbleLayout | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const bubbleEl = bubbleRef.current;
    if (!root || !bubbleEl) {
      setLayout(null);
      return;
    }

    const target = root.querySelector<HTMLElement>(`[data-demo-anchor="${anchor}"]`);
    if (!target) {
      setLayout(null);
      return;
    }

    const updateLayout = () => {
      const currentTarget = root.querySelector<HTMLElement>(`[data-demo-anchor="${anchor}"]`);
      const currentBubble = bubbleRef.current;
      if (!currentTarget || !currentBubble) {
        setLayout(null);
        return;
      }
      setLayout(computeBubbleLayout(root, currentTarget, currentBubble));
    };

    if (target.dataset.demoPlacement !== "center" && !isElementVisibleInRoot(target, root)) {
      target.scrollIntoView({ block: "center", behavior: "auto" });
    }

    updateLayout();

    const scrollParents = getScrollableAncestors(target, root);
    scrollParents.forEach((element) => element.addEventListener("scroll", updateLayout, { passive: true }));
    window.addEventListener("resize", updateLayout);

    const resizeObserver = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(updateLayout)
      : null;

    resizeObserver?.observe(target);
    resizeObserver?.observe(bubbleEl);

    return () => {
      scrollParents.forEach((element) => element.removeEventListener("scroll", updateLayout));
      window.removeEventListener("resize", updateLayout);
      resizeObserver?.disconnect();
    };
  }, [anchor, bubble.id, rootRef]);

  const isLast = bubbleIndex >= bubbleTotal - 1;
  const placement = layout?.placement ?? "below";

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-[55] bg-[#0f172a]/12" aria-hidden="true" />
      <div
        ref={bubbleRef}
        className="absolute z-[60] w-[min(100%,340px)] rounded-2xl border-2 border-primary/20 bg-white p-4 shadow-[0_28px_64px_-28px_rgba(79,70,229,0.55)]"
        style={
          layout
            ? { left: layout.left, top: layout.top, visibility: "visible" }
            : { left: 24, top: 24, visibility: "hidden" }
        }
      >
        <div
          className={`absolute h-4 w-4 rotate-45 border-primary/20 bg-white ${
            placement === "below"
              ? "-top-2 border-l-2 border-t-2"
              : placement === "above"
                ? "-bottom-2 border-b-2 border-r-2"
                : "hidden"
          }`}
          style={{ left: layout ? layout.tailLeft - 8 : 24 }}
          aria-hidden="true"
        />
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef2ff] px-2.5 py-1 text-[11px] font-bold text-primary">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
              {bubbleIndex + 1}
            </span>
            안내 {bubbleIndex + 1}/{bubbleTotal}
          </span>
        </div>
        <p className="text-sm leading-6 text-[#334155]">{parseInlineMarkdown(bubble.text)}</p>
        {bubble.advanceOn === "click" ? (
          <p className="mt-4 rounded-xl bg-[#eef2ff] px-3 py-2.5 text-center text-xs font-semibold text-primary">
            강조된 영역을 클릭해 진행하세요
          </p>
        ) : (
          <button
            className="focus-ring mt-4 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
            onClick={onNext}
            type="button"
          >
            {isLast ? lastButtonLabel : "다음"}
          </button>
        )}
      </div>
    </>
  );
}

export function syncDemoAnchorHighlight(root: HTMLElement | null, anchor: DemoBubbleAnchor | null) {
  if (!root) return;
  root.querySelectorAll("[data-demo-anchor]").forEach((element) => {
    element.classList.remove("demo-anchor-active");
  });
  if (!anchor) return;
  const target = root.querySelector(`[data-demo-anchor="${anchor}"]`);
  if (!target || target.hasAttribute("data-demo-skip-highlight")) return;
  target.classList.add("demo-anchor-active");
}
