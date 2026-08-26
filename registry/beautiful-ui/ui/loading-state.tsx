"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// The nine cells fire on a 90ms stagger, but not in reading order — the
// out-of-sequence delays are what make it read as computation rather than
// a progress bar.
const PIXEL_DELAYS = [90, 180, 270, 0, 90, 180, 90, 180, 270];

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Shimmering label. Swap it per phase — "Churning", "Indexing", "Compiling". */
  label?: string;
  /** Show elapsed seconds beside the label. */
  elapsed?: boolean;
  /** Freeze the animation and the timer. */
  paused?: boolean;
}

export function LoadingState({
  label = "Churning",
  elapsed = true,
  paused = false,
  className,
  ...props
}: LoadingStateProps) {
  const seconds = useElapsedSeconds(paused);

  return (
    <div
      role="status"
      className={cn("flex w-fit items-center gap-2.5", className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className="grid shrink-0 grid-cols-[repeat(3,4px)] gap-[1.5px]"
      >
        {PIXEL_DELAYS.map((delay, i) => (
          <span
            key={i}
            className="size-[4px] rounded-[1px] bg-ink"
            style={{
              opacity: 0.15,
              animation: paused
                ? undefined
                : `bui-pixel-on 650ms ease-in-out ${delay}ms infinite`,
            }}
          />
        ))}
      </span>

      <span
        className="bg-clip-text text-[13px] font-medium text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--ink-3) 35%, var(--ink) 50%, var(--ink-3) 65%)",
          backgroundSize: "200% 100%",
          animation: paused ? undefined : "bui-shimmer-text 1.4s linear infinite",
        }}
      >
        {label}
      </span>

      {elapsed ? (
        <span className="font-mono text-[12px] text-ink-3 tabular-nums">
          {seconds.toFixed(1)}s
        </span>
      ) : null}
    </div>
  );
}

function useElapsedSeconds(paused: boolean) {
  const [seconds, setSeconds] = React.useState(0);

  React.useEffect(() => {
    if (paused) return;
    const started = performance.now() - seconds * 1000;
    let frame = 0;
    // rAF rather than setInterval so the tenths never visibly stutter or drift
    const tick = () => {
      setSeconds((performance.now() - started) / 1000);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  return seconds;
}
