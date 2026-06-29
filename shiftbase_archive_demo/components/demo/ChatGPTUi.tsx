"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUp, FileText, Folder, HardDrive, Image, Plus, X } from "lucide-react";
import type { DemoBubbleAnchor } from "@/lib/demo/sampleDemoTypes";

const PROMPT_LINE_HEIGHT_PX = 24;
const PROMPT_MAX_LINES = 5;
const PROMPT_MAX_HEIGHT_PX = PROMPT_LINE_HEIGHT_PX * PROMPT_MAX_LINES;

function syncPromptTextareaHeight(textarea: HTMLTextAreaElement | null) {
  if (!textarea) return;
  textarea.style.height = "0px";
  const nextHeight = Math.min(textarea.scrollHeight, PROMPT_MAX_HEIGHT_PX);
  textarea.style.height = `${Math.max(PROMPT_LINE_HEIGHT_PX, nextHeight)}px`;
}

export const CHATGPT_ATTACH_OPTIONS = [
  { id: "customer-thread", label: "고객_김팀장_메일스레드.pdf", size: "24 KB" },
  { id: "internal-memo", label: "내부_발송일정_메모.txt", size: "3 KB" }
] as const;

type AttachFileOption = (typeof CHATGPT_ATTACH_OPTIONS)[number];

function DemoFileExplorerModal({
  files,
  onCancel,
  onConfirm,
  open
}: {
  files: readonly AttachFileOption[];
  onCancel: () => void;
  onConfirm: (ids: string[]) => void;
  open: boolean;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setSelectedIds([]);
    }
  }, [open]);

  if (!open) return null;

  function toggleFile(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/35 p-6">
      <div
        className="flex w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[#d1d5db] bg-[#f3f3f3] shadow-2xl"
        data-demo-anchor="file-explorer"
        role="dialog"
      >
        <div className="border-b border-[#d1d5db] bg-white px-4 py-3">
          <p className="text-sm font-semibold text-[#111827]">열기</p>
          <p className="mt-0.5 text-xs text-[#64748b]">업무 자료 폴더</p>
        </div>

        <div className="flex min-h-[280px]">
          <aside className="w-40 shrink-0 border-r border-[#d1d5db] bg-white p-2">
            <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#94a3b8]">빠른 액세스</p>
            <button
              className="mt-1 flex w-full items-center gap-2 rounded-md bg-[#eef2ff] px-2 py-2 text-left text-xs font-medium text-[#4338ca]"
              type="button"
            >
              <Folder size={14} />
              업무 자료
            </button>
            <button className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-[#475569] hover:bg-[#f8fafc]" type="button">
              <HardDrive size={14} />
              내 PC
            </button>
          </aside>

          <div className="min-w-0 flex-1 bg-white p-3">
            <div className="mb-2 rounded-md border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-xs text-[#64748b]">
              문서 &gt; 업무 자료 &gt; 발송 지연 안내
            </div>
            <div className="overflow-hidden rounded-lg border border-[#e2e8f0]">
              <div className="grid grid-cols-[1fr_72px] border-b border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-[11px] font-semibold text-[#64748b]">
                <span>이름</span>
                <span className="text-right">크기</span>
              </div>
              {files.map((file) => {
                const selected = selectedIds.includes(file.id);
                return (
                  <button
                    className={`grid w-full grid-cols-[1fr_72px] items-center border-b border-[#f1f5f9] px-3 py-2.5 text-left last:border-b-0 ${
                      selected ? "bg-[#eef2ff]" : "hover:bg-[#f8fafc]"
                    }`}
                    key={file.id}
                    onClick={() => toggleFile(file.id)}
                    type="button"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-sm text-[#111827]">
                      <FileText className="shrink-0 text-[#64748b]" size={16} />
                      <span className="truncate">{file.label}</span>
                    </span>
                    <span className="text-right text-xs text-[#94a3b8]">{file.size}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#d1d5db] bg-[#f3f3f3] px-4 py-3">
          <button
            className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm text-[#334155] hover:bg-[#f8fafc]"
            onClick={onCancel}
            type="button"
          >
            취소
          </button>
          <button
            className="rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:bg-[#93c5fd]"
            data-demo-anchor="file-explorer-open"
            disabled={selectedIds.length === 0}
            onClick={() => onConfirm(selectedIds)}
            type="button"
          >
            열기
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatGPTLogo({ size = 28 }: { size?: number }) {
  return (
    <svg aria-hidden="true" height={size} viewBox="0 0 41 41" width={size}>
      <path
        d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-7.794-3.48 10.078 10.078 0 0 0-9.555 6.886 9.967 9.967 0 0 0-6.664 4.835 10.079 10.079 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.964 9.964 0 0 0 7.794 3.48 10.079 10.079 0 0 0 9.555-6.886 9.965 9.965 0 0 0 6.664-4.835 10.079 10.079 0 0 0-1.24-11.817Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChatGPTShell({
  children,
  composer
}: {
  children: React.ReactNode;
  composer?: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-white text-[#0d0d0d]">
      <header className="flex shrink-0 items-center justify-center border-b border-[#ececec] px-4 py-3">
        <p className="text-[15px] font-semibold text-[#0d0d0d]">ChatGPT 실습 플레이어</p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

      {composer ? <div className="shrink-0 border-t border-[#ececec] bg-white px-4 pb-5 pt-3">{composer}</div> : null}
    </div>
  );
}

export function ChatGPTEmptyState() {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center px-6">
      <div className="text-[#0d0d0d]">
        <ChatGPTLogo size={32} />
      </div>
      <p className="mt-4 text-sm text-[#666]">무엇을 도와드릴까요?</p>
    </div>
  );
}

export function ChatGPTUserMessage({
  attachments,
  children,
  speakerLabel
}: {
  attachments?: Array<{ id: string; label: string }>;
  children: React.ReactNode;
  speakerLabel?: string;
}) {
  return (
    <div className="border-b border-[#ececec] bg-white py-6">
      <div className="mx-auto flex max-w-3xl gap-4 px-4 md:px-6">
        <div
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#5436da] text-xs font-semibold text-white"
        >
          나
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          {speakerLabel ? (
            <p className="mb-2 text-sm font-semibold text-[#0d0d0d]">{speakerLabel}</p>
          ) : null}
          {attachments?.length ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map((file) => (
                <div
                  className="inline-flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-[#f9f9f9] px-3 py-2"
                  key={file.id}
                >
                  <FileText className="text-[#666]" size={16} />
                  <span className="text-sm text-[#0d0d0d]">{file.label}</span>
                </div>
              ))}
            </div>
          ) : null}
          <div className="whitespace-pre-wrap text-[15px] leading-7 text-[#0d0d0d]">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function ChatGPTAssistantMessage({
  anchor,
  children,
  speakerLabel
}: {
  anchor?: string;
  children: React.ReactNode;
  speakerLabel?: string;
}) {
  return (
    <div className="border-b border-[#ececec] bg-[#f7f7f8] py-6" {...(anchor ? { "data-demo-anchor": anchor } : {})}>
      <div className="mx-auto flex max-w-3xl gap-4 px-4 md:px-6">
        <div aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center text-[#0d0d0d]">
          <ChatGPTLogo size={24} />
        </div>
        <div className="min-w-0 flex-1 pt-0.5 text-[15px] leading-7 text-[#0d0d0d]">
          {speakerLabel ? (
            <p className="mb-2 text-sm font-semibold text-[#0d0d0d]">{speakerLabel}</p>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}

type ChatGPTComposerProps = {
  activeGuideAnchor?: DemoBubbleAnchor | null;
  attachedIds: string[];
  attachExplorerOpen?: boolean;
  attachMenuOpen?: boolean;
  disabled?: boolean;
  onAttach: (id: string) => void;
  onAttachExplorerOpenChange?: (open: boolean) => void;
  onAttachMenuOpenChange?: (open: boolean) => void;
  onChange: (value: string) => void;
  onDetach: (id: string) => void;
  onGuideStepComplete?: (anchor: DemoBubbleAnchor) => void;
  onSend: () => void;
  placeholder?: string;
  promptReadOnly?: boolean;
  value: string;
};

export function ChatGPTComposer({
  activeGuideAnchor = null,
  attachedIds,
  attachExplorerOpen = false,
  attachMenuOpen = false,
  disabled = false,
  onAttach,
  onAttachExplorerOpenChange,
  onAttachMenuOpenChange,
  onChange,
  onDetach,
  onGuideStepComplete,
  onSend,
  placeholder = "메시지를 입력하세요",
  promptReadOnly = false,
  value
}: ChatGPTComposerProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const guideActive = activeGuideAnchor !== null;
  const canSend = Boolean(value.trim()) && !disabled && (!guideActive || activeGuideAnchor === "send-button");
  const canUseAttachButton = !guideActive || activeGuideAnchor === "attach-button";
  const canUseAttachMenu = !guideActive || activeGuideAnchor === "attach-menu-files";
  const canUseExplorer = !guideActive || activeGuideAnchor === "file-explorer";

  useLayoutEffect(() => {
    syncPromptTextareaHeight(textareaRef.current);
  }, [value]);

  function setMenuOpen(open: boolean) {
    onAttachMenuOpenChange?.(open);
  }

  function setExplorerOpen(open: boolean) {
    onAttachExplorerOpenChange?.(open);
  }

  function handleAttachButtonClick() {
    if (!canUseAttachButton) return;
    setMenuOpen(true);
    if (activeGuideAnchor === "attach-button") {
      onGuideStepComplete?.("attach-button");
    }
  }

  function handleAttachMenuClick() {
    if (!canUseAttachMenu) return;
    setMenuOpen(false);
    setExplorerOpen(true);
    if (activeGuideAnchor === "attach-menu-files") {
      onGuideStepComplete?.("attach-menu-files");
    }
  }

  function handleExplorerConfirm(ids: string[]) {
    if (!canUseExplorer) return;
    ids.forEach((id) => onAttach(id));
    setExplorerOpen(false);
    if (activeGuideAnchor === "file-explorer") {
      onGuideStepComplete?.("file-explorer");
    }
  }

  function handleExplorerCancel() {
    if (guideActive) return;
    setExplorerOpen(false);
  }

  function handleSendClick() {
    if (!canSend) return;
    onSend();
    if (activeGuideAnchor === "send-button") {
      onGuideStepComplete?.("send-button");
    }
  }

  return (
    <div className="relative mx-auto max-w-3xl">
      <DemoFileExplorerModal
        files={CHATGPT_ATTACH_OPTIONS}
        onCancel={handleExplorerCancel}
        onConfirm={handleExplorerConfirm}
        open={attachExplorerOpen}
      />

      {attachedIds.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-2 px-1" data-demo-anchor="attached-files">
          {attachedIds.map((id) => {
            const file = CHATGPT_ATTACH_OPTIONS.find((item) => item.id === id);
            if (!file) return null;
            return (
              <div
                className="inline-flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-[#f9f9f9] py-1.5 pl-3 pr-2"
                key={id}
              >
                <FileText className="text-[#666]" size={15} />
                <span className="max-w-[200px] truncate text-sm text-[#0d0d0d]">{file.label}</span>
                <button
                  aria-label={`${file.label} 제거`}
                  className="rounded-md p-1 text-[#666] hover:bg-[#ececec] disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={guideActive}
                  onClick={() => onDetach(id)}
                  type="button"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="relative flex items-end rounded-[28px] border border-[#e5e5e5] bg-[#f4f4f4] px-2 py-2 shadow-[0_0_0_1px_rgba(0,0,0,0.02)]">
        <div className="relative shrink-0" ref={menuRef}>
          <button
            aria-expanded={attachMenuOpen}
            aria-label="파일 첨부"
            className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full text-[#666] hover:bg-[#ececec] hover:text-[#0d0d0d] disabled:cursor-not-allowed disabled:opacity-40"
            data-demo-anchor="attach-button"
            disabled={!canUseAttachButton && guideActive}
            onClick={handleAttachButtonClick}
            type="button"
          >
            <Plus size={20} />
          </button>
          {attachMenuOpen ? (
            <div
              className="absolute bottom-11 left-0 z-10 min-w-[260px] overflow-hidden rounded-xl border border-[#e5e5e5] bg-white py-1 shadow-lg"
              data-demo-anchor="attach-menu"
            >
              <button
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#0d0d0d] hover:bg-[#f4f4f4] disabled:cursor-not-allowed disabled:opacity-40"
                data-demo-anchor="attach-menu-files"
                disabled={guideActive && activeGuideAnchor !== "attach-menu-files"}
                onClick={handleAttachMenuClick}
                type="button"
              >
                <Image className="shrink-0 text-[#666]" size={16} />
                <span>사진 및 파일 추가</span>
              </button>
            </div>
          ) : null}
        </div>

        <textarea
          ref={textareaRef}
          className="min-h-[24px] flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2 text-[15px] leading-6 text-[#0d0d0d] outline-none placeholder:text-[#999] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden read-only:cursor-default read-only:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
          data-demo-anchor="prompt-input"
          disabled={disabled}
          onChange={(event) => {
            if (!promptReadOnly) {
              onChange(event.target.value);
            }
          }}
          onKeyDown={(event) => {
            if (promptReadOnly) return;
            if (event.key === "Enter" && !event.shiftKey && canSend) {
              event.preventDefault();
              handleSendClick();
            }
          }}
          placeholder={placeholder}
          readOnly={promptReadOnly}
          rows={1}
          style={{ maxHeight: PROMPT_MAX_HEIGHT_PX }}
          value={value}
        />

        <button
          aria-label="전송"
          className="focus-ring mb-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0d0d0d] text-white transition disabled:bg-[#d1d1d1] disabled:text-[#f4f4f4]"
          data-demo-anchor="send-button"
          disabled={!canSend}
          onClick={handleSendClick}
          type="button"
        >
          <ArrowUp size={18} strokeWidth={2.5} />
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-[#999]">ChatGPT는 실수를 할 수 있습니다. 중요한 정보는 확인하세요.</p>
    </div>
  );
}
