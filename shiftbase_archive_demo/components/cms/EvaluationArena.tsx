"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Bot,
  Check,
  ChevronRight,
  CircleDashed,
  ClipboardList,
  Crown,
  FileText,
  FileSearch,
  Layers3,
  ListFilter,
  Loader2,
  MessageSquareText,
  Play,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  SquareStack,
  X
} from "lucide-react";
import type {
  EvaluationParticipant,
  EvaluationRun,
  EvaluationScope,
  EvaluationThread,
  EvaluationThreadSummary
} from "@/lib/backend/evaluationTypes";

type TargetOption = {
  key: string;
  level: "container" | "module" | "lesson" | "page" | "block";
  title: string;
  path: string[];
  scope: EvaluationScope;
};

type TargetLevelFilter = "all" | TargetOption["level"];
type TargetDisplay = Pick<TargetOption, "level" | "path" | "title">;

type ApiErrorShape = {
  error?: string | { message?: string };
};

type EvaluationArenaProps = {
  containerTitle: string;
  containerSlug: string;
  targetOptions: TargetOption[];
  initialParticipants: EvaluationParticipant[];
  initialThreads: EvaluationThreadSummary[];
};

const levelLabels = {
  container: "컨테이너",
  module: "모듈",
  lesson: "레슨",
  page: "페이지",
  block: "블록"
} satisfies Record<TargetOption["level"], string>;

const targetLevels = ["container", "module", "lesson", "page", "block"] as const satisfies readonly TargetOption["level"][];

const levelFilterLabels = {
  all: "전체",
  container: "컨테이너",
  module: "모듈",
  lesson: "레슨",
  page: "페이지",
  block: "블록"
} satisfies Record<TargetLevelFilter, string>;

const severityClass = {
  critical: "border-danger/30 bg-danger/10 text-danger",
  high: "border-warning/35 bg-warning/10 text-[#9a5b00]",
  medium: "border-sky-200 bg-sky-50 text-sky-700",
  low: "border-line bg-soft text-muted"
};

const statusClass = {
  completed: "border-success/25 bg-success/10 text-success",
  failed: "border-danger/25 bg-danger/10 text-danger",
  skipped: "border-line bg-soft text-muted"
};

export function EvaluationArena({
  containerTitle,
  containerSlug,
  targetOptions,
  initialParticipants,
  initialThreads
}: EvaluationArenaProps) {
  const [threads, setThreads] = useState(initialThreads);
  const [participants] = useState(initialParticipants);
  const [activeThread, setActiveThread] = useState<EvaluationThread | undefined>();
  const [selectedTargetKey, setSelectedTargetKey] = useState(targetOptions[0]?.key ?? "");
  const [selectedParticipantIds, setSelectedParticipantIds] = useState(() =>
    initialParticipants.filter((participant) => participant.enabled).slice(0, 4).map((participant) => participant.id)
  );
  const [issue, setIssue] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [error, setError] = useState("");

  const selectedTarget = useMemo(
    () => targetOptions.find((option) => option.key === selectedTargetKey) ?? targetOptions[0],
    [selectedTargetKey, targetOptions]
  );
  const headerTarget = activeThread?.scopeSnapshot ?? selectedTarget;
  const latestRun = activeThread?.runs.at(-1);
  const enabledParticipants = participants.filter((participant) => participant.enabled);
  const selectedParticipants = participants.filter((participant) => selectedParticipantIds.includes(participant.id));

  async function refreshThreads() {
    const response = await fetch(`/api/local-cms/evaluation-threads?containerSlug=${encodeURIComponent(containerSlug)}`);
    const result = await response.json().catch(() => ({})) as { threads?: EvaluationThreadSummary[] } & ApiErrorShape;
    if (!response.ok) throw new Error(readApiError(result, "스레드 목록을 불러오지 못했습니다."));
    setThreads(result.threads ?? []);
  }

  async function loadThread(threadId: string) {
    setError("");
    setIsLoadingThread(true);
    try {
      const response = await fetch(`/api/local-cms/evaluation-threads/${threadId}`);
      const result = await response.json().catch(() => ({})) as { thread?: EvaluationThread } & ApiErrorShape;
      if (!response.ok || !result.thread) throw new Error(readApiError(result, "스레드를 불러오지 못했습니다."));
      setActiveThread(result.thread);
      const targetKey = findTargetKeyForScope(targetOptions, result.thread.scope);
      if (targetKey) setSelectedTargetKey(targetKey);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "스레드를 불러오지 못했습니다.");
    } finally {
      setIsLoadingThread(false);
    }
  }

  async function runThread(threadId: string) {
    const response = await fetch(`/api/local-cms/evaluation-threads/${threadId}/runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantIds: selectedParticipantIds })
    });
    const result = await response.json().catch(() => ({})) as { thread?: EvaluationThread } & ApiErrorShape;
    if (!response.ok || !result.thread) throw new Error(readApiError(result, "평가 실행에 실패했습니다."));
    setActiveThread(result.thread);
    const targetKey = findTargetKeyForScope(targetOptions, result.thread.scope);
    if (targetKey) setSelectedTargetKey(targetKey);
    await refreshThreads();
  }

  async function createAndRun() {
    setError("");
    if (!selectedTarget) {
      setError("평가 대상을 선택하세요.");
      return;
    }
    if (!issue.trim()) {
      setError("총괄 이슈를 입력하세요.");
      return;
    }
    if (selectedParticipantIds.length === 0) {
      setError("실행할 agent를 1개 이상 선택하세요. 설정된 agent가 없다면 SHIFTBASE_EVAL_AGENTS를 먼저 설정해야 합니다.");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/local-cms/evaluation-threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          containerSlug,
          scope: selectedTarget.scope,
          issue
        })
      });
      const result = await response.json().catch(() => ({})) as { thread?: EvaluationThread } & ApiErrorShape;
      if (!response.ok || !result.thread) throw new Error(readApiError(result, "스레드 생성에 실패했습니다."));
      setActiveThread(result.thread);
      setIssue("");
      await refreshThreads();
      await runThread(result.thread.id);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "평가 실행에 실패했습니다.");
    } finally {
      setIsCreating(false);
    }
  }

  async function rerunActiveThread() {
    if (!activeThread) return;
    setError("");
    if (selectedParticipantIds.length === 0) {
      setError("실행할 agent를 1개 이상 선택하세요. 설정된 agent가 없다면 SHIFTBASE_EVAL_AGENTS를 먼저 설정해야 합니다.");
      return;
    }
    setIsCreating(true);
    try {
      await runThread(activeThread.id);
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "평가 실행에 실패했습니다.");
    } finally {
      setIsCreating(false);
    }
  }

  function toggleParticipant(participantId: string) {
    setSelectedParticipantIds((current) => {
      if (current.includes(participantId)) return current.filter((id) => id !== participantId);
      if (current.length >= 4) return current;
      return [...current, participantId];
    });
  }

  function selectTarget(targetKey: string) {
    setSelectedTargetKey(targetKey);
    setActiveThread(undefined);
    setError("");
  }

  return (
    <section className="overflow-hidden rounded-lg border border-line bg-white shadow-[0_22px_50px_-30px_rgba(15,23,42,0.35)]">
      <div className="grid min-h-[calc(100dvh-148px)] lg:grid-cols-[320px_minmax(0,1fr)_380px]">
        <aside className="border-b border-line bg-[#fbfcfe] lg:border-b-0 lg:border-r">
          <div className="border-b border-line px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Evaluation Arena</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink">{containerTitle}</h1>
          </div>
          <div className="grid min-w-0 gap-4 px-4 py-4">
            <TargetPicker
              options={targetOptions}
              selectedKey={selectedTargetKey}
              onChange={selectTarget}
            />
            <ParticipantPicker
              participants={participants}
              selectedIds={selectedParticipantIds}
              onToggle={toggleParticipant}
            />
          </div>
          <div className="border-t border-line px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Threads</p>
              <span className="rounded-md border border-line bg-white px-2 py-0.5 text-[11px] font-semibold text-muted">{threads.length}</span>
            </div>
            <ThreadList
              activeThreadId={activeThread?.id}
              threads={threads}
              isLoading={isLoadingThread}
              onSelect={loadThread}
            />
          </div>
        </aside>

        <div className="flex min-h-[720px] flex-col bg-white">
          <div className="border-b border-line px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-line bg-soft px-2 text-xs font-semibold text-muted">
                    <Layers3 size={13} aria-hidden="true" />
                    {headerTarget ? levelLabels[headerTarget.level] : "Target"}
                  </span>
                  <span className="text-xs font-semibold text-muted">{headerTarget ? formatTargetPath(headerTarget) : ""}</span>
                </div>
                <h2 className="mt-2 truncate text-2xl font-semibold tracking-tight text-ink">
                  {activeThread?.title ?? "새 평가 세션"}
                </h2>
              </div>
              <button
                type="button"
                className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink transition hover:bg-soft active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
                disabled={!activeThread || isCreating}
                onClick={rerunActiveThread}
              >
                <RefreshCw size={14} aria-hidden="true" />
                다시 평가
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {activeThread ? (
              <MessageTimeline thread={activeThread} latestRun={latestRun} />
            ) : isLoadingThread ? (
              <TimelineSkeleton />
            ) : (
              <EmptyConversation enabledCount={enabledParticipants.length} configuredCount={participants.length} />
            )}
          </div>

          <div className="border-t border-line bg-[#fbfcfe] px-5 py-4">
            {error ? (
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-sm font-semibold text-danger">
                <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            ) : null}
            <label className="block">
              <span className="text-xs font-semibold text-muted">총괄 이슈</span>
              <textarea
                className="mt-2 min-h-[116px] w-full resize-y rounded-lg border border-line bg-white px-4 py-3 text-sm leading-6 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder="예: 이 블록이 유료 컨테이너 수준의 실습 가치를 만들고 있는지 평가해줘."
                value={issue}
                onChange={(event) => setIssue(event.target.value)}
              />
            </label>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
                <span>{selectedParticipants.length}개 참가자 선택</span>
                <span className="h-1 w-1 rounded-full bg-line" />
                <span>{selectedTarget?.title ?? "대상 없음"}</span>
              </div>
              <button
                type="button"
                className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white transition hover:bg-slate-700 active:scale-[0.98] disabled:cursor-wait disabled:opacity-50"
                disabled={isCreating}
                onClick={createAndRun}
              >
                {isCreating ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
                {isCreating ? "평가 중" : "토론 시작"}
              </button>
            </div>
          </div>
        </div>

        <aside className="border-t border-line bg-[#fbfcfe] lg:border-l lg:border-t-0">
          <SynthesisPanel thread={activeThread} latestRun={latestRun} />
        </aside>
      </div>
    </section>
  );
}

function TargetPicker({
  options,
  selectedKey,
  onChange
}: {
  options: TargetOption[];
  selectedKey: string;
  onChange: (key: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<TargetLevelFilter>("all");
  const selectedOption = useMemo(
    () => options.find((option) => option.key === selectedKey) ?? options[0],
    [options, selectedKey]
  );
  const levelCounts = useMemo(() => {
    const counts = {
      all: options.length,
      container: 0,
      module: 0,
      lesson: 0,
      page: 0,
      block: 0
    } satisfies Record<TargetLevelFilter, number>;

    options.forEach((option) => {
      counts[option.level] += 1;
    });

    return counts;
  }, [options]);
  const normalizedQuery = normalizeForSearch(query);
  const filteredOptions = useMemo(
    () => options.filter((option) => {
      const matchesLevel = levelFilter === "all" || option.level === levelFilter;
      const matchesQuery = normalizedQuery.length === 0 || getTargetSearchText(option).includes(normalizedQuery);
      return matchesLevel && matchesQuery;
    }),
    [levelFilter, normalizedQuery, options]
  );

  return (
    <section className="min-w-0 rounded-lg border border-line bg-white p-3" aria-labelledby="evaluation-target-heading">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p id="evaluation-target-heading" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            평가 대상
          </p>
          <p className="mt-1 text-xs font-medium text-muted">{options.length}개 범위에서 선택</p>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-soft text-muted">
          <ListFilter size={15} aria-hidden="true" />
        </span>
      </div>

      {selectedOption ? (
        <div className="mt-3 rounded-lg border border-slate-200 bg-[#f8fafc] p-3">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-white">
              <TargetLevelIcon level={selectedOption.level} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-line bg-white px-2 py-0.5 text-[11px] font-semibold text-muted">
                  {levelLabels[selectedOption.level]}
                </span>
                <span className="text-[11px] font-semibold text-success">현재 선택</span>
              </div>
              <p className="mt-1 truncate text-sm font-semibold text-ink">{selectedOption.title}</p>
              <p className="mt-1 truncate text-xs font-medium text-muted">{formatTargetPath(selectedOption)}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-lg border border-dashed border-line bg-[#fbfcfe] px-3 py-5 text-sm font-medium text-muted">
          불러온 평가 대상이 없습니다.
        </div>
      )}

      <div className="mt-3">
        <label className="sr-only" htmlFor="evaluation-target-search">대상 검색</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} aria-hidden="true" />
          <input
            id="evaluation-target-search"
            className="h-10 w-full rounded-lg border border-line bg-white px-9 text-sm font-medium text-ink outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/15"
            type="search"
            placeholder="제목, 경로, 레벨 검색"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query ? (
            <button
              type="button"
              className="focus-ring absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted transition hover:bg-soft hover:text-ink active:scale-[0.96]"
              aria-label="검색어 지우기"
              onClick={() => setQuery("")}
            >
              <X size={14} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex max-w-full gap-1 overflow-x-auto pb-1" aria-label="대상 레벨 필터">
        {(["all", ...targetLevels] as TargetLevelFilter[]).map((level) => {
          const active = levelFilter === level;
          return (
            <button
              key={level}
              type="button"
              className={`focus-ring inline-flex h-8 shrink-0 items-center gap-1 rounded-md border px-2 text-[11px] font-semibold transition active:scale-[0.98] ${
                active ? "border-slate-700 bg-ink text-white" : "border-line bg-white text-muted hover:border-slate-300 hover:text-ink"
              }`}
              aria-pressed={active}
              onClick={() => setLevelFilter(level)}
            >
              <span>{levelFilterLabels[level]}</span>
              <span className={`rounded px-1 ${active ? "bg-white/15 text-white" : "bg-soft text-muted"}`}>{levelCounts[level]}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 max-h-[360px] overflow-x-hidden overflow-y-auto pr-1" aria-label="평가 대상 목록">
        {filteredOptions.length > 0 ? (
          <ul className="grid min-w-0 gap-1.5">
            {filteredOptions.map((option) => {
              const selected = option.key === selectedOption?.key;
              return (
                <li className="min-w-0" key={option.key}>
                  <button
                    type="button"
                    aria-current={selected ? "true" : undefined}
                    className={`focus-ring group w-full max-w-full overflow-hidden rounded-lg border px-3 py-3 text-left transition active:scale-[0.99] ${
                      selected ? "border-slate-400 bg-slate-50 shadow-soft" : "border-transparent bg-white hover:border-line hover:bg-[#fbfcfe]"
                    }`}
                    onClick={() => onChange(option.key)}
                  >
                    <span className="flex min-w-0 items-start gap-3">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        selected ? "bg-ink text-white" : "bg-soft text-muted"
                      }`}>
                        <TargetLevelIcon level={option.level} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="shrink-0 rounded-md border border-line bg-white px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                            {levelLabels[option.level]}
                          </span>
                          <span className="min-w-0 truncate text-sm font-semibold text-ink">{option.title}</span>
                        </span>
                        <span className="mt-1 block truncate text-xs font-medium text-muted">{formatTargetPath(option)}</span>
                      </span>
                      {selected ? (
                        <Check size={15} className="mt-1 shrink-0 text-success" aria-hidden="true" />
                      ) : (
                        <ChevronRight size={15} className="mt-1 shrink-0 text-muted transition group-hover:translate-x-0.5" aria-hidden="true" />
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-lg border border-dashed border-line bg-[#fbfcfe] px-3 py-6 text-center">
            <p className="text-sm font-semibold text-ink">검색 결과 없음</p>
            <p className="mt-1 text-xs leading-5 text-muted">검색어를 지우거나 레벨 필터를 바꾸세요.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function TargetLevelIcon({ level }: { level: TargetOption["level"] }) {
  const Icon = level === "container"
    ? Layers3
    : level === "module"
      ? SquareStack
      : level === "lesson"
        ? BookOpen
        : level === "page"
          ? FileText
          : ClipboardList;
  return <Icon size={15} aria-hidden="true" />;
}

function ParticipantPicker({
  participants,
  selectedIds,
  onToggle
}: {
  participants: EvaluationParticipant[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Participants</p>
        <span className="rounded-md border border-line bg-white px-2 py-0.5 text-[11px] font-semibold text-muted">max 4</span>
      </div>
      <div className="mt-2 grid gap-2">
        {participants.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line bg-white px-4 py-6 text-sm leading-6 text-muted">
            설정된 agent가 없습니다. `SHIFTBASE_EVAL_AGENTS`에 실제 provider, model, persona, rubric을 명시해야 합니다.
          </div>
        ) : null}
        {participants.map((participant) => {
          const checked = selectedIds.includes(participant.id);
          return (
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 transition ${
                participant.enabled ? "border-line bg-white hover:border-slate-300" : "border-line bg-soft opacity-70"
              }`}
              key={participant.id}
            >
              <input
                className="mt-1 h-4 w-4 accent-slate-900"
                type="checkbox"
                checked={checked}
                disabled={!participant.enabled}
                onChange={() => onToggle(participant.id)}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink">{participant.label}</span>
                <span className="mt-0.5 block truncate text-[11px] font-medium text-muted">{participant.model}</span>
                {!participant.enabled ? (
                  <span className="mt-1 block text-[11px] font-semibold text-danger">{participant.unavailableReason}</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function ThreadList({
  threads,
  activeThreadId,
  isLoading,
  onSelect
}: {
  threads: EvaluationThreadSummary[];
  activeThreadId?: string;
  isLoading: boolean;
  onSelect: (threadId: string) => void;
}) {
  if (threads.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-white px-4 py-8 text-center">
        <MessageSquareText className="mx-auto text-muted" size={22} aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold text-ink">아직 스레드가 없습니다</p>
        <p className="mt-1 text-xs leading-5 text-muted">이슈를 입력하면 첫 평가 기록이 생성됩니다.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {threads.map((thread) => (
        <button
          className={`focus-ring group rounded-lg border px-3 py-3 text-left transition active:scale-[0.99] ${
            activeThreadId === thread.id ? "border-slate-400 bg-white shadow-soft" : "border-line bg-white hover:border-slate-300"
          }`}
          key={thread.id}
          type="button"
          disabled={isLoading}
          onClick={() => onSelect(thread.id)}
        >
          <span className="flex items-start justify-between gap-2">
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-ink">{thread.title}</span>
              <span className="mt-1 block truncate text-xs font-medium text-muted">{thread.scopePath.slice(1).join(" / ") || thread.scopeTitle}</span>
            </span>
            <ChevronRight size={15} className="mt-0.5 shrink-0 text-muted transition group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
          <span className="mt-3 flex items-center justify-between gap-2 text-[11px] font-semibold text-muted">
            <span>{formatTime(thread.updatedAt)}</span>
            <RunStatusBadge status={thread.lastStatus} />
          </span>
        </button>
      ))}
    </div>
  );
}

function MessageTimeline({ thread, latestRun }: { thread: EvaluationThread; latestRun?: EvaluationRun }) {
  const latestResults = latestRun?.participantResults ?? [];
  return (
    <div className="mx-auto grid max-w-4xl gap-5">
      {thread.messages.map((message) => (
        <article className={`flex gap-3 ${message.role === "chief" ? "justify-end" : ""}`} key={message.id}>
          {message.role !== "chief" ? <MessageAvatar role={message.role} status={message.status} /> : null}
          <div className={`max-w-[78%] rounded-lg border px-4 py-3 ${
            message.role === "chief"
              ? "border-slate-700 bg-ink text-white"
              : message.status === "failed"
                ? "border-danger/20 bg-danger/5 text-ink"
                : "border-line bg-[#fbfcfe] text-ink"
          }`}>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className={`text-xs font-semibold ${message.role === "chief" ? "text-white/80" : "text-muted"}`}>{message.authorName}</span>
              {message.status ? <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${statusClass[message.status]}`}>{message.status}</span> : null}
              <span className={`text-[10px] font-semibold ${message.role === "chief" ? "text-white/50" : "text-muted"}`}>{formatTime(message.createdAt)}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
          </div>
          {message.role === "chief" ? <MessageAvatar role={message.role} status={message.status} /> : null}
        </article>
      ))}

      {latestRun?.status === "running" ? <TimelineSkeleton /> : null}

      {latestResults.length > 0 ? (
        <section className="mt-2 border-t border-line pt-5">
          <div className="mb-3 flex items-center gap-2">
            <ClipboardList size={16} className="text-muted" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-ink">참가자별 상세 결과</h3>
          </div>
          <div className="grid gap-3">
            {latestResults.map((result) => (
              <div className="rounded-lg border border-line bg-white p-4" key={`${latestRun?.id ?? "run"}-${result.participantId}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-ink">{result.participantId}</p>
                    <p className="mt-0.5 text-xs font-medium text-muted">{result.provider} · {result.model}</p>
                  </div>
                  <span className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${statusClass[result.status]}`}>{result.status}</span>
                </div>
                {result.result ? (
                  <div className="mt-3 grid gap-2">
                    <p className="text-sm leading-6 text-muted">{result.result.summary}</p>
                    <div className="flex flex-wrap gap-2">
                      {result.result.findings.slice(0, 3).map((finding) => (
                        <span className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${severityClass[finding.severity]}`} key={`${result.participantId}-${finding.title}`}>
                          {finding.severity} · {finding.title}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm font-medium text-danger">{result.error}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SynthesisPanel({ thread, latestRun }: { thread?: EvaluationThread; latestRun?: EvaluationRun }) {
  const synthesis = latestRun?.synthesis;
  const actions = synthesis?.nextActions ?? [];

  return (
    <div className="grid gap-5 px-5 py-5">
      <section>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Synthesis</p>
          <RunStatusBadge status={latestRun?.status} />
        </div>
        {synthesis ? (
          <div className="mt-3 rounded-lg border border-line bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-white">
                <Sparkles size={16} aria-hidden="true" />
              </span>
              <p className="text-sm leading-6 text-ink">{synthesis.summary}</p>
            </div>
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-line bg-white px-4 py-8 text-center">
            <SquareStack className="mx-auto text-muted" size={22} aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-ink">{thread ? "아직 종합 결과가 없습니다" : "세션을 선택하세요"}</p>
            <p className="mt-1 text-xs leading-5 text-muted">평가 run이 완료되면 공통 이슈와 개선안이 정리됩니다.</p>
          </div>
        )}
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Next Actions</p>
        <div className="mt-3 grid gap-2">
          {actions.length > 0 ? actions.map((action) => (
            <article className="rounded-lg border border-line bg-white p-3" key={`${action.priority}-${action.title}`}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold leading-5 text-ink">{action.title}</h3>
                <span className="shrink-0 rounded-md border border-line bg-soft px-2 py-1 text-[11px] font-bold text-ink">{action.priority}</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted">{action.detail}</p>
            </article>
          )) : (
            <div className="rounded-lg border border-dashed border-line bg-white px-4 py-7 text-center text-sm font-medium text-muted">
              개선안 대기 중
            </div>
          )}
        </div>
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Run Health</p>
        <div className="mt-3 grid gap-2">
          {(latestRun?.participantResults ?? []).map((result) => (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-white px-3 py-2" key={result.participantId}>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-ink">{result.participantId}</p>
                <p className="mt-0.5 text-[11px] font-medium text-muted">
                  {result.usage?.totalTokens ? `${result.usage.totalTokens} tokens` : result.model}
                </p>
              </div>
              <span className={`shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold ${statusClass[result.status]}`}>{result.status}</span>
            </div>
          ))}
          {!latestRun ? (
            <div className="rounded-lg border border-dashed border-line bg-white px-4 py-7 text-center text-sm font-medium text-muted">
              실행 기록 없음
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function MessageAvatar({ role, status }: { role: "chief" | "participant" | "synthesizer" | "system"; status?: "completed" | "failed" | "skipped" }) {
  const className = status === "failed"
    ? "bg-danger/10 text-danger"
    : role === "chief"
      ? "bg-ink text-white"
      : role === "synthesizer"
        ? "bg-success/10 text-success"
        : "bg-soft text-muted";
  const Icon = role === "chief" ? Crown : role === "participant" ? Bot : role === "synthesizer" ? Sparkles : ShieldAlert;
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${className}`}>
      <Icon size={16} aria-hidden="true" />
    </span>
  );
}

function EmptyConversation({ enabledCount, configuredCount }: { enabledCount: number; configuredCount: number }) {
  const needsConfig = configuredCount === 0;
  return (
    <div className="mx-auto grid min-h-[520px] max-w-xl place-items-center">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg border border-line bg-[#fbfcfe] text-muted">
          <FileSearch size={24} aria-hidden="true" />
        </span>
        <h3 className="mt-5 text-xl font-semibold tracking-tight text-ink">{needsConfig ? "agent 설정 필요" : "평가 대기 중"}</h3>
        <p className="mt-2 text-sm leading-6 text-muted">
          {needsConfig
            ? "런타임 기본 agent는 만들지 않습니다. 실제 사용할 모델만 SHIFTBASE_EVAL_AGENTS에 등록하세요."
            : `선택된 참가자 ${enabledCount}개가 준비되어 있습니다. 대상과 이슈를 고정하면 평가 스레드가 생성됩니다.`}
        </p>
      </div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="mx-auto grid max-w-4xl gap-5">
      {[0, 1, 2].map((index) => (
        <div className="flex gap-3" key={index}>
          <div className="h-9 w-9 rounded-lg bg-slate-100" />
          <div className="w-full rounded-lg border border-line bg-white p-4">
            <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
            <div className="mt-4 h-3 w-full animate-pulse rounded bg-slate-100" />
            <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RunStatusBadge({ status }: { status?: EvaluationRun["status"] }) {
  if (!status) return <span className="rounded-md border border-line bg-soft px-2 py-1 text-[11px] font-semibold text-muted">not run</span>;
  const icon = status === "running" ? <CircleDashed size={12} className="animate-spin" aria-hidden="true" /> : status === "failed" ? <AlertCircle size={12} aria-hidden="true" /> : <Check size={12} aria-hidden="true" />;
  const className = status === "completed"
    ? "border-success/25 bg-success/10 text-success"
    : status === "partial"
      ? "border-warning/30 bg-warning/10 text-[#9a5b00]"
      : status === "failed"
        ? "border-danger/25 bg-danger/10 text-danger"
        : "border-line bg-soft text-muted";
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold ${className}`}>
      {icon}
      {status}
    </span>
  );
}

function normalizeForSearch(value: string) {
  return value.toLocaleLowerCase("ko-KR").replace(/\s+/g, " ").trim();
}

function getTargetSearchText(option: TargetOption) {
  return normalizeForSearch([
    levelLabels[option.level],
    option.title,
    ...option.path
  ].join(" "));
}

function findTargetKeyForScope(options: TargetOption[], scope: EvaluationScope) {
  return options.find((option) => isSameEvaluationScope(option.scope, scope))?.key;
}

function isSameEvaluationScope(left: EvaluationScope, right: EvaluationScope) {
  return left.containerSlug === right.containerSlug
    && (left.moduleId ?? "") === (right.moduleId ?? "")
    && (left.lessonId ?? "") === (right.lessonId ?? "")
    && (left.pageId ?? "") === (right.pageId ?? "")
    && (left.blockId ?? "") === (right.blockId ?? "");
}

function formatTargetPath(option: TargetDisplay) {
  return option.path.filter(Boolean).join(" / ") || option.title;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function readApiError(result: ApiErrorShape, fallback: string) {
  if (typeof result.error === "string") return result.error;
  if (result.error?.message) return result.error.message;
  return fallback;
}
