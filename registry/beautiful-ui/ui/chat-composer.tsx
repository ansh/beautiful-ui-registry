"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatTab {
  id: string;
  label: string;
  messages: ChatMessage[];
}

export interface ChatComposerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  tabs: ChatTab[];
  defaultTabId?: string;
  placeholder?: string;
  onSubmit?: (tabId: string, value: string) => void;
}

/** Tabbed chat panel — thread switcher, transcript, and inline composer. */
export function ChatComposer({
  tabs,
  defaultTabId,
  placeholder = "Reply…",
  onSubmit,
  className,
  ...props
}: ChatComposerProps) {
  const [activeId, setActiveId] = React.useState(defaultTabId ?? tabs[0]?.id);
  const [value, setValue] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  React.useEffect(() => {
    // pin to the newest message whenever the thread or its contents change
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeId, active?.messages.length]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || !active) return;
    onSubmit?.(active.id, trimmed);
    setValue("");
  };

  return (
    <div
      className={cn(
        "flex h-[288px] w-full max-w-95 flex-col self-start overflow-hidden rounded-[14px] bg-surface shadow-card",
        className,
      )}
      {...props}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-line p-1.5">
        <div className="flex items-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={tab.id === active?.id}
              onClick={() => setActiveId(tab.id)}
              className={cn(
                "rounded-[6px] px-2 py-[3px] text-[13px] text-ink transition-[background-color,opacity] duration-100",
                tab.id === active?.id
                  ? "bg-field"
                  : "opacity-50 hover:opacity-75",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <PanelIcon label="Search" path="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5" />
          <PanelIcon label="History" path="M12 7v5l3 2M21 12a9 9 0 1 1-9-9" />
          <PanelIcon label="More" path="M12 5h.01M12 12h.01M12 19h.01" />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2.5 py-2">
        <div className="flex flex-col gap-2.5">
          {active?.messages.map((message, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] text-[13px] leading-relaxed",
                message.role === "user"
                  ? "self-end rounded-[12px] bg-field px-2.5 py-1.5 text-ink"
                  : "self-start text-ink",
              )}
            >
              {message.content}
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 p-1.5">
        <div className="flex items-center gap-1 rounded-[10px] bg-inset p-1 shadow-hairline transition-shadow duration-200 focus-within:shadow-btn">
          <input
            value={value}
            placeholder={placeholder}
            aria-label="Message"
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            className="ml-1.5 min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3"
          />
          <button
            type="button"
            aria-label="Send"
            onClick={submit}
            disabled={!value.trim()}
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-surface transition-[opacity,transform] duration-200 active:scale-[0.94] disabled:opacity-30"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function PanelIcon({ label, path }: { label: string; path: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-6 items-center justify-center rounded-[6px] text-ink-3 transition-colors duration-100 hover:bg-hover hover:text-ink-2"
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
        <path d={path} />
      </svg>
    </button>
  );
}
