"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface PromptBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  placeholder?: string;
  model?: string;
  models?: string[];
  /** Grow the textarea up to this many rows before it scrolls. */
  maxRows?: number;
  busy?: boolean;
  onSubmit?: (value: string) => void;
  onModelChange?: (model: string) => void;
  onAttach?: () => void;
  onDictate?: () => void;
}

export function PromptBar({
  placeholder = "Write a message…",
  model = "Vanilla 1",
  models = [],
  maxRows = 8,
  busy = false,
  onSubmit,
  onModelChange,
  onAttach,
  onDictate,
  className,
  ...props
}: PromptBarProps) {
  const [value, setValue] = React.useState("");
  const [menuOpen, setMenuOpen] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useAutoGrow(textareaRef, value, maxRows);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || busy) return;
    onSubmit?.(trimmed);
    setValue("");
  };

  return (
    <div className={cn("relative w-full max-w-105", className)} {...props}>
      <div className="relative isolate flex flex-col gap-1.5 overflow-hidden rounded-[14px] border border-line bg-surface p-1.5 shadow-card transition-[border-color,border-radius] duration-150 focus-within:border-line-strong">
        <div className="grid grid-cols-[28px_minmax(0,1fr)_auto_28px_28px] items-end gap-x-1 gap-y-1.5">
          <button
            type="button"
            aria-label="Add attachments and sources"
            onClick={onAttach}
            className="col-start-1 row-start-1 flex size-7 shrink-0 items-center justify-center justify-self-start rounded-[8px] text-ink-3 transition-[background-color,color,transform] duration-150 hover:bg-hover hover:text-ink active:scale-[0.94]"
          >
            <Icon path="M12 5v14M5 12h14" />
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            placeholder={placeholder}
            aria-label="Prompt"
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends; Shift+Enter is a newline
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            className="col-start-2 row-start-1 min-h-7 w-full min-w-0 resize-none bg-transparent px-1 py-[5px] text-[13px] leading-[18px] text-ink outline-none [overflow-wrap:anywhere] placeholder:text-ink-3"
          />

          <div className="relative col-start-3 row-start-1">
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-label="Choose model"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-7 shrink-0 items-center gap-1 rounded-[8px] px-1.5 text-[12px] font-medium text-ink-2 transition-colors duration-150 hover:bg-hover hover:text-ink"
            >
              {model}
              <span className="text-ink-3">
                <Icon path="M6 9l6 6 6-6" size={12} width={2.2} />
              </span>
            </button>

            {menuOpen && models.length > 0 ? (
              <div className="absolute right-0 bottom-full z-30 mb-1.5 w-[180px] rounded-[12px] bg-surface p-1.5 shadow-overlay">
                {models.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      onModelChange?.(m);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-[6px] px-1.5 py-1 text-left text-[12px] text-ink-2 transition-colors duration-150 hover:bg-hover hover:text-ink"
                  >
                    {m}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            aria-label="Start dictation"
            onClick={onDictate}
            className="col-start-4 row-start-1 flex size-7 shrink-0 items-center justify-center rounded-[8px] text-ink-3 transition-[background-color,color,transform] duration-150 hover:bg-hover hover:text-ink active:scale-[0.94]"
          >
            <Icon path="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM19 11a7 7 0 0 1-14 0M12 18v3" />
          </button>

          <button
            type="button"
            aria-label={busy ? "Stop" : "Send"}
            onClick={submit}
            disabled={!busy && !value.trim()}
            className="col-start-5 row-start-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-surface transition-[opacity,transform] duration-200 active:scale-[0.94] disabled:opacity-30"
          >
            {busy ? (
              <span className="size-2.5 rounded-[2px] bg-surface" />
            ) : (
              <Icon path="M12 19V5M5 12l7-7 7 7" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Icon({
  path,
  size = 15,
  width = 1.8,
}: {
  path: string;
  size?: number;
  width?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

function useAutoGrow(
  ref: React.RefObject<HTMLTextAreaElement | null>,
  value: string,
  maxRows: number,
) {
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // reset first so the box can shrink as well as grow
    el.style.height = "auto";
    const lineHeight = 18;
    const max = lineHeight * maxRows;
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [ref, value, maxRows]);
}
