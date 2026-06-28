/**
 * Aurora / mesh-gradient blobs. Heavy blur + screen blend on the near-black
 * base reads as a premium light field. Drift animation lives in globals.css
 * (.aurora-1/2/3). Tune colors/positions here.
 *
 * 👉 The first blob uses the accent. Change the accent in globals.css (@theme).
 */
export function AuroraField() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* Accent glow — sits behind the hero headline */}
      <div
        className="aurora-blob aurora-1"
        style={{
          top: "-12%",
          left: "-6%",
          width: "52vw",
          height: "52vw",
          background:
            "radial-gradient(circle at center, var(--color-accent) 0%, transparent 68%)",
          opacity: 0.5,
        }}
      />
      {/* Cool indigo counter-glow */}
      <div
        className="aurora-blob aurora-2"
        style={{
          top: "-4%",
          right: "-10%",
          width: "46vw",
          height: "46vw",
          background:
            "radial-gradient(circle at center, #4f46e5 0%, transparent 70%)",
          opacity: 0.42,
        }}
      />
      {/* Deep magenta, lower — keeps the field from feeling symmetrical */}
      <div
        className="aurora-blob aurora-3"
        style={{
          top: "32%",
          left: "30%",
          width: "40vw",
          height: "40vw",
          background:
            "radial-gradient(circle at center, #be185d 0%, transparent 72%)",
          opacity: 0.3,
        }}
      />
    </div>
  );
}
