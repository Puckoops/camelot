import { Tick02Icon } from "@hugeicons/core-free-icons";
import type { ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { Icon } from "../Icon/Icon";
import styles from "./Stepper.module.css";

export interface StepperStep {
  label: ReactNode;
  description?: ReactNode;
}

export interface StepperProps {
  steps: StepperStep[];
  /** Index of the step in progress. Steps before it read as done; steps.length marks the whole flow done. */
  current: number;
  /** Makes finished steps buttons that report their index. */
  onStepClick?: (index: number) => void;
  "aria-label"?: string;
  className?: string;
}

type StepState = "complete" | "current" | "upcoming";

const stateText: Record<StepState, string> = { complete: "done", current: "current step", upcoming: "not started" };

/** A horizontal row of named steps: a check when done, an ink ring on the current one, a number for the rest. */
export function Stepper({ steps, current, onStepClick, className, "aria-label": ariaLabel = "Progress" }: StepperProps) {
  return (
    <ol className={cn(styles.stepper, className)} aria-label={ariaLabel}>
      {steps.map((step, i) => {
        const state: StepState = i < current ? "complete" : i === current ? "current" : "upcoming";
        const marker = (
          <span className={cn("num-sm", styles.marker)} aria-hidden="true">
            {state === "complete" ? <Icon icon={Tick02Icon} size={14} strokeWidth={2} /> : i + 1}
          </span>
        );
        const text = (
          <span className={styles.text}>
            <span className={styles.label}>{step.label}</span>
            {step.description && <span className={cn("caption", styles.description)}>{step.description}</span>}
            <span className="visually-hidden">, {stateText[state]}</span>
          </span>
        );
        const clickable = onStepClick && state === "complete";
        return (
          <li key={i} className={cn(styles.step, styles[state])} aria-current={state === "current" ? "step" : undefined}>
            {clickable ? (
              <button type="button" className={styles.button} onClick={() => onStepClick(i)}>
                {marker}
                {text}
              </button>
            ) : (
              <span className={styles.content}>
                {marker}
                {text}
              </span>
            )}
            {i < steps.length - 1 && <span className={styles.connector} aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
