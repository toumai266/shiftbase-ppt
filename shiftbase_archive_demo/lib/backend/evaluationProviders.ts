import { badRequest } from "@/lib/backend/errors";
import type {
  EvaluationParticipant,
  EvaluationProviderId,
  EvaluationProviderInvoker,
  EvaluationProviderRequest,
  EvaluationProviderResponse,
  EvaluationUsage
} from "@/lib/backend/evaluationTypes";

function getOpenAiOAuthUrl() {
  return (process.env.SHIFTBASE_OPENAI_OAUTH_URL || process.env.OPENAI_OAUTH_URL)?.replace(/\/+$/, "");
}

function readEnv(name: string | undefined) {
  return name ? process.env[name] : undefined;
}

function getProviderApiKey(participant: EvaluationParticipant) {
  const explicit = readEnv(participant.apiKeyEnv);
  if (explicit) return explicit;
  if (participant.provider === "anthropic") return process.env.ANTHROPIC_API_KEY;
  if (participant.provider === "gemini") return process.env.GEMINI_API_KEY;
  if (participant.provider === "openrouter") return process.env.OPENROUTER_API_KEY || process.env.SHIFTBASE_OPENROUTER_API_KEY;
  if (participant.provider === "nvidia") return process.env.NVIDIA_API_KEY || process.env.SHIFTBASE_NVIDIA_API_KEY;
  return undefined;
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function readOpenAiText(value: unknown): string {
  if (typeof value === "object" && value !== null && "output_text" in value) {
    const text = (value as { output_text?: unknown }).output_text;
    if (typeof text === "string") return text;
  }

  const output = typeof value === "object" && value !== null && "output" in value
    ? (value as { output?: unknown }).output
    : undefined;
  if (!Array.isArray(output)) return "";

  return output
    .flatMap((item) => {
      if (typeof item !== "object" || item === null || !("content" in item)) return [];
      const content = (item as { content?: unknown }).content;
      if (!Array.isArray(content)) return [];
      return content.map((part) => {
        if (typeof part !== "object" || part === null) return "";
        if ("text" in part && typeof part.text === "string") return part.text;
        return "";
      });
    })
    .join("")
    .trim();
}

function readOpenAiUsage(value: unknown): EvaluationUsage | undefined {
  const usage = typeof value === "object" && value !== null && "usage" in value
    ? (value as { usage?: unknown }).usage
    : undefined;
  if (typeof usage !== "object" || usage === null) return undefined;
  return {
    inputTokens: readNumber((usage as Record<string, unknown>).input_tokens),
    outputTokens: readNumber((usage as Record<string, unknown>).output_tokens),
    totalTokens: readNumber((usage as Record<string, unknown>).total_tokens)
  };
}

function readAnthropicText(value: unknown): string {
  const content = typeof value === "object" && value !== null && "content" in value
    ? (value as { content?: unknown }).content
    : undefined;
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (typeof part !== "object" || part === null) return "";
      if ("type" in part && part.type === "text" && "text" in part && typeof part.text === "string") return part.text;
      return "";
    })
    .join("")
    .trim();
}

function readAnthropicUsage(value: unknown): EvaluationUsage | undefined {
  const usage = typeof value === "object" && value !== null && "usage" in value
    ? (value as { usage?: unknown }).usage
    : undefined;
  if (typeof usage !== "object" || usage === null) return undefined;
  const inputTokens = readNumber((usage as Record<string, unknown>).input_tokens);
  const outputTokens = readNumber((usage as Record<string, unknown>).output_tokens);
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens !== undefined && outputTokens !== undefined ? inputTokens + outputTokens : undefined
  };
}

function readGeminiText(value: unknown): string {
  const candidates = typeof value === "object" && value !== null && "candidates" in value
    ? (value as { candidates?: unknown }).candidates
    : undefined;
  if (!Array.isArray(candidates)) return "";
  return candidates
    .flatMap((candidate) => {
      if (typeof candidate !== "object" || candidate === null || !("content" in candidate)) return [];
      const content = (candidate as { content?: unknown }).content;
      if (typeof content !== "object" || content === null || !("parts" in content)) return [];
      const parts = (content as { parts?: unknown }).parts;
      if (!Array.isArray(parts)) return [];
      return parts.map((part) => {
        if (typeof part !== "object" || part === null) return "";
        if ("text" in part && typeof part.text === "string") return part.text;
        return "";
      });
    })
    .join("")
    .trim();
}

function readGeminiUsage(value: unknown): EvaluationUsage | undefined {
  const usage = typeof value === "object" && value !== null && "usageMetadata" in value
    ? (value as { usageMetadata?: unknown }).usageMetadata
    : undefined;
  if (typeof usage !== "object" || usage === null) return undefined;
  return {
    inputTokens: readNumber((usage as Record<string, unknown>).promptTokenCount),
    outputTokens: readNumber((usage as Record<string, unknown>).candidatesTokenCount),
    totalTokens: readNumber((usage as Record<string, unknown>).totalTokenCount)
  };
}

async function readJsonResponse(response: Response, fallback: string) {
  const text = await response.text();
  if (!response.ok) {
    throw badRequest(readProviderError(text, fallback));
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw badRequest(`${fallback}: provider returned non-JSON HTTP response.`);
  }
}

function readProviderError(body: string, fallback: string) {
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } };
    return parsed.error?.message ?? fallback;
  } catch {
    return body.trim() ? body.slice(0, 500) : fallback;
  }
}

function assertText(text: string, provider: EvaluationProviderId) {
  if (!text.trim()) throw badRequest(`${provider} returned an empty evaluation response.`);
  return text.trim();
}

export function getEvaluationParticipantCatalog(): EvaluationParticipant[] {
  const configured = process.env.SHIFTBASE_EVAL_AGENTS?.trim();
  if (!configured) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(configured);
  } catch {
    throw badRequest("SHIFTBASE_EVAL_AGENTS must be valid JSON.");
  }
  if (!Array.isArray(parsed)) throw badRequest("SHIFTBASE_EVAL_AGENTS must be a JSON array.");

  return parsed.map((rawAgent, index) => {
    const agent = readAgentConfig(rawAgent, index);
    const unavailableReason = readUnavailableReason(agent);
    return {
      ...agent,
      enabled: agent.enabled && !unavailableReason,
      unavailableReason
    };
  });
}

async function invokeOpenAi({ participant, prompt, signal }: EvaluationProviderRequest): Promise<EvaluationProviderResponse> {
  const oauthUrl = getOpenAiOAuthUrl();
  if (!oauthUrl) throw badRequest("OpenAI participant requires SHIFTBASE_OPENAI_OAUTH_URL or OPENAI_OAUTH_URL.");
  const response = await fetch(`${oauthUrl}/v1/responses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: participant.model,
      input: [
        { role: "developer", content: buildSystemPrompt(participant) },
        { role: "user", content: prompt }
      ],
      reasoning: { effort: process.env.SHIFTBASE_EVAL_OPENAI_REASONING_EFFORT || "medium" },
      store: false
    }),
    signal
  });
  const json = await readJsonResponse(response, `OpenAI evaluation failed with ${response.status}`);
  return { text: assertText(readOpenAiText(json), "openai"), usage: readOpenAiUsage(json) };
}

async function invokeAnthropic({ participant, prompt, signal }: EvaluationProviderRequest): Promise<EvaluationProviderResponse> {
  const apiKey = getProviderApiKey(participant);
  if (!apiKey) throw badRequest("ANTHROPIC_API_KEY is required.");
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": process.env.ANTHROPIC_VERSION || "2023-06-01"
    },
    body: JSON.stringify({
      model: participant.model,
      max_tokens: Number(process.env.SHIFTBASE_EVAL_MAX_TOKENS || 1800),
      system: buildSystemPrompt(participant),
      messages: [{ role: "user", content: prompt }]
    }),
    signal
  });
  const json = await readJsonResponse(response, `Anthropic evaluation failed with ${response.status}`);
  return { text: assertText(readAnthropicText(json), "anthropic"), usage: readAnthropicUsage(json) };
}

async function invokeGemini({ participant, prompt, signal }: EvaluationProviderRequest): Promise<EvaluationProviderResponse> {
  const apiKey = getProviderApiKey(participant);
  if (!apiKey) throw badRequest("GEMINI_API_KEY is required.");
  const model = participant.model.startsWith("models/") ? participant.model.slice("models/".length) : participant.model;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: { text: buildSystemPrompt(participant) } },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.2
      }
    }),
    signal
  });
  const json = await readJsonResponse(response, `Gemini evaluation failed with ${response.status}`);
  return { text: assertText(readGeminiText(json), "gemini"), usage: readGeminiUsage(json) };
}

async function invokeOpenRouter({ participant, prompt, signal }: EvaluationProviderRequest): Promise<EvaluationProviderResponse> {
  const apiKey = getProviderApiKey(participant);
  if (!apiKey) throw badRequest("OPENROUTER_API_KEY is required.");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.SHIFTBASE_EVAL_OPENROUTER_REFERER || "http://localhost",
      "X-Title": process.env.SHIFTBASE_EVAL_OPENROUTER_TITLE || "Shiftbase Evaluation Arena"
    },
    body: JSON.stringify({
      model: participant.model,
      messages: [
        { role: "system", content: buildSystemPrompt(participant) },
        { role: "user", content: prompt }
      ],
      temperature: 0.2
    }),
    signal
  });
  const json = await readJsonResponse(response, `OpenRouter evaluation failed with ${response.status}`);
  return { text: assertText(readChatCompletionText(json), "openrouter"), usage: readOpenAiUsage(json) };
}

async function invokeNvidia({ participant, prompt, signal }: EvaluationProviderRequest): Promise<EvaluationProviderResponse> {
  const apiKey = getProviderApiKey(participant);
  if (!apiKey) throw badRequest("NVIDIA_API_KEY is required.");

  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: participant.model,
      messages: [
        { role: "system", content: buildSystemPrompt(participant) },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: Number(process.env.SHIFTBASE_EVAL_MAX_TOKENS || 1800)
    }),
    signal
  });
  const json = await readJsonResponse(response, `NVIDIA evaluation failed with ${response.status}`);
  return { text: assertText(readChatCompletionText(json), "nvidia"), usage: readOpenAiUsage(json) };
}

function readChatCompletionText(json: unknown) {
  const choices = typeof json === "object" && json !== null && "choices" in json
    ? (json as { choices?: unknown }).choices
    : undefined;
  return Array.isArray(choices)
    ? choices
        .map((choice) => {
          if (typeof choice !== "object" || choice === null || !("message" in choice)) return "";
          const message = (choice as { message?: unknown }).message;
          if (typeof message !== "object" || message === null || !("content" in message)) return "";
          return typeof message.content === "string" ? message.content : "";
        })
        .join("")
    : "";
}

export function getEvaluationProviderInvokers(overrides: Partial<Record<EvaluationProviderId, EvaluationProviderInvoker>> = {}) {
  return {
    openai: overrides.openai ?? invokeOpenAi,
    anthropic: overrides.anthropic ?? invokeAnthropic,
    gemini: overrides.gemini ?? invokeGemini,
    openrouter: overrides.openrouter ?? invokeOpenRouter,
    nvidia: overrides.nvidia ?? invokeNvidia
  } satisfies Record<EvaluationProviderId, EvaluationProviderInvoker>;
}

function readAgentConfig(value: unknown, index: number): EvaluationParticipant {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw badRequest(`SHIFTBASE_EVAL_AGENTS[${index}] must be an object.`);
  }
  const record = value as Record<string, unknown>;
  const id = readRequiredString(record.id, `SHIFTBASE_EVAL_AGENTS[${index}].id`);
  const label = readRequiredString(record.label, `SHIFTBASE_EVAL_AGENTS[${index}].label`);
  const provider = readProvider(record.provider, `SHIFTBASE_EVAL_AGENTS[${index}].provider`);
  const model = readRequiredString(record.model, `SHIFTBASE_EVAL_AGENTS[${index}].model`);
  const persona = readRequiredString(record.persona, `SHIFTBASE_EVAL_AGENTS[${index}].persona`);
  const rubric = readRequiredString(record.rubric, `SHIFTBASE_EVAL_AGENTS[${index}].rubric`);
  const apiKeyEnv = typeof record.apiKeyEnv === "string" && record.apiKeyEnv.trim() ? record.apiKeyEnv.trim() : undefined;

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw badRequest(`SHIFTBASE_EVAL_AGENTS[${index}].id must be kebab-case.`);
  }

  return {
    id,
    label,
    provider,
    model,
    persona,
    rubric,
    apiKeyEnv,
    enabled: record.enabled !== false
  };
}

function readRequiredString(value: unknown, path: string) {
  if (typeof value !== "string" || !value.trim()) throw badRequest(`${path} is required.`);
  return value.trim();
}

function readProvider(value: unknown, path: string): EvaluationProviderId {
  if (
    value === "openai" ||
    value === "anthropic" ||
    value === "gemini" ||
    value === "openrouter" ||
    value === "nvidia"
  ) {
    return value;
  }
  throw badRequest(`${path} must be one of openai, anthropic, gemini, openrouter, nvidia.`);
}

function readUnavailableReason(agent: EvaluationParticipant) {
  if (!agent.enabled) return "Agent is disabled in SHIFTBASE_EVAL_AGENTS.";
  if (agent.provider === "openai" && !getOpenAiOAuthUrl()) {
    return "OpenAI agent requires SHIFTBASE_OPENAI_OAUTH_URL or OPENAI_OAUTH_URL.";
  }
  if (agent.provider !== "openai" && !getProviderApiKey(agent)) {
    const keyName = agent.apiKeyEnv ?? defaultApiKeyEnv(agent.provider);
    return `${keyName} is not set.`;
  }
  return undefined;
}

function defaultApiKeyEnv(provider: EvaluationProviderId) {
  if (provider === "anthropic") return "ANTHROPIC_API_KEY";
  if (provider === "gemini") return "GEMINI_API_KEY";
  if (provider === "openrouter") return "OPENROUTER_API_KEY or SHIFTBASE_OPENROUTER_API_KEY";
  if (provider === "nvidia") return "NVIDIA_API_KEY or SHIFTBASE_NVIDIA_API_KEY";
  return "OPENAI_OAUTH_URL";
}

function buildSystemPrompt(participant: EvaluationParticipant) {
  return [
    "You are an evaluation participant in a product review arena for a Korean AI workshift learning CMS.",
    "Return only a JSON object. Do not wrap it in Markdown.",
    "Use Korean for all human-facing fields.",
    `Persona: ${participant.persona}`,
    `Rubric: ${participant.rubric}`,
    "Schema: { score:number 0-100, summary:string, findings:[{severity:'critical'|'high'|'medium'|'low', title:string, evidence:string, recommendation:string}], risks:string[], improvementProposals:[{priority:'P0'|'P1'|'P2', title:string, detail:string, effort:'small'|'medium'|'large'}], confidence:'low'|'medium'|'high' }",
    "Prefer concrete evidence from the provided target snapshot. If evidence is insufficient, say so instead of inventing facts."
  ].join("\n");
}
