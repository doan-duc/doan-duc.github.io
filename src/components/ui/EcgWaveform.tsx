/**
 * Subtle ECG/PPG waveform SVG decoration.
 * Rendered as a seamless, transform-animated pair of waveform paths.
 * Server-safe (no "use client" needed — pure JSX).
 */
export function EcgWaveform({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  // Each "beat" ≈ 100 SVG units: flat → P wave → flat → QRS → flat → T wave → flat
  const beat =
    "l20,0 l3,-5 l3,10 l3,-5 l14,0 l3,-19 l3,38 l3,-19 l18,0 l4,-8 l4,16 l4,-8 l18,0";
  const d = `M0,25 ${beat} ${beat} ${beat} ${beat} ${beat}`;

  return (
    <svg
      className={className}
      viewBox="0 0 500 50"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g
        className="ecg-animate"
        style={delay ? { animationDelay: `${delay}s` } : undefined}
      >
        <path d={d} className="ecg-line" />
        <path d={d} className="ecg-line" transform="translate(500 0)" />
      </g>
    </svg>
  );
}
