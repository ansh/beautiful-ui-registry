"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language,
  filename,
  showLineNumbers = false,
  className,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const lines = React.useMemo(() => code.replace(/\n$/, "").split("\n"), [code]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard is unavailable over http or without permission — leave the
      // affordance in place rather than surfacing an error for a copy button
    }
  };

  return (
    <div
      className={cn(
        "group relative w-full overflow-hidden rounded-card bg-surface shadow-card",
        className,
      )}
      {...props}
    >
      {filename || language ? (
        <div className="flex items-center justify-between border-b border-line px-2.5 py-1.5">
          <span className="font-mono text-[11.5px] text-ink-2">
            {filename ?? language}
          </span>
          {filename && language ? (
            <span className="font-mono text-[11px] text-ink-3">{language}</span>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        aria-label={copied ? "Copied" : "Copy code"}
        onClick={copy}
        className="absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-control bg-surface text-ink-3 opacity-0 shadow-btn transition-[opacity,color,background-color] duration-150 group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-hover hover:text-ink"
      >
        {copied ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--green)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="12" height="12" rx="2.5" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>

      <pre className="overflow-x-auto p-2.5 font-mono text-[12px] leading-[1.6] text-ink">
        <code>
          {lines.map((line, i) => (
            <span key={i} className="block">
              {showLineNumbers ? (
                <span className="mr-3 inline-block w-6 shrink-0 text-right text-ink-3 tabular-nums select-none">
                  {i + 1}
                </span>
              ) : null}
              {line || " "}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
