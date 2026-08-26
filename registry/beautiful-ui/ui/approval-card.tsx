"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface ApprovalQuestion {
  question: string;
  options: string[];
  /** Allow more than one option per question. */
  multiple?: boolean;
}

export interface ApprovalCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  questions: ApprovalQuestion[];
  submitLabel?: string;
  onSubmit?: (answers: string[][]) => void;
  onDismiss?: () => void;
}

/**
 * Human-in-the-loop prompt. Questions advance one at a time on a vertical
 * glide, so the card height never jumps between steps.
 */
export function ApprovalCard({
  questions,
  submitLabel = "Send",
  onSubmit,
  onDismiss,
  className,
  ...props
}: ApprovalCardProps) {
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<string[][]>(() =>
    questions.map(() => []),
  );

  const current = questions[index];
  const isLast = index === questions.length - 1;
  const canAdvance = (answers[index]?.length ?? 0) > 0;

  const select = (option: string) => {
    setAnswers((prev) => {
      const next = prev.map((a) => [...a]);
      const picked = next[index];
      if (current.multiple) {
        const at = picked.indexOf(option);
        if (at >= 0) picked.splice(at, 1);
        else picked.push(option);
      } else {
        next[index] = [option];
      }
      return next;
    });
  };

  const advance = () => {
    if (!canAdvance) return;
    if (isLast) onSubmit?.(answers);
    else setIndex((i) => i + 1);
  };

  return (
    <div className={cn("w-full max-w-80", className)} {...props}>
      <div
        className="relative overflow-hidden rounded-card bg-surface shadow-card"
        style={{ animation: "bui-fade-up 380ms var(--ease-out-strong) both" }}
      >
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="absolute top-2.5 right-2.5 z-10 flex size-6 items-center justify-center rounded-[6px] text-ink-3 transition-colors duration-100 hover:bg-hover hover:text-ink"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="p-3.5">
          <div className="overflow-hidden" aria-live="polite">
            {/* whole stack slides; only the active question is opaque */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 26,
                transform: `translate3d(0, calc(${-index} * (100% + 26px)), 0)`,
                transition: "transform 420ms var(--ease-out-strong)",
                willChange: "transform",
              }}
            >
              {questions.map((q, qi) => (
                <div
                  key={qi}
                  style={{
                    opacity: qi === index ? 1 : 0,
                    transition: "opacity 220ms ease",
                  }}
                  aria-hidden={qi !== index}
                >
                  <div className="pr-7 text-[14px] font-medium text-ink">
                    {q.question}
                  </div>
                  <GlideMenu
                    options={q.options}
                    selected={answers[qi] ?? []}
                    multiple={q.multiple}
                    disabled={qi !== index}
                    onSelect={select}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5">
            <span className="font-mono text-[11.5px] text-ink-3 tabular-nums">
              {index + 1}/{questions.length}
            </span>
            <button
              type="button"
              onClick={advance}
              disabled={!canAdvance}
              className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-[7px] text-[13px] leading-none text-canvas transition-opacity duration-150 hover:opacity-90 disabled:opacity-30"
            >
              {isLast ? submitLabel : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GlideMenu({
  options,
  selected,
  multiple,
  disabled,
  onSelect,
}: {
  options: string[];
  selected: string[];
  multiple?: boolean;
  disabled?: boolean;
  onSelect: (option: string) => void;
}) {
  const listRef = React.useRef<HTMLDivElement>(null);
  const [rect, setRect] = React.useState<{ top: number; height: number } | null>(
    null,
  );

  // one shared pill tracks the hovered row rather than each row painting its own
  const track = (event: React.PointerEvent | React.FocusEvent) => {
    const row = event.currentTarget as HTMLElement;
    const list = listRef.current;
    if (!list) return;
    setRect({ top: row.offsetTop, height: row.offsetHeight });
  };

  return (
    <div
      ref={listRef}
      className="relative mt-2.5 flex flex-col gap-1"
      onPointerLeave={() => setRect(null)}
      onBlur={() => setRect(null)}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 rounded-control bg-hover"
        style={{
          top: rect?.top ?? 0,
          height: rect?.height ?? 0,
          opacity: rect ? 1 : 0,
          transition:
            "top 220ms var(--ease-out-strong), height 220ms var(--ease-out-strong), opacity 150ms ease",
        }}
      />

      {options.map((option) => {
        const on = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={on}
            disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            onPointerEnter={track}
            onFocus={track}
            onClick={() => onSelect(option)}
            className="relative z-10 flex items-center gap-1.5 rounded-control py-1 pr-2 pl-1 text-left transition-colors duration-100"
          >
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center transition-colors duration-200",
                multiple ? "rounded-[5px]" : "rounded-full",
                on
                  ? "bg-ink text-canvas shadow-none"
                  : "text-transparent shadow-[inset_0_0_0_1.5px_var(--line-strong)]",
              )}
            >
              <span
                className="size-1.5 rounded-full bg-canvas transition-transform duration-200"
                style={{ transform: on ? "scale(1)" : "scale(0)" }}
              />
            </span>
            <span
              className={cn(
                "text-[13px] leading-none transition-colors duration-200",
                on ? "text-ink" : "text-ink-2",
              )}
            >
              {option}
            </span>
          </button>
        );
      })}
    </div>
  );
}
