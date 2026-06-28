/**
 * Aurora / mesh-gradient blobs: cyan → blue → violet, heavily blurred, low
 * opacity, drifting very slowly (60s+, see globals.css). Sits behind everything
 * and must never compete with text.
 */
export function AuroraField() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* Cyan — upper left, behind the hero */}
      <div
        className="aurora-blob aurora-1"
        style={{
          top: "-14%",
          left: "-8%",
          width: "54vw",
          height: "54vw",
          background:
            "radial-gradient(circle at center, var(--grad-cyan) 0%, transparent 68%)",
          opacity: 0.4,
        }}
      />
      {/* Blue — upper right */}
      <div
        className="aurora-blob aurora-2"
        style={{
          top: "-2%",
          right: "-12%",
          width: "48vw",
          height: "48vw",
          background:
            "radial-gradient(circle at center, var(--grad-blue) 0%, transparent 70%)",
          opacity: 0.34,
        }}
      />
      {/* Violet — lower center, keeps the field asymmetric */}
      <div
        className="aurora-blob aurora-3"
        style={{
          top: "34%",
          left: "28%",
          width: "44vw",
          height: "44vw",
          background:
            "radial-gradient(circle at center, var(--grad-violet) 0%, transparent 72%)",
          opacity: 0.28,
        }}
      />
    </div>
  );
}
