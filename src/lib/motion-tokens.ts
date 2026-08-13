/**
 * Motion tokens — the single source of truth for how this site moves.
 *
 * One temperament everywhere: every entrance is the same physical event, an
 * object settling forward out of depth, differing only in duration tier and
 * depth tier. Sections and primitives import from here; raw easing strings,
 * start thresholds, or spring numbers in components are a lint failure
 * (tests/motion-tokens.test.mjs).
 */

/** Duration tiers (seconds). fast = UI micro, standard = typographic reveal,
 *  slow = anything entering from z-depth. */
export const DUR = { fast: 0.5, standard: 0.9, slow: 1.3 } as const;

/**
 * `enter` is the one entrance ease. power3.out's decay profile matches Lenis'
 * exponential settle (lerp ≈ 0.1), so scroll motion and entrance motion share
 * one temperament. `crossfade` exists only for scrubbed timelines where both
 * ends are visible (the pinned research phases).
 */
export const EASE = { enter: "power3.out", crossfade: "power1.inOut" } as const;

/** The ONE ScrollTrigger threshold for once:true entrances. */
export const START = { reveal: "top 85%" } as const;

/**
 * Z-depth tiers (px). shallow = list items, mid = paragraphs/panels,
 * deep = hero-scale objects (project cards, the Contact finale).
 * Mobile branches use one tier shallower — their 900px perspective renders
 * the same z visibly stronger than the desktop 1200px scene.
 */
export const DEPTH = { shallow: -120, mid: -200, deep: -300 } as const;

/** The ONE numeric scrub smoothing. (ScrollRevealText stays `scrub: true`:
 *  word opacity must track reading position 1:1 — smoothing there reads as
 *  latency, not silk.) */
export const SCRUB = { smooth: 0.7 } as const;

/** Resting opacity of "unread" content — shared by the word-wipe and the
 *  flow-mode research panels so the page has one dimness vocabulary. */
export const REST = { dim: 0.12 } as const;

/**
 * The two spring personalities. Both overdamped — nothing on this site
 * wobbles. snappy = pointer-follow surfaces (tilt, glare, magnetic, nav
 * pill); heavy = instrument-like masses (about instrument, scroll progress).
 */
export const SPRING = {
  snappy: { stiffness: 300, damping: 21, mass: 0.3 },
  heavy: { stiffness: 110, damping: 22, mass: 0.6 },
} as const;

/** Scrub window for the flow-mode research panels (a range, not a threshold). */
export const FLOW_RANGE = { start: "top 96%", end: "top 54%" } as const;

/**
 * Scrub window for the word wipe. Both ends key off the block's TOP so tall
 * paragraphs behave like short ones, and the wipe completes by the time the
 * block's top reaches the middle of the viewport — parked at any natural
 * reading position, the copy is fully lit; only the lower half of the screen
 * is "not read yet" territory.
 */
export const WIPE_RANGE = { start: "top 92%", end: "top 60%" } as const;
