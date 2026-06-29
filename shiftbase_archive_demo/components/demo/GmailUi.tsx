"use client";

import { Minus, MoreVertical, Paperclip, Send, Trash2, X } from "lucide-react";

type GmailComposeMockProps = {
  body: string;
  subject: string;
  to: string;
};

export function GmailComposeMock({ body, subject, to }: GmailComposeMockProps) {
  return (
    <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-xl border border-[#dadce0] bg-white shadow-[0_8px_24px_rgba(60,64,67,0.15)]">
      <header className="flex items-center justify-between border-b border-[#dadce0] bg-[#f2f6fc] px-4 py-2.5">
        <p className="text-sm font-medium text-[#3c4043]">새 메일</p>
        <div className="flex items-center gap-1 text-[#5f6368]">
          <button aria-label="최소화" className="rounded p-1.5 hover:bg-[#e8eaed]" type="button">
            <Minus size={16} />
          </button>
          <button aria-label="더보기" className="rounded p-1.5 hover:bg-[#e8eaed]" type="button">
            <MoreVertical size={16} />
          </button>
          <button aria-label="닫기" className="rounded p-1.5 hover:bg-[#e8eaed]" type="button">
            <X size={16} />
          </button>
        </div>
      </header>

      <div className="border-b border-[#eceff1] px-4 py-2.5">
        <div className="flex items-center gap-3 text-sm">
          <span className="w-14 shrink-0 text-[#5f6368]">받는 사람</span>
          <span className="min-w-0 flex-1 text-[#202124]">{to}</span>
        </div>
      </div>

      <div className="border-b border-[#eceff1] px-4 py-2.5">
        <div className="flex items-center gap-3 text-sm">
          <span className="w-14 shrink-0 text-[#5f6368]">제목</span>
          <span className="min-w-0 flex-1 font-medium text-[#202124]">{subject}</span>
        </div>
      </div>

      <div
        className="min-h-[320px] whitespace-pre-wrap px-4 py-4 text-sm leading-7 text-[#202124]"
        data-demo-anchor="final-email"
      >
        {body}
      </div>

      <footer className="flex items-center justify-between border-t border-[#eceff1] px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-full bg-[#0b57d0] px-5 py-2 text-sm font-medium text-white hover:bg-[#0842a0]"
            type="button"
          >
            <Send size={15} />
            보내기
          </button>
          <button aria-label="서식" className="rounded p-2 text-[#5f6368] hover:bg-[#f1f3f4]" type="button">
            <span className="text-sm font-serif">A</span>
          </button>
          <button aria-label="첨부" className="rounded p-2 text-[#5f6368] hover:bg-[#f1f3f4]" type="button">
            <Paperclip size={18} />
          </button>
          <button aria-label="삭제" className="rounded p-2 text-[#5f6368] hover:bg-[#f1f3f4]" type="button">
            <Trash2 size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
}

export function FinalSendChecklist({ items }: { items: readonly string[] }) {
  return (
    <section className="rounded-2xl border border-[#dbeafe] bg-white p-4 shadow-sm">
      <header className="mb-3 border-b border-[#e2e8f0] pb-3">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">발송 전 체크리스트</p>
        <p className="mt-1 text-xs leading-5 text-[#64748b]">보내기 전에 아래 항목을 확인하세요.</p>
      </header>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            className="flex items-start gap-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-sm leading-6 text-[#334155]"
            key={item}
          >
            <span
              aria-hidden="true"
              className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[#cbd5e1] bg-white"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
