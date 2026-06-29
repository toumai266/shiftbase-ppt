import type { LessonWorkspaceBlock, TimelineBlock } from "@/lib/containerSpec";

export type TimelineItem = TimelineBlock & {
  instanceId: string;
};

export type LessonState = Record<string, unknown>;

export type BlockBoardBlock = Extract<LessonWorkspaceBlock, { type: "block-board" }>;
export type CandidateSelectBlock = Extract<LessonWorkspaceBlock, { type: "candidate-select" }>;

export const categoryLabel = {
  input: "입력",
  organize: "정리",
  judge: "판단"
} satisfies Record<TimelineBlock["category"], string>;

export const categoryTone = {
  input: "border-sky-200 bg-sky-50 text-sky-700",
  organize: "border-emerald-200 bg-emerald-50 text-emerald-700",
  judge: "border-amber-200 bg-amber-50 text-amber-700"
} satisfies Record<TimelineBlock["category"], string>;

export function readTimelineState(state: LessonState, key?: string): TimelineItem[] {
  if (!key) return [];
  const value = state[key];
  return Array.isArray(value) ? (value as TimelineItem[]) : [];
}

export function readStringState(state: LessonState, key?: string): string {
  if (!key) return "";
  const value = state[key];
  return typeof value === "string" ? value : "";
}
