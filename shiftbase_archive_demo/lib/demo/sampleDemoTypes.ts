export type DemoBubbleAnchor =
  | "motivation-card"
  | "motivation-flow"
  | "motivation-ai"
  | "attach-button"
  | "attach-menu-files"
  | "file-explorer"
  | "attached-files"
  | "prompt-input"
  | "send-button"
  | "ai-response"
  | "highlight-risk-1"
  | "highlight-risk-2"
  | "org-context-prompt"
  | "final-guide"
  | "final-email";

export type DemoBubble = {
  id: string;
  anchor: DemoBubbleAnchor;
  text: string;
  /** "click"이면 강조 영역 클릭으로 진행, 기본값은 "button" */
  advanceOn?: "button" | "click";
};

export type DemoLeftPanel = {
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  footnote?: string;
  link?: {
    href: string;
    label: string;
  };
};

export type DemoPageKind = "motivation" | "prompt" | "review" | "final";

export type DemoPage = {
  id: string;
  step: number;
  title: string;
  kind: DemoPageKind;
  left: DemoLeftPanel;
  bubbles: DemoBubble[];
};

export type DemoSampleSpec = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  pages: DemoPage[];
};
