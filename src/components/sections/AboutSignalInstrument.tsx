"use client";

import { TiltCard } from "@/components/motion/TiltCard";

const signalLayers = [
  { id: "signal", label: "Signal", action: "Sense" },
  { id: "intelligence", label: "Intelligence", action: "Learn" },
  { id: "system", label: "System", action: "Deploy" },
] as const;

const instrumentSpring = {
  stiffness: 105,
  damping: 20,
  mass: 0.7,
};

/** A compact visual model of the portfolio's signal-to-system through-line. */
export function AboutSignalInstrument() {
  return (
    <div
      data-about-signal-stack="spring-3d"
      className="about-signal-instrument"
    >
      <TiltCard
        className="about-signal-tilt"
        max={4}
        hoverScale={1.012}
        spring={instrumentSpring}
      >
        <div
          className="about-signal-stage"
          role="img"
          aria-label="A signal becomes intelligence, then a deployable system"
        >
          <svg
            className="about-signal-trace"
            viewBox="0 0 340 248"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="about-signal-gradient"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0" stopColor="#22d3ee" stopOpacity="0.15" />
                <stop offset="0.55" stopColor="#22d3ee" stopOpacity="0.9" />
                <stop offset="1" stopColor="#3b82f6" stopOpacity="0.45" />
              </linearGradient>
            </defs>
            <path
              className="about-signal-trace-base"
              d="M24 48 C92 48 72 124 146 124 S202 200 306 200"
            />
            <path
              className="about-signal-trace-flow"
              d="M24 48 C92 48 72 124 146 124 S202 200 306 200"
            />
          </svg>

          {signalLayers.map((layer) => (
            <div
              key={layer.id}
              data-about-layer={layer.id}
              className={`about-signal-layer about-signal-layer--${layer.id}`}
            >
              <span className="about-signal-layer-label">{layer.label}</span>
              <span className="about-signal-layer-action">
                {layer.action}
                <span aria-hidden="true">↗</span>
              </span>
            </div>
          ))}
        </div>
      </TiltCard>
    </div>
  );
}
