import { badRequest } from "@/lib/backend/errors";
import { containerService } from "@/lib/backend/containerService";
import { LocalEvaluationThreadRepository } from "@/lib/backend/evaluationRepository";
import { resolveEvaluationScope } from "@/lib/backend/evaluationScope";
import {
  getEvaluationParticipantCatalog,
  getEvaluationProviderInvokers
} from "@/lib/backend/evaluationProviders";
import type { ContainerSpec } from "@/lib/containerSpec";
import type {
  EvaluationConfidence,
  EvaluationFinding,
  EvaluationImprovementProposal,
  EvaluationParticipant,
  EvaluationParticipantRunResult,
  EvaluationProviderId,
  EvaluationProviderInvoker,
  EvaluationResult,
  EvaluationRun,
  EvaluationRunStatus,
  EvaluationScope,
  EvaluationSynthesis,
  EvaluationThread
} from "@/lib/backend/evaluationTypes";

type EvaluationServiceOptions = {
  repository?: LocalEvaluationThreadRepository;
  providerInvokers?: Partial<Record<EvaluationProviderId, EvaluationProviderInvoker>>;
  participants?: EvaluationParticipant[];
  readContainer?: (slug: string) => Promise<ContainerSpec>;
};

type CreateThreadInput = {
  containerSlug: string;
  scope: EvaluationScope;
  issue: string;
};

type RunThreadInput = {
  threadId: string;
  participantIds?: string[];
};

const maxIssueLength = 6000;
const maxParticipantsPerRun = 4;
const participantTimeoutMs = 60000;

let repository: LocalEvaluationThreadRepository | undefined;

function getRepository() {
  repository ??= new LocalEvaluationThreadRepository();
  return repository;
}

function nowIso() {
  return new Date().toISOString();
}

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function clip(value: string, limit: number) {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit - 40)}...`;
}

function titleFromIssue(issue: string) {
  const normalized = issue.replace(/\s+/g, " ").trim();
  return clip(normalized, 72) || "새 평가 이슈";
}

function readJsonObject(text: string) {
  const raw = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  const jsonText = start >= 0 && end >= start ? raw.slice(start, end + 1) : raw;
  return JSON.parse(jsonText) as unknown;
}

function requireString(value: unknown, path: string) {
  if (typeof value !== "string" || !value.trim()) throw badRequest(`${path} must be a non-empty string.`);
  return value.trim();
}

function severityValue(value: unknown): EvaluationFinding["severity"] {
  return value === "critical" || value === "high" || value === "medium" || value === "low" ? value : "medium";
}

function priorityValue(value: unknown): EvaluationImprovementProposal["priority"] {
  return value === "P0" || value === "P1" || value === "P2" ? value : "P1";
}

function confidenceValue(value: unknown): EvaluationConfidence {
  return value === "low" || value === "medium" || value === "high" ? value : "medium";
}

function effortValue(value: unknown): EvaluationImprovementProposal["effort"] {
  return value === "small" || value === "medium" || value === "large" ? value : undefined;
}

function normalizeFindings(value: unknown): EvaluationFinding[] {
  if (!Array.isArray(value)) throw badRequest("evaluation findings must be an array.");
  return value.slice(0, 8).map((item) => {
    const record = typeof item === "object" && item !== null ? item as Record<string, unknown> : {};
    return {
      severity: severityValue(record.severity),
      title: requireString(record.title, "finding.title"),
      evidence: requireString(record.evidence, "finding.evidence"),
      recommendation: requireString(record.recommendation, "finding.recommendation")
    };
  });
}

function normalizeProposals(value: unknown): EvaluationImprovementProposal[] {
  if (!Array.isArray(value)) throw badRequest("evaluation improvementProposals must be an array.");
  return value.slice(0, 8).map((item) => {
    const record = typeof item === "object" && item !== null ? item as Record<string, unknown> : {};
    return {
      priority: priorityValue(record.priority),
      title: requireString(record.title, "improvementProposal.title"),
      detail: requireString(record.detail, "improvementProposal.detail"),
      effort: effortValue(record.effort)
    };
  });
}

function normalizeRisks(value: unknown): string[] {
  if (!Array.isArray(value)) throw badRequest("evaluation risks must be an array.");
  return value.slice(0, 8).map((item) => String(item).trim()).filter(Boolean);
}

export function parseEvaluationResult(text: string): EvaluationResult {
  const parsed = readJsonObject(text);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw badRequest("evaluation response must be a JSON object.");
  }
  const record = parsed as Record<string, unknown>;
  if (typeof record.score !== "number" || !Number.isFinite(record.score)) {
    throw badRequest("evaluation score must be a number.");
  }
  const findings = normalizeFindings(record.findings);
  const proposals = normalizeProposals(record.improvementProposals);
  return {
    score: Math.max(0, Math.min(100, Math.round(record.score))),
    summary: requireString(record.summary, "evaluation.summary"),
    findings,
    risks: normalizeRisks(record.risks),
    improvementProposals: proposals,
    confidence: confidenceValue(record.confidence)
  };
}

function createEvaluationPrompt(thread: EvaluationThread, participant: EvaluationParticipant) {
  return JSON.stringify(
    {
      issue: thread.issue,
      evaluationScope: {
        level: thread.scopeSnapshot.level,
        path: thread.scopeSnapshot.path,
        title: thread.scopeSnapshot.title,
        metrics: thread.scopeSnapshot.metrics
      },
      targetSnapshot: thread.scopeSnapshot.promptContext,
      participant: {
        label: participant.label,
        persona: participant.persona,
        rubric: participant.rubric
      },
      instructions: [
        "이 이슈에 대해 독립적으로 평가하세요.",
        "다른 모델이 무엇을 말할지 추측하지 말고, 제공된 스냅샷의 근거를 사용하세요.",
        "상용급 제품으로 만들기 위해 막아야 할 점과 바로 고칠 수 있는 개선안을 분리하세요."
      ]
    },
    null,
    2
  );
}

function synthesizeRun(results: EvaluationParticipantRunResult[]): EvaluationSynthesis {
  const completed = results.filter((result) => result.status === "completed" && result.result);
  const failed = results.filter((result) => result.status !== "completed");
  const findings = completed.flatMap((result) => result.result?.findings ?? []);
  const proposals = completed.flatMap((result) => result.result?.improvementProposals ?? []);
  const highFindings = findings.filter((finding) => finding.severity === "critical" || finding.severity === "high");
  const sortedActions = [...proposals].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority)).slice(0, 8);

  return {
    summary: completed.length > 0
      ? `${completed.length}개 참가자가 응답했고 ${failed.length}개 참가자가 실패/건너뜀 상태입니다. 우선순위 높은 발견은 ${highFindings.length}개입니다.`
      : `모든 참가자가 실패/건너뜀 상태입니다. SHIFTBASE_EVAL_AGENTS와 provider API 키 설정을 확인해야 합니다.`,
    consensus: highFindings.slice(0, 5).map((finding) => `${finding.title}: ${finding.recommendation}`),
    disagreements: failed.map((result) => `${result.participantId}: ${result.error ?? "응답 없음"}`),
    nextActions: sortedActions
  };
}

function priorityRank(priority: EvaluationImprovementProposal["priority"]) {
  if (priority === "P0") return 0;
  if (priority === "P1") return 1;
  return 2;
}

function runStatus(results: EvaluationParticipantRunResult[]): EvaluationRunStatus {
  const completed = results.filter((result) => result.status === "completed").length;
  if (completed === results.length && results.length > 0) return "completed";
  if (completed > 0) return "partial";
  return "failed";
}

async function invokeParticipant(
  container: ContainerSpec,
  thread: EvaluationThread,
  participant: EvaluationParticipant,
  invokers: Record<EvaluationProviderId, EvaluationProviderInvoker>
): Promise<EvaluationParticipantRunResult> {
  const startedAt = nowIso();
  if (!participant.enabled) {
    return {
      participantId: participant.id,
      provider: participant.provider,
      model: participant.model,
      status: "skipped",
      startedAt,
      completedAt: nowIso(),
      error: participant.unavailableReason ?? "Participant is disabled."
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), participantTimeoutMs);
  try {
    const response = await invokers[participant.provider]({
      thread,
      participant,
      container,
      prompt: createEvaluationPrompt(thread, participant),
      signal: controller.signal
    });
    return {
      participantId: participant.id,
      provider: participant.provider,
      model: participant.model,
      status: "completed",
      startedAt,
      completedAt: nowIso(),
      result: parseEvaluationResult(response.text),
      usage: response.usage
    };
  } catch (error) {
    return {
      participantId: participant.id,
      provider: participant.provider,
      model: participant.model,
      status: "failed",
      startedAt,
      completedAt: nowIso(),
      error: error instanceof Error ? error.message : "Evaluation provider failed."
    };
  } finally {
    clearTimeout(timer);
  }
}

export function createEvaluationService(options: EvaluationServiceOptions = {}) {
  const repo = options.repository ?? getRepository();
  const invokers = getEvaluationProviderInvokers(options.providerInvokers);
  const readContainer = options.readContainer ?? ((slug: string) => containerService.readContainer(slug));
  const readParticipants = () => options.participants ?? getEvaluationParticipantCatalog();

  return {
    get participantCatalog() {
      return readParticipants();
    },

    async listThreads(containerSlug?: string) {
      return repo.list(containerSlug);
    },

    async readThread(threadId: string) {
      return repo.read(threadId);
    },

    async createThread(input: CreateThreadInput) {
      const issue = input.issue.trim();
      if (!issue) throw badRequest("issue is required.");
      if (issue.length > maxIssueLength) throw badRequest(`issue must be ${maxIssueLength} characters or less.`);

      const container = await readContainer(input.containerSlug);
      const scopeSnapshot = resolveEvaluationScope(container, input.scope);
      const createdAt = nowIso();
      const participants = readParticipants();

      return repo.create({
        containerSlug: container.slug,
        title: titleFromIssue(issue),
        issue,
        scope: scopeSnapshot.scope,
        scopeSnapshot,
        participants,
        messages: [
          {
            id: newId("msg"),
            role: "chief",
            authorName: "총괄",
            content: issue,
            createdAt
          }
        ],
        runs: [],
        createdAt,
        updatedAt: createdAt
      });
    },

    async runThread(input: RunThreadInput) {
      const thread = await repo.read(input.threadId);
      const container = await readContainer(thread.containerSlug);
      const currentParticipants = readParticipants();
      const selectedIds = input.participantIds && input.participantIds.length > 0
        ? input.participantIds
        : currentParticipants.filter((participant) => participant.enabled).map((participant) => participant.id);
      const uniqueIds = Array.from(new Set(selectedIds)).slice(0, maxParticipantsPerRun);
      if (uniqueIds.length === 0) throw badRequest("At least one participant is required.");

      const participants = uniqueIds.map((participantId) => {
        const participant = currentParticipants.find((candidate) => candidate.id === participantId);
        if (!participant) throw badRequest(`Unknown current participant: ${participantId}. Check SHIFTBASE_EVAL_AGENTS.`);
        return participant;
      });

      const startedAt = nowIso();
      thread.participants = currentParticipants;
      const run: EvaluationRun = {
        id: newId("run"),
        status: "running",
        participantIds: uniqueIds,
        startedAt,
        participantResults: []
      };

      thread.runs.push(run);
      thread.messages.push({
        id: newId("msg"),
        role: "system",
        authorName: "Arena",
        content: `${participants.length}개 참가자 평가를 시작했습니다.`,
        createdAt: startedAt
      });
      thread.updatedAt = startedAt;
      await repo.update(thread);

      const participantResults = await Promise.all(
        participants.map((participant) => invokeParticipant(container, thread, participant, invokers))
      );
      const completedAt = nowIso();
      const synthesis = synthesizeRun(participantResults);
      const finalStatus = runStatus(participantResults);
      const stored = await repo.read(thread.id);
      stored.participants = currentParticipants;
      const storedRun = stored.runs.find((candidate) => candidate.id === run.id);
      if (!storedRun) throw badRequest(`Evaluation run missing after write: ${run.id}.`);

      storedRun.status = finalStatus;
      storedRun.completedAt = completedAt;
      storedRun.participantResults = participantResults;
      storedRun.synthesis = synthesis;
      stored.messages.push(
        ...participantResults.map((result) => ({
          id: newId("msg"),
          role: "participant" as const,
          authorName: readParticipantLabel(stored.participants, result.participantId),
          participantId: result.participantId,
          content: result.status === "completed"
            ? result.result?.summary ?? "평가가 완료됐습니다."
            : result.error ?? "평가를 완료하지 못했습니다.",
          createdAt: result.completedAt,
          status: result.status
        })),
        {
          id: newId("msg"),
          role: "synthesizer",
          authorName: "종합자",
          content: synthesis.summary,
          createdAt: completedAt
        }
      );
      stored.updatedAt = completedAt;
      await repo.update(stored);

      return stored;
    }
  };
}

function readParticipantLabel(participants: EvaluationParticipant[], participantId: string) {
  return participants.find((participant) => participant.id === participantId)?.label ?? participantId;
}

export const evaluationService = createEvaluationService();
