import { AuroraField } from "./AuroraField";
import { ParticleField } from "./ParticleField";

/**
 * Global ambient background, fixed behind all content (-z-10).
 * Layer order (back → front):
 *   1. Aurora mesh blobs (drift)
 *   2. Mouse-reactive particle constellation
 *   3. Vignette to darken edges / focus the center
 * The film grain is applied separately on <body class="grain"> (layout.tsx)
 * so it can sit ABOVE content at z-50.
 */
export function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <AuroraField />
      <ParticleField />
      {/* Vignette + top focus glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% -10%, rgba(124,58,237,0.06) 0%, transparent 45%), radial-gradient(100% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}
