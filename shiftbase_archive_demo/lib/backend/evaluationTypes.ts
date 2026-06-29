import type { ContainerSpec, LessonWorkspaceBlock } from "@/lib/containerSpec";

export type EvaluationProviderId = "openai" | "anthropic" | "gemini" | "openrouter" | "nvidia";
export type EvaluationScopeLevel = "container" | "module" | "lesson" | "page" | "block";
export type EvaluationRunStatus = "queued" | "running" | "completed" | "partial" | "failed";
export type EvaluationParticipantStatus = "completed" | "failed" | "skipped";
export type FindingSeverity = "critical" | "high" | "medium" | "low";
export type ImprovementPriority = "P0" | "P1" | "P2";
export type EvaluationConfidence = "low" | "medium" | "high";

export type EvaluationScope = {
  containerSlug: string;
  moduleId?: string;
  lessonId?: string;
  pageId?: string;
  blockId?: string;
};

export type EvaluationScopeSnapshot = {
  level: EvaluationScopeLevel;
  title: string;
  path: string[];
  scope: EvaluationScope;
  metrics: {
    modules: number;
    lessons: number;
    pages: number;
    blocks: number;
    characters: number;
  };
  target: unknown;
  promptContext: string;
};

export type EvaluationParticipant = {
  id: string;
  label: string;
  provider: EvaluationProviderId;
  model: string;
  persona: string;
  rubric: string;
  enabled: boolean;
  unavailableReason?: string;
  apiKeyEnv?: string;
};

export type EvaluationUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  estimatedCostUsd?: number;
};

export type EvaluationFinding = {
  severity: FindingSeverity;
  title: string;
  evidence: string;
  recommendation: string;
};

export type EvaluationImprovementProposal = {
  priority: ImprovementPriority;
  title: string;
  detail: string;
  effort?: "small" | "medium" | "large";
};

export type EvaluationResult = {
  score: number;
  summary: string;
  findings: EvaluationFinding[];
  risks: string[];
  improvementProposals: EvaluationImprovementProposal[];
  confidence: EvaluationConfidence;
  rawText?: string;
};

export type EvaluationParticipantRunResult = {
  participantId: string;
  provider: EvaluationProviderId;
  model: string;
  status: EvaluationParticipantStatus;
  startedAt: string;
  completedAt: string;
  result?: EvaluationResult;
  usage?: EvaluationUsage;
  error?: string;
};

export type EvaluationSynthesis = {
  summary: string;
  consensus: string[];
  disagreements: string[];
  nextActions: EvaluationImprovementProposal[];
};

export type EvaluationRun = {
  id: string;
  status: EvaluationRunStatus;
  participantIds: string[];
  startedAt: string;
  completedAt?: string;
  participantResults: EvaluationParticipantRunResult[];
  synthesis?: EvaluationSynthesis;
};

export type EvaluationMessageRole = "chief" | "participant" | "synthesizer" | "system";

export type EvaluationMessage = {
  id: string;
  role: EvaluationMessageRole;
  authorName: string;
  participantId?: string;
  content: string;
  createdAt: string;
  status?: EvaluationParticipantStatus;
};

export type EvaluationThread = {
  id: string;
  containerSlug: string;
  title: string;
  issue: string;
  scope: EvaluationScope;
  scopeSnapshot: EvaluationScopeSnapshot;
  participants: EvaluationParticipant[];
  messages: EvaluationMessage[];
  runs: EvaluationRun[];
  createdAt: string;
  updatedAt: string;
};

export type EvaluationThreadSummary = {
  id: string;
  containerSlug: string;
  title: string;
  issue: string;
  scope: EvaluationScope;
  scopeTitle: string;
  scopePath: string[];
  runCount: number;
  lastStatus?: EvaluationRunStatus;
  createdAt: string;
  updatedAt: string;
};

export type EvaluationProviderRequest = {
  thread: EvaluationThread;
  participant: EvaluationParticipant;
  container: ContainerSpec;
  prompt: string;
  signal: AbortSignal;
};

export type EvaluationProviderResponse = {
  text: string;
  usage?: EvaluationUsage;
};

export type EvaluationProviderInvoker = (request: EvaluationProviderRequest) => Promise<EvaluationProviderResponse>;

export type EvaluationBlockSummary = {
  id: string;
  type: LessonWorkspaceBlock["type"];
  propsPreview: unknown;
};
