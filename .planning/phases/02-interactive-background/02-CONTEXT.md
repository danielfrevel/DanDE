# Phase 2: Interactive Background - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Mouse-reactive Perlin noise flow field rendered on canvas behind content. Particles respond to mouse movement, animation respects prefers-reduced-motion, pauses when tab is not visible.

</domain>

<decisions>
## Implementation Decisions

### Configuration approach
- Single JS config object at top of script with all tweakable values
- Easy to adjust: particle count, colors, speeds, mouse radius, etc.
- No Hugo params or CSS custom properties — keep it self-contained

### Visual style
- Noticeable but calm — clearly visible particles with smooth flow
- Should draw the eye briefly without distracting from content
- Fits the minimal aesthetic established in Phase 1

### Accessibility
- Static gradient fallback for prefers-reduced-motion users
- Frozen flow field rendered as subtle background texture
- Not "no background" — maintains visual interest without motion

### Claude's Discretion
- Particle density, size, and color choices
- Flow speed and turbulence intensity
- Mouse interaction radius and effect strength
- Exact implementation of static gradient fallback
- Performance thresholds for mobile vs desktop

</decisions>

<specifics>
## Specific Ideas

- "Noticeable but calm" — the animation should be present and visible, not hidden in the background, but shouldn't compete with content
- Configuration should be obvious — someone opening the file should immediately see what to tweak

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-interactive-background*
*Context gathered: 2026-01-29*
