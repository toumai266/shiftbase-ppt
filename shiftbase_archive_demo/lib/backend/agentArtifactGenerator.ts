import { badRequest } from "@/lib/backend/errors";

export type AgentArtifactGenerateInput = {
  prompt: string;
  pageTitle?: string;
  readingTitle?: string;
  bodyMarkdown?: string;
  paragraphs?: string[];
  checkpoints?: string[];
  currentCode?: string;
  currentArtifact?: {
    kind?: string;
    entry?: string;
    files?: Record<string, string>;
    version?: number;
    status?: string;
  };
};

export type AgentArtifactGenerateResult = {
  kind: "html" | "react" | "canvas" | "image" | "mixed";
  entry: string;
  files: Record<string, string>;
  code: string;
  notes?: string;
  generatedAt: string;
  model: string;
};

export type ReadingMarkdownGenerateInput = {
  prompt: string;
  moduleTitle?: string;
  lessonTitle?: string;
  pageTitle?: string;
  readingTitle?: string;
  bodyMarkdown?: string;
  paragraphs?: string[];
};

export type ReadingMarkdownGenerateResult = {
  markdown: string;
  generatedAt: string;
  model: string;
};

const defaultOAuthUrl = "http://127.0.0.1:10531";
const defaultModel = "gpt-5.5";

function getOAuthUrl() {
  return (process.env.SHIFTBASE_OPENAI_OAUTH_URL || process.env.OPENAI_OAUTH_URL || defaultOAuthUrl).replace(/\/+$/, "");
}

function getModel() {
  return process.env.SHIFTBASE_AGENT_MODEL || defaultModel;
}

function timeoutSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, cancel: () => clearTimeout(timer) };
}

export async function getAgentArtifactProviderStatus() {
  const oauthUrl = getOAuthUrl();
  const { signal, cancel } = timeoutSignal(1800);

  try {
    const response = await fetch(`${oauthUrl}/v1/models`, { signal });
    return {
      available: response.ok,
      oauthUrl,
      model: getModel(),
      error: response.ok ? undefined : `OAuth proxy returned ${response.status}.`
    };
  } catch (error) {
    return {
      available: false,
      oauthUrl,
      model: getModel(),
      error: error instanceof Error ? error.message : "OAuth proxy is not reachable."
    };
  } finally {
    cancel();
  }
}

export async function generateAgentArtifact(input: AgentArtifactGenerateInput): Promise<AgentArtifactGenerateResult> {
  const prompt = input.prompt.trim();
  if (!prompt) throw badRequest("prompt is required.");

  const provider = await getAgentArtifactProviderStatus();
  if (!provider.available) {
    throw badRequest(`Agent OAuth proxy is not ready: ${provider.error ?? provider.oauthUrl}`);
  }

  const text = await fetchResponseTextViaOAuth({
    input: [
      {
        role: "developer",
        content: [
          "You generate one self-contained right-pane learning artifact for an authoring CMS.",
          "Return only JSON with keys kind, entry, files, and notes.",
          "Do not force interactivity. A simple manual, static reference panel, checklist, comparison table, or annotated visual is valid when it supports the adjacent reading page better than controls.",
          "Use interactive controls only when the learner must choose, input, classify, revise, or save something that strengthens the page's core judgment.",
          "kind should usually be html for self-contained right-pane output; image-only requests may use image if the caller explicitly asks for it and still include renderable files.",
          "entry must be index.html for self-contained HTML output.",
          "files must be an object containing entry; files[entry] must be a complete, self-contained HTML document when kind is html/canvas/react.",
          "Do not include markdown fences. Do not reference external network APIs. Keep it suitable for sandboxed iframe rendering.",
          "The artifact should support the adjacent reading page, not replace it."
        ].join(" ")
      },
      {
        role: "user",
        content: JSON.stringify(
          {
            request: prompt,
            pageTitle: input.pageTitle ?? "",
            readingTitle: input.readingTitle ?? "",
            bodyMarkdown: input.bodyMarkdown ?? "",
            paragraphs: input.paragraphs ?? [],
            currentCode: input.currentCode?.slice(0, 12000) ?? "",
            currentArtifact: input.currentArtifact ?? null
          },
          null,
          2
        )
      }
    ]
  });

  const artifact = parseArtifactJson(text);
  return {
    ...artifact,
    generatedAt: new Date().toISOString(),
    model: getModel()
  };
}

export async function generateReadingMarkdown(input: ReadingMarkdownGenerateInput): Promise<ReadingMarkdownGenerateResult> {
  const prompt = input.prompt.trim();
  if (!prompt) throw badRequest("prompt is required.");

  const provider = await getAgentArtifactProviderStatus();
  if (!provider.available) {
    throw badRequest(`Agent OAuth proxy is not ready: ${provider.error ?? provider.oauthUrl}`);
  }

  const text = await fetchResponseTextViaOAuth({
    input: [
      {
        role: "developer",
        content: [
          "You write the left-side learning text for an authoring CMS page.",
          "Return only JSON with key markdown.",
          "markdown must be Korean Markdown text, not HTML.",
          "Headings, lists, checklists, tables, links, and image markdown are allowed when useful.",
          "Do not include markdown fences around the JSON response.",
          "Use the current markdown as context and only replace the page text according to the user's request."
        ].join(" ")
      },
      {
        role: "user",
        content: JSON.stringify(
          {
            request: prompt,
            moduleTitle: input.moduleTitle ?? "",
            lessonTitle: input.lessonTitle ?? "",
            pageTitle: input.pageTitle ?? "",
            readingTitle: input.readingTitle ?? "",
            currentMarkdown: input.bodyMarkdown?.slice(0, 12000) ?? "",
            paragraphs: input.paragraphs ?? []
          },
          null,
          2
        )
      }
    ]
  });

  return {
    markdown: parseReadingMarkdownJson(text),
    generatedAt: new Date().toISOString(),
    model: getModel()
  };
}

async function fetchResponseTextViaOAuth(payload: Record<string, unknown>) {
  const oauthUrl = getOAuthUrl();
  const model = getModel();
  const { signal, cancel } = timeoutSignal(120000);

  try {
    const response = await fetch(`${oauthUrl}/v1/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify({
        ...payload,
        model,
        reasoning: { effort: process.env.SHIFTBASE_AGENT_REASONING_EFFORT || "medium" },
        store: false,
        stream: true
      }),
      signal
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw badRequest(readResponsesError(body, `Responses request failed: ${response.status}`));
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/event-stream")) {
      const json = await response.json();
      return readOutputText(json);
    }

    if (!response.body) throw badRequest("Responses stream was empty.");
    return await readSseText(response.body);
  } finally {
    cancel();
  }
}

async function readSseText(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let refusal = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const data = readSseData(block);

      if (data === "[DONE]") {
        await reader.cancel().catch(() => {});
        if (refusal) throw badRequest(refusal);
        return text.trim();
      }
      if (data) {
        const event = JSON.parse(data) as Record<string, unknown>;
        if (event.type === "response.output_text.delta" && typeof event.delta === "string") text += event.delta;
        if (event.type === "response.refusal.delta" && typeof event.delta === "string") refusal += event.delta;
        if (event.type === "response.completed") {
          await reader.cancel().catch(() => {});
          if (refusal) throw badRequest(refusal);
          if (!text) text = readOutputText(event.response);
          return text.trim();
        }
        if (event.type === "error") throw badRequest(readEventError(event));
      }
      boundary = buffer.indexOf("\n\n");
    }
  }

  if (refusal) throw badRequest(refusal);
  return text.trim();
}

function readSseData(block: string) {
  let data = "";
  for (const line of block.split("\n")) {
    if (line.startsWith("data: ")) data += line.slice(6);
  }
  return data.trim();
}

function readOutputText(value: unknown): string {
  if (typeof value === "object" && value !== null && "output_text" in value) {
    const outputText = (value as { output_text?: unknown }).output_text;
    if (typeof outputText === "string") return outputText;
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

function parseArtifactJson(text: string): Omit<AgentArtifactGenerateResult, "generatedAt" | "model"> {
  const artifact = parseJsonObject(
    text,
    "Agent returned non-JSON artifact output.",
    "Agent artifact output must be an object."
  );
  const kind: AgentArtifactGenerateResult["kind"] =
    artifact.kind === "image" ||
    artifact.kind === "react" ||
    artifact.kind === "canvas" ||
    artifact.kind === "mixed"
      ? artifact.kind
      : "html";
  const entry = typeof artifact.entry === "string" && artifact.entry.trim() ? artifact.entry.trim() : "index.html";
  const files = readArtifactFiles(artifact.files);
  const legacyCode = typeof artifact.code === "string" ? artifact.code : "";
  const code = files[entry] || legacyCode;
  if (!code.trim()) {
    throw badRequest("Agent artifact output must include files[entry] or code.");
  }

  return {
    kind,
    entry,
    files: Object.keys(files).length > 0 ? { ...files, [entry]: code } : { [entry]: code },
    code,
    notes: typeof artifact.notes === "string" ? artifact.notes : undefined
  };
}

function parseReadingMarkdownJson(text: string) {
  const result = parseJsonObject(
    text,
    "Agent returned non-JSON reading output.",
    "Agent reading output must be an object."
  );
  const markdown = typeof result.markdown === "string" ? result.markdown.trim() : "";
  if (!markdown) throw badRequest("Agent reading output must include markdown.");
  return markdown;
}

function parseJsonObject(text: string, nonJsonMessage: string, objectMessage: string) {
  const raw = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  const jsonText = start >= 0 && end >= start ? raw.slice(start, end + 1) : raw;
  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw badRequest(nonJsonMessage);
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw badRequest(objectMessage);
  }

  return parsed as Record<string, unknown>;
}

function readArtifactFiles(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {} as Record<string, string>;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === "string")
  );
}

function readResponsesError(body: string, fallback: string) {
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } };
    return parsed.error?.message ?? fallback;
  } catch {
    return body.trim() ? body.slice(0, 300) : fallback;
  }
}

function readEventError(event: Record<string, unknown>) {
  const error = event.error;
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return JSON.stringify(event);
}
