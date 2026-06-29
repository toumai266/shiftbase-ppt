import type { DemoSampleSpec } from "@/lib/demo/sampleDemoTypes";

export const shippingDelaySampleSpec: DemoSampleSpec = {
  id: "demo-shipping-delay",
  slug: "shipping-delay",
  title: "AI로 업무 속도 올리기",
  summary: "시프트베이스 데모 — AI 메일 작성 실습 흐름",
  pages: [
    {
      id: "motivation",
      step: 1,
      title: "AI로 업무 속도 올리기",
      kind: "motivation",
      left: {
        eyebrow: "AI로 이메일을 빠르게 보내는 방법",
        title: "고객사 A에게 발송 지연 안내 메일을 보내기",
        paragraphs: [
          "당신은 B2B 쇼핑몰 운영 담당자입니다. 고객사 A 김OO 팀장에게 6월 10일 발송 예정이었던 주문이 공급 지연으로 6월 17일로 밀렸다는 안내를 보내야 합니다.",
          "고객사를 상대하는 메일은 비즈니스 매너를 신경 써야 합니다. 또한 필요한 정보를 확실히 첨부해야 하죠. 능숙한 직장인이라도 문구 실수, 정보 실수 한 번으로 신뢰를 까먹기 쉽습니다. AI를 이용해서 고객사에 대한 적절한 사과부터, 내·외부 사유, 고객 일정 등이 포함된 이메일을 만들어 봅시다."
        ]
      },
      bubbles: [
        {
          id: "m1",
          anchor: "motivation-card",
          text: "고객사 메일은 **비즈니스 매너**와 **정확한 정보**가 중요합니다. 수동으로 작성하면 **꽤 오랜 시간**을 잡아먹기 쉽습니다."
        },
        {
          id: "m2",
          anchor: "motivation-flow",
          text: "AI로 **초안을 먼저** 만들고, 사람이 **보내도 되는지** 검토하는 방식으로 바꿀 수 있습니다."
        },
        {
          id: "m3",
          anchor: "motivation-ai",
          text: "같은 메일도 AI를 쓰면 **훨씬 빠르게** 정리할 수 있습니다. **다음 페이지**를 누르면 AI 앱 화면에서 직접 프롬프트를 작성합니다."
        }
      ]
    },
    {
      id: "prompt",
      step: 2,
      title: "AI를 이용해 메일 초안 만들기",
      kind: "prompt",
      left: {
        eyebrow: "실습 1. ChatGPT에게 메일 초안 요청하기",
        title: "AI를 이용해 메일 초안 만들기",
        paragraphs: [
          "이번 실습에서는 ChatGPT를 사용하겠습니다.",
          "실제 ChatGPT를 사용해도 좋고, 오른쪽의 실습 플레이어를 사용해도 괜찮습니다.",
          "AI가 맥락을 이해하려면 충분한 자료가 제공되어야 합니다. 파일을 첨부한 뒤, 안내에 따라 **예시 프롬프트**를 확인하고 전송해 보세요."
        ],
        bullets: [
          "첨부 파일을 넣어 보세요. 내부 발송 일정이나 사유에 대한 자료를 포함하면 좋습니다.",
          "받을 사람의 정보를 꼼꼼히 작성하세요. 수신자와 지연 사유, 사과 문장 톤, 예상일 등의 정보를 제공합니다.",
          "제외해야 할 정보를 주의하세요. 공급사명이나 내부 원가, 확정되지 않은 날짜 단정 등의 정보는 주의해야 합니다."
        ],
        link: {
          label: "ChatGPT 열기",
          href: "https://chatgpt.com/"
        }
      },
      bubbles: [
        {
          id: "p1",
          anchor: "attach-button",
          advanceOn: "click",
          text: "**＋** 버튼을 누르면 사진·파일을 ChatGPT에 추가할 수 있습니다. 버튼을 눌러 보세요."
        },
        {
          id: "p2",
          anchor: "attach-menu-files",
          advanceOn: "click",
          text: "**사진 및 파일 추가**를 선택하면 내 컴퓨터에서 자료를 고를 수 있습니다."
        },
        {
          id: "p3",
          anchor: "file-explorer",
          advanceOn: "click",
          text: "탐색기에서 **내부_발송일정_메모.txt** 등 필요한 파일을 선택하고 **열기**를 누르세요."
        },
        {
          id: "p4",
          anchor: "attached-files",
          text: "첨부된 파일은 AI에게 **맥락 자료**로 전달됩니다. 민감한 내부 정보는 넣지 않도록 주의하세요."
        },
        {
          id: "p5",
          anchor: "prompt-input",
          text: "실습용 **예시 프롬프트**가 입력되어 있습니다. **목표·수신자·톤·주의사항**이 어떻게 담겼는지 확인해 보세요."
        },
        {
          id: "p6",
          anchor: "send-button",
          advanceOn: "click",
          text: "**전송**을 누르면 AI가 초안을 생성합니다. 다음 페이지에서 결과를 검토합니다."
        }
      ]
    },
    {
      id: "review",
      step: 3,
      title: "AI가 작성한 메일 초안 다듬기",
      kind: "review",
      left: {
        eyebrow: "실습 2. 메일 초안 확인하고 문제 찾기",
        title: "AI가 작성한 메일 초안 다듬기",
        paragraphs: [
          "AI가 만든 초안은 문장이 자연스러워 보여도 실제 업무 기준에는 맞지 않을 수 있습니다.",
          "잘못된 정보를 답변할 수도 있죠. 꼼꼼한 검토가 필요합니다.",
          "문제 문장을 확인하고, 조직 맥락도 프롬프트에 추가해 다시 요청해봅시다."
        ],
        bullets: [
          "6월 17일을 확정처럼 쓰면 위험 → ‘예상’ 또는 ‘현재 기준’으로 표현",
          "내부 공급 지연 사유를 고객에게 노출하면 안 됨",
          "우리 조직: 미확정 일정은 ‘예상 발송일’, 사과 1문장, 다음 확인 일정 포함"
        ]
      },
      bubbles: [
        {
          id: "r1",
          anchor: "ai-response",
          text: "AI가 만든 **1차 초안**입니다. 그대로 보내도 될지 먼저 읽어 보세요."
        },
        {
          id: "r2",
          anchor: "highlight-risk-1",
          text: "**「6월 17일로 발송됩니다」** — 아직 확정되지 않은 날짜를 단정했습니다. **「예상 발송일」**로 바꿔야 합니다."
        },
        {
          id: "r3",
          anchor: "highlight-risk-2",
          text: "**「공급사 재고 문제로」** — 내부 사유를 고객에게 노출했습니다. **사유는 일반화**하거나 빼야 합니다."
        },
        {
          id: "r4",
          anchor: "org-context-prompt",
          text: "프롬프트에 **조직 맥락**을 추가해 다시 요청합니다. 우리 회사 기준(예상일 표기, 내부 사유 비노출)이 반영된 2차 초안을 확인하세요."
        }
      ]
    },
    {
      id: "final",
      step: 4,
      title: "완성된 메일",
      kind: "final",
      left: {
        eyebrow: "결과",
        title: "보낼 수 있는 수준의 메일 초안",
        paragraphs: [
          "조직 맥락을 반영해 다듬은 최종 메일입니다. 실무에서는 이 단계에서 팀장 확인 또는 발송 전 체크리스트를 한 번 더 거칩니다."
        ],
        bullets: [
          "예상 발송일로 표기했는지 확인하세요. 확정되지 않은 날짜를 단정하지 않았는지 봅니다.",
          "내부 공급 지연 사유가 고객에게 노출되지 않았는지 확인하세요.",
          "사과 문장과 다음 확인 일정이 포함되었는지 점검합니다.",
          "고객사 내부 결재 일정(6/12)과의 관계가 한 줄이라도 언급되었는지 확인하세요."
        ]
      },
      bubbles: [
        {
          id: "f1",
          anchor: "final-guide",
          text: "**최종 메일 초안**입니다. AI가 만든 문장을 **조직 기준으로 검토·수정**한 결과물입니다."
        }
      ]
    }
  ]
};
