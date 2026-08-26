"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type ThinkingStepKind = "step" | "reasoning" | "search" | "code";

export interface ThinkingStep {
  kind?: ThinkingStepKind;
  label: string;
  detail?: string;
}

export interface ThinkingStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onToggle"> {
  label?: string;
  steps?: ThinkingStep[];
  /** Keep the shimmer running. Set false once the trace is complete. */
  active?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ThinkingState({
  label = "Thinking",
  steps = [],
  active = true,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  className,
  ...props
}: ThinkingStateProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;

  const toggle = () => {
    const next = !open;
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  return (
    <div
      className={cn("flex w-full max-w-95 flex-col", className)}
      style={{
        minHeight: 176,
        transition: "min-height 400ms var(--ease-out-strong)",
      }}
      {...props}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={toggle}
        className="-mx-1.5 flex w-fit items-center gap-2 rounded-control px-1.5 py-1 transition-colors duration-100 hover:bg-hover-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--ink-2)">
          <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
        </svg>

        <span role="status" className="contents">
          <span
            className={cn(
              "text-[13px] font-medium whitespace-nowrap",
              active ? "bg-clip-text text-transparent" : "text-ink",
            )}
            style={
              active
                ? {
                    backgroundImage:
                      "linear-gradient(90deg, var(--ink-3) 35%, var(--ink) 50%, var(--ink-3) 65%)",
                    backgroundSize: "200% 100%",
                    animation: "bui-shimmer-text 1.4s linear infinite",
                  }
                : undefined
            }
          >
            {label}
          </span>
        </span>

        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--ink-3)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* grid-rows 0fr→1fr animates height without measuring the content */}
      <div
        className="grid transition-[grid-template-rows,opacity] duration-400"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
          transitionTimingFunction: "var(--ease-out-strong)",
        }}
      >
        <div className="overflow-hidden">
          <div className="relative mt-1 ml-[5px] pl-4">
            {/* the rail draws itself downward as the trace opens */}
            <span
              aria-hidden="true"
              className="absolute left-[3px] w-px bg-line"
              style={{
                top: -8,
                height: open ? "100%" : 0,
                transition: "height 500ms var(--ease-out-strong)",
              }}
            />
            <div className="flex flex-col gap-1 py-1">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-0.5"
                  style={{
                    animation: open
                      ? `bui-fade-up 320ms var(--ease-out-strong) ${i * 45}ms both`
                      : undefined,
                  }}
                >
                  <span className="flex items-center gap-1.5 text-[12.5px] leading-[1.3] text-ink-2">
                    <StepGlyph kind={step.kind ?? "step"} />
                    {step.label}
                  </span>
                  {step.detail ? (
                    <span className="text-[12px] leading-[1.45] text-ink-3">
                      {step.detail}
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

function StepGlyph({ kind }: { kind: ThinkingStepKind }) {
  const common = {
    width: 12,
    height: 12,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--ink-3)",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "shrink-0",
  };

  if (kind === "search") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
    );
  }
  if (kind === "code") {
    return (
      <svg {...common}>
        <path d="M8 6l-5 6 5 6M16 6l5 6-5 6" />
      </svg>
    );
  }
  if (kind === "reasoning") {
    return (
      <svg {...common}>
        <path d="M12 3a6 6 0 0 1 3.5 10.9V17h-7v-3.1A6 6 0 0 1 12 3zM9.5 21h5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}
