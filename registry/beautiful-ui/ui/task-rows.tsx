"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type TaskStatus = "queued" | "running" | "completed" | "failed";

export interface TaskDetail {
  label: string;
  value?: string;
}

export interface Task {
  title: string;
  /** Right-aligned count or summary, e.g. "12 suppliers". */
  meta?: string;
  status?: TaskStatus;
  details?: TaskDetail[];
}

export interface TaskRowsProps extends React.HTMLAttributes<HTMLDivElement> {
  tasks: Task[];
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  queued: "Queued",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
};

const STATUS_PILL: Record<TaskStatus, string> = {
  queued: "bg-inset text-ink-3 shadow-hairline",
  running: "bg-accent-tint text-accent-ink",
  completed: "bg-green-tint text-green",
  failed: "bg-red-tint text-red",
};

export function TaskRows({ tasks, className, ...props }: TaskRowsProps) {
  return (
    <div
      className={cn("flex w-full max-w-110 flex-col gap-2", className)}
      {...props}
    >
      {tasks.map((task, i) => (
        <TaskRow key={i} task={task} index={i} />
      ))}
    </div>
  );
}

function TaskRow({ task, index }: { task: Task; index: number }) {
  const [open, setOpen] = React.useState(false);
  const status = task.status ?? "queued";
  const hasDetails = (task.details?.length ?? 0) > 0;

  return (
    <div
      className="self-stretch overflow-hidden bg-surface shadow-card transition-[border-radius,background-color] duration-300 hover:bg-inset"
      style={{
        // pill when closed, card when open
        borderRadius: open ? 14 : 22,
        animation: `bui-fade-up 450ms var(--ease-out-strong) ${index * 60}ms both`,
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        disabled={!hasDetails}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center gap-2.5 px-2.5 text-left"
      >
        <span className="flex size-6 shrink-0 items-center justify-center">
          <StatusGlyph status={status} />
        </span>

        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">
          {task.title}
        </span>

        {task.meta ? (
          <span className="shrink-0 text-[12.5px] text-ink-2 tabular-nums">
            {task.meta}
          </span>
        ) : null}

        <span
          className={cn(
            "inline-flex h-5.5 shrink-0 items-center rounded-full px-2 text-[11.5px] font-medium",
            STATUS_PILL[status],
          )}
        >
          {STATUS_LABEL[status]}
        </span>

        <span
          aria-hidden="true"
          className="-ml-2 flex size-7 shrink-0 items-center justify-center rounded-full text-ink-3"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 300ms var(--ease-out-strong)",
            opacity: hasDetails ? 1 : 0,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows,opacity] duration-300"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
          transitionTimingFunction: "var(--ease-out-strong)",
        }}
      >
        <div className="overflow-hidden">
          <div className="mb-2.5 grid grid-cols-[24px_1fr] gap-2.5 px-2.5">
            <span aria-hidden="true" className="mx-auto h-full w-px bg-line" />
            <div className="flex flex-col gap-1.5">
              {task.details?.map((detail, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <span className="text-[12px] text-ink-2">{detail.label}</span>
                  {detail.value ? (
                    <span className="shrink-0 font-mono text-[11.5px] text-ink-3 tabular-nums">
                      {detail.value}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusGlyph({ status }: { status: TaskStatus }) {
  if (status === "queued") {
    return (
      <span className="size-5.5 shrink-0 rounded-full shadow-[inset_0_0_0_1.5px_var(--line-strong)]" />
    );
  }

  if (status === "running") {
    return (
      <span className="flex size-5.5 shrink-0 items-center justify-center rounded-full bg-accent-tint">
        <span
          className="size-2 rounded-full bg-accent"
          style={{ animation: "bui-pixel-on 900ms ease-in-out infinite" }}
        />
      </span>
    );
  }

  const failed = status === "failed";
  return (
    <span
      className={cn(
        "flex size-5.5 shrink-0 items-center justify-center rounded-full text-white",
        failed ? "bg-red" : "bg-green",
      )}
      style={{ animation: "bui-pop-in 300ms var(--ease-out-strong) both" }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={failed ? "M18 6L6 18M6 6l12 12" : "M20 6L9 17l-5-5"} />
      </svg>
    </span>
  );
}
