import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  getEvaluationParticipantCatalog,
  getEvaluationProviderInvokers
} from "@/lib/backend/evaluationProviders";
import type { EvaluationParticipant } from "@/lib/backend/evaluationTypes";

const savedEnv = { ...process.env };
const savedFetch = globalThis.fetch;

afterEach(() => {
  process.env = { ...savedEnv };
  globalThis.fetch = savedFetch;
});

describe("evaluation provider catalog", () => {
  it("does not create runtime agents without explicit configuration", () => {
    delete process.env.SHIFTBASE_EVAL_AGENTS;

    assert.deepEqual(getEvaluationParticipantCatalog(), []);
  });

  it("activates explicitly configured OpenRouter and NVIDIA agents when their keys exist", () => {
    process.env.OPENROUTER_API_KEY = "openrouter-key";
    process.env.NVIDIA_API_KEY = "nvidia-key";
    process.env.SHIFTBASE_EVAL_AGENTS = JSON.stringify([
      {
        id: "agent-market-review",
        label: "Market Review",
        provider: "openrouter",
        model: "anthropic/claude-sonnet-4.5",
        persona: "시장성 평가자",
        rubric: "상용성, 차별성, 구매 근거"
      },
      {
        id: "agent-ops-review",
        label: "Ops Review",
        provider: "nvidia",
        model: "nvidia/llama-3.1-nemotron-ultra-253b-v1",
        persona: "운영 평가자",
        rubric: "운영 리스크, 반복 작업, 실패 처리"
      }
    ]);

    const catalog = getEvaluationParticipantCatalog();

    assert.equal(catalog.length, 2);
    assert.equal(catalog[0].provider, "openrouter");
    assert.equal(catalog[0].enabled, true);
    assert.equal(catalog[1].provider, "nvidia");
    assert.equal(catalog[1].enabled, true);
  });

  it("honors per-agent apiKeyEnv and disables agents with missing keys", () => {
    process.env.AGENT_SPECIFIC_KEY = "specific-key";
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.SHIFTBASE_OPENROUTER_API_KEY;
    process.env.SHIFTBASE_EVAL_AGENTS = JSON.stringify([
      {
        id: "agent-specific-key",
        label: "Specific Key Agent",
        provider: "openrouter",
        model: "openai/gpt-4.1",
        persona: "지정 키 평가자",
        rubric: "키 분리",
        apiKeyEnv: "AGENT_SPECIFIC_KEY"
      },
      {
        id: "agent-missing-key",
        label: "Missing Key Agent",
        provider: "openrouter",
        model: "openai/gpt-4.1",
        persona: "미설정 평가자",
        rubric: "키 누락"
      }
    ]);

    const catalog = getEvaluationParticipantCatalog();

    assert.equal(catalog[0].enabled, true);
    assert.equal(catalog[0].apiKeyEnv, "AGENT_SPECIFIC_KEY");
    assert.equal(catalog[1].enabled, false);
    assert.match(catalog[1].unavailableReason ?? "", /OPENROUTER_API_KEY/);
  });

  it("calls the OpenRouter chat completions endpoint with the configured model", async () => {
    const calls: Array<{ url: string; body: Record<string, unknown>; auth?: string | null }> = [];
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      calls.push({
        url: String(input),
        body: JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>,
        auth: init?.headers instanceof Headers ? init.headers.get("Authorization") : (init?.headers as Record<string, string> | undefined)?.Authorization
      });
      return new Response(JSON.stringify({
        choices: [{ message: { content: "{\"score\":77,\"summary\":\"ok\",\"findings\":[],\"risks\":[],\"improvementProposals\":[],\"confidence\":\"high\"}" } }],
        usage: { total_tokens: 21 }
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }) as typeof fetch;
    process.env.OPENROUTER_API_KEY = "openrouter-key";
    const participant = makeParticipant("openrouter", "anthropic/claude-sonnet-4.5");

    const response = await getEvaluationProviderInvokers().openrouter({
      participant,
      prompt: "evaluate",
      signal: new AbortController().signal,
      thread: {} as never,
      container: {} as never
    });

    assert.equal(calls[0].url, "https://openrouter.ai/api/v1/chat/completions");
    assert.equal(calls[0].auth, "Bearer openrouter-key");
    assert.equal(calls[0].body.model, "anthropic/claude-sonnet-4.5");
    assert.match(response.text, /score/);
    assert.equal(response.usage?.totalTokens, 21);
  });

  it("calls the NVIDIA chat completions endpoint with the configured model", async () => {
    const calls: Array<{ url: string; body: Record<string, unknown>; auth?: string | null }> = [];
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      calls.push({
        url: String(input),
        body: JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>,
        auth: init?.headers instanceof Headers ? init.headers.get("Authorization") : (init?.headers as Record<string, string> | undefined)?.Authorization
      });
      return new Response(JSON.stringify({
        choices: [{ message: { content: "{\"score\":79,\"summary\":\"ok\",\"findings\":[],\"risks\":[],\"improvementProposals\":[],\"confidence\":\"high\"}" } }],
        usage: { total_tokens: 34 }
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }) as typeof fetch;
    process.env.NVIDIA_API_KEY = "nvidia-key";
    const participant = makeParticipant("nvidia", "nvidia/llama-3.1-nemotron-ultra-253b-v1");

    const response = await getEvaluationProviderInvokers().nvidia({
      participant,
      prompt: "evaluate",
      signal: new AbortController().signal,
      thread: {} as never,
      container: {} as never
    });

    assert.equal(calls[0].url, "https://integrate.api.nvidia.com/v1/chat/completions");
    assert.equal(calls[0].auth, "Bearer nvidia-key");
    assert.equal(calls[0].body.model, "nvidia/llama-3.1-nemotron-ultra-253b-v1");
    assert.match(response.text, /score/);
    assert.equal(response.usage?.totalTokens, 34);
  });
});

function makeParticipant(provider: "openrouter" | "nvidia", model: string): EvaluationParticipant {
  return {
    id: `agent-${provider}`,
    label: `${provider} agent`,
    provider,
    model,
    persona: "검증 평가자",
    rubric: "검증",
    enabled: true
  };
}
