"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type ToolCallStatus = "pending" | "running" | "done" | "error";

export interface ToolCall {
  name: string;
  /** Rendered monospace beside the name — a path, query, or argument summary. */
  arg?: string;
  status?: ToolCallStatus;
  href?: string;
}

export interface ToolChipsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onToggle"> {
  calls?: ToolCall[];
  messageCount?: number;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ToolChips({
  calls = [],
  messageCount,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  className,
  ...props
}: ToolChipsProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;

  const toggle = () => {
    const next = !open;
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const summary = [
    `${calls.length} tool call${calls.length === 1 ? "" : "s"}`,
    messageCount != null
      ? `${messageCount} message${messageCount === 1 ? "" : "s"}`
      : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className={cn("w-full max-w-80 pb-1", className)} {...props}>
      <button
        type="button"
        aria-expanded={open}
        onClick={toggle}
        className="-mx-1.5 flex w-fit items-center gap-1.5 rounded-control px-1.5 py-1 text-[12.5px] text-ink-2 transition-colors duration-100 hover:bg-hover-2"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
        <span className="tabular-nums">{summary}</span>
      </button>

      <div
        className="grid transition-[grid-template-rows,opacity] duration-300"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
      >
        <div className="-mx-1 overflow-hidden px-1.5 pb-1">
          <div className="mt-1.5 flex flex-col gap-1">
            {calls.map((call, i) => (
              <ToolChip key={i} call={call} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolChip({ call }: { call: ToolCall }) {
  const status = call.status ?? "done";
  const Tag = call.href ? "a" : "div";

  return (
    <Tag
      {...(call.href ? { href: call.href } : {})}
      className="inline-flex h-7 max-w-full items-center gap-2 rounded-chip bg-surface px-2 font-mono text-[11.5px] text-ink shadow-btn transition-colors duration-100 hover:bg-hover"
    >
      <StatusDot status={status} />
      <span className="shrink-0">{call.name}</span>
      {call.arg ? (
        <span className="min-w-0 truncate text-ink-3">{call.arg}</span>
      ) : null}
    </Tag>
  );
}

function StatusDot({ status }: { status: ToolCallStatus }) {
  if (status === "running") {
    return (
      <span
        aria-label="running"
        className="size-1.5 shrink-0 rounded-full bg-bui-accent"
        style={{ animation: "bui-pixel-on 900ms ease-in-out infinite" }}
      />
    );
  }
  const tone =
    status === "error"
      ? "bg-red"
      : status === "pending"
        ? "bg-ink-3"
        : "bg-green";
  return (
    <span aria-label={status} className={cn("size-1.5 shrink-0 rounded-full", tone)} />
  );
}
