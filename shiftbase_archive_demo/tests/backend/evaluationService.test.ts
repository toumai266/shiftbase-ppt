import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { BackendError, notFound } from "@/lib/backend/errors";
import { LocalEvaluationThreadRepository } from "@/lib/backend/evaluationRepository";
import { createEvaluationService } from "@/lib/backend/evaluationService";
import type { ContainerSpec } from "@/lib/containerSpec";
import type { EvaluationParticipant } from "@/lib/backend/evaluationTypes";

let tempRoot = "";

const sampleContainer: ContainerSpec = {
  id: "sample-container",
  slug: "sample-container",
  title: "Sample Container",
  summary: "A focused test container",
  status: "draft",
  access: "free",
  hub: "AI",
  tracks: ["operations"],
  audience: ["operators"],
  difficulty: "beginner",
  outcomes: ["Judge AI output"],
  outputs: ["Review memo"],
  modules: [
    {
      id: "module-a",
      title: "Module A",
      lessons: [
        {
          id: "lesson-a",
          title: "Lesson A",
          pages: [
            {
              id: "page-a",
              title: "Page A",
              left: {
                title: "Reading A",
                paragraphs: ["This page explains a commercial review workflow."]
              },
              workspace: {
                layout: "focus",
                blocks: [
                  {
                    id: "block-a",
                    type: "intro-summary",
                    props: { outputs: ["A practical review checklist"] }
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  ]
};

const participants: EvaluationParticipant[] = [
  {
    id: "agent-product-review",
    label: "Product Review Agent",
    provider: "openrouter",
    model: "fixture/openrouter-model",
    persona: "Product reviewer",
    rubric: "Commercial readiness",
    enabled: true
  },
  {
    id: "agent-learning-architect",
    label: "Learning Architect Agent",
    provider: "nvidia",
    model: "fixture/nvidia-model",
    persona: "Learning architect",
    rubric: "Learning clarity",
    enabled: true
  }
];

beforeEach(async () => {
  tempRoot = await mkdtemp(path.join(os.tmpdir(), "shiftbase-evals-"));
});

afterEach(async () => {
  await rm(tempRoot, { recursive: true, force: true });
});

function createTestService() {
  return createEvaluationService({
    repository: new LocalEvaluationThreadRepository(tempRoot),
    participants,
    readContainer: async (slug) => {
      if (slug !== sampleContainer.slug) throw notFound(`Container not found: ${slug}.`);
      return sampleContainer;
    },
    providerInvokers: {
      openrouter: async () => ({
        text: JSON.stringify({
          score: 82,
          summary: "상용성은 보이지만 블록의 실행 증거가 더 필요합니다.",
          findings: [
            {
              severity: "high",
              title: "실행 증거 부족",
              evidence: "block-a는 산출물 요약만 갖고 있습니다.",
              recommendation: "사용자가 판단을 저장하는 상호작용을 추가하세요."
            }
          ],
          risks: ["유료 컨테이너에서 실습 가치가 약해 보일 수 있습니다."],
          improvementProposals: [
            {
              priority: "P1",
              title: "판단 저장 흐름 추가",
              detail: "요약 블록 뒤에 후보 선택이나 체크리스트 블록을 붙입니다.",
              effort: "medium"
            }
          ],
          confidence: "high"
        }),
        usage: { totalTokens: 42 }
      }),
      nvidia: async () => {
        throw new Error("provider down");
      }
    }
  });
}

describe("evaluation service", () => {
  it("creates a thread anchored to a real block scope", async () => {
    const service = createTestService();

    const thread = await service.createThread({
      containerSlug: sampleContainer.slug,
      scope: {
        containerSlug: sampleContainer.slug,
        moduleId: "module-a",
        lessonId: "lesson-a",
        pageId: "page-a",
        blockId: "block-a"
      },
      issue: "이 블록이 유료 컨테이너 수준인지 평가해줘."
    });
    const summaries = await service.listThreads(sampleContainer.slug);

    assert.equal(thread.scopeSnapshot.level, "block");
    assert.deepEqual(thread.scopeSnapshot.path, ["Sample Container", "Module A", "Lesson A", "Page A", "block-a"]);
    assert.equal(summaries.length, 1);
    assert.equal(summaries[0].id, thread.id);
  });

  it("stores partial runs when one provider fails", async () => {
    const service = createTestService();
    const thread = await service.createThread({
      containerSlug: sampleContainer.slug,
      scope: { containerSlug: sampleContainer.slug, pageId: "page-a" },
      issue: "페이지의 평가 흐름을 모델별로 점검해줘."
    });

    const completed = await service.runThread({
      threadId: thread.id,
      participantIds: ["agent-product-review", "agent-learning-architect"]
    });
    const run = completed.runs.at(-1);

    assert.equal(run?.status, "partial");
    assert.equal(run?.participantResults.length, 2);
    assert.equal(run?.participantResults.find((result) => result.participantId === "agent-product-review")?.status, "completed");
    assert.equal(run?.participantResults.find((result) => result.participantId === "agent-learning-architect")?.status, "failed");
    assert.equal(run?.synthesis?.nextActions[0]?.title, "판단 저장 흐름 추가");
    assert.ok(completed.messages.some((message) => message.role === "synthesizer"));
  });

  it("marks malformed model output as failed instead of fabricating review content", async () => {
    const service = createEvaluationService({
      repository: new LocalEvaluationThreadRepository(tempRoot),
      participants: [participants[0]],
      readContainer: async () => sampleContainer,
      providerInvokers: {
        openrouter: async () => ({ text: "not json" })
      }
    });
    const thread = await service.createThread({
      containerSlug: sampleContainer.slug,
      scope: { containerSlug: sampleContainer.slug, pageId: "page-a" },
      issue: "비정형 응답 처리 확인"
    });

    const completed = await service.runThread({
      threadId: thread.id,
      participantIds: ["agent-product-review"]
    });
    const result = completed.runs.at(-1)?.participantResults[0];

    assert.equal(completed.runs.at(-1)?.status, "failed");
    assert.equal(result?.status, "failed");
    assert.equal(result?.result, undefined);
    assert.match(result?.error ?? "", /JSON|Unexpected token/i);
    assert.equal(completed.runs.at(-1)?.synthesis?.nextActions.length, 0);
  });

  it("uses current agent catalog on rerun instead of stale thread participants", async () => {
    let currentParticipants = participants;
    const service = createEvaluationService({
      repository: new LocalEvaluationThreadRepository(tempRoot),
      readContainer: async () => sampleContainer,
      get participants() {
        return currentParticipants;
      },
      providerInvokers: {
        openrouter: async () => ({
          text: JSON.stringify({
            score: 91,
            summary: "최신 agent 설정으로 평가했습니다.",
            findings: [
              {
                severity: "medium",
                title: "최신 설정 반영",
                evidence: "agent id가 변경된 뒤 실행됐습니다.",
                recommendation: "현재 설정 기준으로 기록합니다."
              }
            ],
            risks: [],
            improvementProposals: [],
            confidence: "high"
          })
        })
      }
    });
    const thread = await service.createThread({
      containerSlug: sampleContainer.slug,
      scope: { containerSlug: sampleContainer.slug, pageId: "page-a" },
      issue: "agent 변경 반영 확인"
    });
    currentParticipants = [
      {
        ...participants[0],
        id: "agent-product-review-v2",
        model: "anthropic/claude-sonnet-4.5"
      }
    ];

    const completed = await service.runThread({
      threadId: thread.id,
      participantIds: ["agent-product-review-v2"]
    });

    assert.equal(completed.participants[0].id, "agent-product-review-v2");
    assert.equal(completed.runs.at(-1)?.participantResults[0]?.participantId, "agent-product-review-v2");
  });

  it("rejects a scope that points at a missing block", async () => {
    const service = createTestService();

    await assert.rejects(
      () => service.createThread({
        containerSlug: sampleContainer.slug,
        scope: { containerSlug: sampleContainer.slug, blockId: "missing-block" },
        issue: "없는 블록 평가"
      }),
      (error) => error instanceof BackendError && error.code === "BAD_REQUEST"
    );
  });
});
