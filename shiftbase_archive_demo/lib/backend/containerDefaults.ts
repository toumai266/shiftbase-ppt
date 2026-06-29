import type { ContainerSpec } from "@/lib/containerSpec";
import type { CreateContainerInput } from "@/lib/backend/containerRepository";

export function todayLocalDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export function createInitialSpec({ slug, title }: CreateContainerInput): ContainerSpec {
  return {
    id: slug,
    slug,
    title,
    summary: "새 인터랙티브 학습 컨테이너의 요약을 입력하세요.",
    updatedAt: todayLocalDate(),
    introMarkdown: "## 컨테이너 소개\n\n새 인터랙티브 학습 컨테이너의 소개를 입력하세요.",
    pricing: {
      originalPrice: 0,
      discountRate: 0
    },
    recommendationCards: [
      { image: "/assets/audiences/ai-beginner.png", text: "AI 적용 지점을 찾고 싶은 실무자" },
      { image: "/assets/audiences/automation-worker.png", text: "반복 업무를 줄이고 싶은 팀원" },
      { image: "/assets/audiences/team-leader.png", text: "팀의 AI 활용 기준이 필요한 리더" },
      { image: "/assets/audiences/result-learner.png", text: "결과물 중심으로 배우고 싶은 학습자" }
    ],
    displayBadges: [],
    status: "draft",
    access: "free",
    hub: "Shiftbase",
    tracks: ["AI 입문"],
    audience: ["학습 대상자를 입력하세요."],
    difficulty: "beginner",
    outcomes: ["학습 후 얻을 결과를 입력하세요."],
    outputs: ["완성할 산출물을 입력하세요."],
    modules: [
      {
        id: "module-01",
        title: "모듈 1. 새 모듈",
        lessons: [
          {
            id: "lesson-01",
            title: "새 레슨",
            pages: [
              {
                id: "page-01",
                title: "새 페이지",
                left: {
                  title: "세부 목차 이름",
                  bodyMarkdown: "학습 내용을 입력하세요.",
                  paragraphs: ["학습 내용을 입력하세요."],
                  checkpoints: ["확인 항목을 입력하세요."]
                },
                workspace: {
                  layout: "focus",
                  blocks: [
                    {
                      id: "code-canvas",
                      type: "code-canvas",
                      props: {
                        kind: "html",
                        artifactId: "artifact-page-01",
                        prompt: "오른쪽 페이지에 들어갈 실행 산출물을 자연어로 설명하세요.",
                        promptHistory: [],
                        code: "<!doctype html><html lang=\"ko\"><head><meta charset=\"utf-8\" /><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" /><style>html,body{height:100%;margin:0}body{display:grid;place-items:center;font-family:system-ui,sans-serif;color:#121826;background:#fff}.canvas{width:min(100%,720px);min-height:360px;display:grid;place-items:center;border:1px solid #d9e1ec;background:#f8fafc}</style></head><body><main class=\"canvas\"><p>오른쪽 실행 영역을 구현하세요.</p></main></body></html>",
                        entry: "index.html",
                        files: {
                          "index.html": "<!doctype html><html lang=\"ko\"><head><meta charset=\"utf-8\" /><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" /><style>html,body{height:100%;margin:0}body{display:grid;place-items:center;font-family:system-ui,sans-serif;color:#121826;background:#fff}.canvas{width:min(100%,720px);min-height:360px;display:grid;place-items:center;border:1px solid #d9e1ec;background:#f8fafc}</style></head><body><main class=\"canvas\"><p>오른쪽 실행 영역을 구현하세요.</p></main></body></html>"
                        },
                        assets: [],
                        runtime: "sandboxed-iframe",
                        version: 1,
                        status: "draft"
                      }
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
}
