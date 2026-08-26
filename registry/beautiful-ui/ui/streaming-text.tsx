"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface StreamingTextProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onEnded"> {
  text: string;
  /** Characters per second. Set 0 to render the whole string immediately. */
  speed?: number;
  /** Action row fades in once the stream finishes. */
  actions?: boolean;
  onCopy?: () => void;
  onRetry?: () => void;
  onVote?: (vote: "up" | "down") => void;
  onEnded?: () => void;
}

export function StreamingText({
  text,
  speed = 220,
  actions = true,
  onCopy,
  onRetry,
  onVote,
  onEnded,
  className,
  ...props
}: StreamingTextProps) {
  const visible = useStreamedLength(text, speed, onEnded);
  const done = visible >= text.length;

  return (
    <div className={cn("min-h-[15.5rem] w-full max-w-95", className)} {...props}>
      <p className="text-[13px] leading-relaxed text-ink">
        {text.slice(0, visible)}
        {!done ? (
          <span
            className="ml-0.5 inline-block h-3 w-0.5 translate-y-0.5 rounded-full bg-ink"
            style={{ animation: "bui-caret 1s step-end infinite" }}
          />
        ) : null}
      </p>

      {actions ? (
        <div
          className="mt-2 flex items-center gap-0.5 transition-opacity duration-400"
          style={{
            opacity: done ? 1 : 0,
            pointerEvents: done ? "auto" : "none",
          }}
        >
          <ActionButton label="Copy" onClick={onCopy}>
            <g>
              <rect x="9" y="9" width="12" height="12" rx="2.5" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </g>
          </ActionButton>

          <ActionButton label="Retry" onClick={onRetry}>
            <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
          </ActionButton>

          <ActionButton label="Good response" onClick={() => onVote?.("up")}>
            <path d="M7 10v12M15 5.88L14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88z" />
          </ActionButton>

          <ActionButton label="Bad response" onClick={() => onVote?.("down")}>
            <path d="M17 14V2M9 18.12L10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88z" />
          </ActionButton>
        </div>
      ) : null}
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-6 items-center justify-center rounded-[6px] text-ink-3 transition-colors duration-100 hover:bg-hover-2 hover:text-ink-2"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </button>
  );
}

function useStreamedLength(
  text: string,
  speed: number,
  onEnded?: () => void,
) {
  const [visible, setVisible] = React.useState(speed > 0 ? 0 : text.length);
  const endedRef = React.useRef(false);

  React.useEffect(() => {
    endedRef.current = false;
    if (speed <= 0) {
      setVisible(text.length);
      return;
    }
    setVisible(0);
    const started = performance.now();
    let frame = 0;
    // advance off elapsed time, not a fixed tick, so slow frames don't slow the stream
    const tick = () => {
      const chars = Math.floor(((performance.now() - started) / 1000) * speed);
      const next = Math.min(chars, text.length);
      setVisible(next);
      if (next < text.length) {
        frame = requestAnimationFrame(tick);
      } else if (!endedRef.current) {
        endedRef.current = true;
        onEnded?.();
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed]);

  return visible;
}
