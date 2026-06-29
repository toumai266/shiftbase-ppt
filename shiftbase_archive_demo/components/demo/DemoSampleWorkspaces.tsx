"use client";

import { ArrowRight, Clock3, Mail, Sparkles, Zap } from "lucide-react";
import { FinalSendChecklist, GmailComposeMock } from "@/components/demo/GmailUi";
import {
  CHATGPT_ATTACH_OPTIONS,
  ChatGPTAssistantMessage,
  ChatGPTComposer,
  ChatGPTEmptyState,
  ChatGPTShell,
  ChatGPTUserMessage
} from "@/components/demo/ChatGPTUi";
import type { DemoBubbleAnchor } from "@/lib/demo/sampleDemoTypes";

const ATTACH_OPTIONS = CHATGPT_ATTACH_OPTIONS;

const DEFAULT_PROMPT = `고객사 A 김OO 팀장에게 발송 지연 안내 메일 초안을 작성해 주세요.

[상황]
- 원래 발송 예정: 6월 10일
- 현재 예상 발송: 6월 17일 (공급 지연)
- 고객사 내부 결재 일정: 6월 12일

[톤]
- 정중하고 간결하게
- 사과 1문장 포함

[주의]
- 날짜는 확정처럼 쓰지 말 것
- 내부 공급사 정보는 넣지 말 것`;

const FIRST_AI_RESPONSE = `안녕하세요, 김팀장님.

요청하신 주문 건은 공급사 재고 문제로 인해 6월 17일로 발송됩니다.
불편을 드려 대단히 죄송합니다.

6월 10일 발송 예정이었으나 물류 일정이 변경되었습니다.
추가 문의 사항이 있으시면 편히 연락 주세요.

감사합니다.
운영팀 드림`;

const ORG_CONTEXT_PROMPT = `[조직 맥락 추가]
- 미확정 일정은 반드시 "예상 발송일"로 표기
- 내부 공급 지연 사유는 고객에게 노출하지 않음
- 사과 1문장 + 다음 확인 일정(6/14) 포함
- 고객사 6/12 결재 일정과의 관계 한 줄 언급

위 기준으로 1차 초안을 다시 작성해 주세요.`;

const IMPROVED_AI_RESPONSE = `안녕하세요, 김팀장님.

요청하신 주문 건의 예상 발송일은 6월 17일입니다.
일정 변경으로 불편을 드려 죄송합니다.

현재 물류 일정 조정 중이며, 6월 14일(금)까지 최종 발송 가능 여부를 다시 확인해 공유드리겠습니다.
귀사 6월 12일 결재 일정에 맞춰 필요한 자료가 있으면 말씀해 주세요.

감사합니다.
운영팀 드림`;

const FINAL_EMAIL_CHECKLIST = [
  "예상 발송일 표기",
  "내부 사유 비노출",
  "다음 확인 일정 포함",
  "고객 결재 일정 언급"
] as const;

type ChatPromptWorkspaceProps = {
  activeGuideAnchor?: DemoBubbleAnchor | null;
  attachedIds: string[];
  attachExplorerOpen: boolean;
  attachMenuOpen: boolean;
  onAttach: (id: string) => void;
  onAttachExplorerOpenChange: (open: boolean) => void;
  onAttachMenuOpenChange: (open: boolean) => void;
  onDetach: (id: string) => void;
  onGuideStepComplete: (anchor: DemoBubbleAnchor) => void;
  prompt: string;
  onPromptChange: (value: string) => void;
  sent: boolean;
  onSend: () => void;
};

export function MotivationWorkspace() {
  return (
    <div className="flex h-full min-h-[520px] items-center justify-center bg-[linear-gradient(160deg,#f8fafc_0%,#eef2ff_48%,#f8fafc_100%)] p-10">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">업무 시간 비교</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#111827]">같은 메일, 다른 방식</h2>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-4">
          <article
            className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.35)]"
            data-demo-anchor="motivation-card"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f5f9] text-[#64748b]">
                <Mail size={18} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">수동 작성</p>
                <p className="text-lg font-semibold text-[#111827]">꽤 오랜 시간</p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm text-[#64748b]">
              <Clock3 size={15} />
              <span>맥락 정리 · 표현 · 톤 · 상사 확인</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-[#64748b]">
              <li>문구를 여러 번 고치게 됩니다</li>
              <li>빠뜨린 정보가 없는지 반복 확인</li>
              <li>보내기 직전에도 불안함</li>
            </ul>
          </article>

          <div className="flex flex-col items-center justify-center px-1" data-demo-anchor="motivation-flow">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-[0_12px_30px_-12px_rgba(79,70,229,0.8)]">
              <ArrowRight size={18} />
            </div>
            <p className="mt-3 max-w-[88px] text-center text-xs font-semibold leading-5 text-primary">
              AI 초안 + 사람 검토
            </p>
          </div>

          <article
            className="rounded-2xl border border-[#c7d2fe] bg-[linear-gradient(145deg,#ffffff_0%,#eef2ff_100%)] p-6 shadow-[0_24px_60px_-36px_rgba(79,70,229,0.35)]"
            data-demo-anchor="motivation-ai"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                <Zap size={18} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">AI 활용</p>
                <p className="text-lg font-semibold text-[#111827]">훨씬 빠르게</p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm text-[#475569]">
              <Sparkles size={15} className="text-primary" />
              <span>AI 초안 + 검토로 단축</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-[#334155]">
              <li>AI가 첫 초안을 빠르게 작성</li>
              <li>사람은 보내도 되는지만 판단</li>
              <li>조직 기준에 맞게 다듬기</li>
            </ul>
          </article>
        </div>
      </div>
    </div>
  );
}

export function ChatPromptWorkspace({
  activeGuideAnchor = null,
  attachedIds,
  attachExplorerOpen,
  attachMenuOpen,
  onAttach,
  onAttachExplorerOpenChange,
  onAttachMenuOpenChange,
  onDetach,
  onGuideStepComplete,
  prompt,
  onPromptChange,
  sent,
  onSend
}: ChatPromptWorkspaceProps) {
  const attachments = attachedIds
    .map((id) => ATTACH_OPTIONS.find((item) => item.id === id))
    .filter((item): item is (typeof ATTACH_OPTIONS)[number] => Boolean(item))
    .map((item) => ({ id: item.id, label: item.label }));

  return (
    <ChatGPTShell
      composer={
        <ChatGPTComposer
          activeGuideAnchor={activeGuideAnchor}
          attachedIds={attachedIds}
          attachExplorerOpen={attachExplorerOpen}
          attachMenuOpen={attachMenuOpen}
          disabled={sent}
          onAttach={onAttach}
          onAttachExplorerOpenChange={onAttachExplorerOpenChange}
          onAttachMenuOpenChange={onAttachMenuOpenChange}
          onChange={onPromptChange}
          onDetach={onDetach}
          onGuideStepComplete={onGuideStepComplete}
          onSend={onSend}
          placeholder="ChatGPT에게 메시지 보내기"
          promptReadOnly
          value={prompt}
        />
      }
    >
      {sent ? (
        <>
          <ChatGPTUserMessage attachments={attachments}>{prompt}</ChatGPTUserMessage>
          <ChatGPTAssistantMessage anchor="ai-response">{FIRST_AI_RESPONSE}</ChatGPTAssistantMessage>
        </>
      ) : (
        <ChatGPTEmptyState />
      )}
    </ChatGPTShell>
  );
}

type ResponseReviewWorkspaceProps = {
  showImproved: boolean;
  onShowImproved: () => void;
};

export function ResponseReviewWorkspace({ showImproved, onShowImproved }: ResponseReviewWorkspaceProps) {
  void onShowImproved;

  return (
    <ChatGPTShell>
      <ChatGPTUserMessage speakerLabel="나">
        {DEFAULT_PROMPT}
      </ChatGPTUserMessage>

      <ChatGPTAssistantMessage anchor="ai-response" speakerLabel="ChatGPT">
        <p>안녕하세요, 김팀장님.</p>
        <p className="mt-4">
          요청하신 주문 건은{" "}
          <mark
            className="rounded bg-[#fecaca] px-0.5 text-[#991b1b]"
            data-demo-anchor="highlight-risk-2"
          >
            공급사 재고 문제로 인해
          </mark>{" "}
          <mark
            className="rounded bg-[#fde68a] px-0.5 text-[#92400e]"
            data-demo-anchor="highlight-risk-1"
          >
            6월 17일로 발송됩니다
          </mark>
          .
        </p>
        <p className="mt-4 whitespace-pre-wrap">불편을 드려 대단히 죄송합니다.{"\n\n"}6월 10일 발송 예정이었으나 물류 일정이 변경되었습니다.</p>
      </ChatGPTAssistantMessage>

      <ChatGPTUserMessage speakerLabel="나">
        <span data-demo-anchor="org-context-prompt">{ORG_CONTEXT_PROMPT}</span>
      </ChatGPTUserMessage>

      {showImproved ? (
        <ChatGPTAssistantMessage speakerLabel="ChatGPT">
          <p className="whitespace-pre-wrap">{IMPROVED_AI_RESPONSE}</p>
        </ChatGPTAssistantMessage>
      ) : null}
    </ChatGPTShell>
  );
}

export function FinalEmailWorkspace() {
  return (
    <div className="flex h-full min-h-0">
      <aside className="flex w-[360px] shrink-0 flex-col overflow-y-auto border-r border-[#e2e8f0] bg-[#f8fafc] px-6 pt-8">
        <div
          aria-hidden="true"
          className="min-h-[320px] shrink-0"
          data-demo-anchor="final-guide"
          data-demo-placement="center"
          data-demo-skip-highlight
        />
        <div className="px-6 pb-8 pt-2">
          <FinalSendChecklist items={FINAL_EMAIL_CHECKLIST} />
        </div>
      </aside>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-[#f1f3f4] p-6">
        <GmailComposeMock
          body={IMPROVED_AI_RESPONSE}
          subject="[고객사 A] 발송 지연 안내드립니다"
          to="김OO 팀장 <kim.teamlead@customer-a.com>"
        />
      </div>
    </div>
  );
}

export { DEFAULT_PROMPT };
