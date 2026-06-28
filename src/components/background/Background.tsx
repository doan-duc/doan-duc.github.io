import { AuroraField } from "./AuroraField";
import { ParticleField } from "./ParticleField";

/**
 * Global ambient background, fixed behind all content (-z-10):
 *   aurora mesh → particle constellation → cyan top-glow + edge vignette.
 * Film grain is applied on <body class="grain"> so it can sit above content.
 */
export function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <AuroraField />
      <ParticleField />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% -10%, rgba(34,211,238,0.05) 0%, transparent 45%), radial-gradient(100% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}
