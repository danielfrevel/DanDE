# Coding Conventions

**Analysis Date:** 2026-01-29

## Naming Patterns

**Files:**
- JavaScript files: lowercase with hyphens (e.g., `flow-field-background.js`, `perlin.js`)
- HTML partials: lowercase with descriptive names (e.g., `header.html`, `scripts.html`, `head.html`)
- Config files: lowercase with dots (e.g., `tailwind.config.js`, `postcss.config.js`, `hugo.toml`)

**Functions:**
- camelCase for function declarations (e.g., `setupCanvas()`, `createParticles()`, `updateParticle()`, `getFlowAngle()`)
- Prefix functions with action verbs: `create*`, `setup*`, `handle*`, `draw*`, `update*`, `track*`, `start*`, `stop*`, `init*`
- Private helper functions use same camelCase pattern without underscore prefix
- Event handlers: `handle*` prefix (e.g., `handleResize()`, `handleVisibilityChange()`)
- Init functions explicitly named `init()` for module initialization

**Variables:**
- camelCase for local variables (e.g., `canvas`, `ctx`, `particles`, `mouseX`, `mouseY`, `isAnimating`)
- Constants in UPPER_CASE with const declaration (e.g., `CONFIG`)
- Boolean flags use `is*` prefix (e.g., `isAnimating`, `isMobile`)
- Timeout/interval IDs use suffix pattern (e.g., `resizeTimeout`, `animationFrameId`)
- Single-letter loop variables acceptable (e.g., `i`, `x`, `y`, `t`)

**Types:**
- Constructor functions capitalized (e.g., `Grad(x, y, z)`)
- Constructor prototype methods defined with lowercase camelCase (e.g., `dot2()`, `dot3()`)

## Code Style

**Formatting:**
- No detected linting configuration (.eslintrc, .prettierrc, biome.json, etc.)
- Indentation: 2 spaces observed in configuration files, 4-space blocks in JavaScript
- Line length: No enforced limit detected
- Semicolons: Present throughout, appears to be a style preference
- Quotes: Single quotes in HTML templates, double quotes in JavaScript where needed

**Linting:**
- No linting configuration detected
- Follow style patterns observed in existing code

## Import Organization

**Module Loading Order:**
1. External dependencies first (e.g., Perlin noise library via `<script>`)
2. Application scripts follow (e.g., `flow-field-background.js` after `perlin.js`)
3. CSS/styles via Hugo Pipes in `head.html`

**Script Loading in `baseof.html`:**
```html
<!-- External libraries -->
<script src="/js/perlin.js"></script>
<!-- Application code -->
<script src="/js/flow-field-background.js"></script>
```

**Hugo Template Imports:**
- Partials loaded via `{{ partial "filename.html" . }}`
- Common pattern: `head.html`, `header.html`, `scripts.html`, `footer.html`

## Error Handling

**Patterns:**
- Console error logging for missing dependencies: `console.error('noise.js not loaded')`
- Guard clauses to check dependencies before use: `if (typeof window.noise === 'undefined')`
- Early return pattern on initialization failure
- No try/catch blocks detected - relies on feature detection and guard clauses

**Error Recovery:**
- Graceful degradation for accessibility: Falls back to static background when reduced motion is preferred
- Visibility detection prevents animation when tab is hidden

## Logging

**Framework:** console (built-in)

**Patterns:**
- `console.error()` for critical missing dependencies
- No debug logging detected in production code
- Comments used instead of logging for operational notes (e.g., `// Watch for system preference changes`)

## Comments

**When to Comment:**
- Comments explain "why" not "what" (e.g., `// Theme: light by default, dark if user chose it or system prefers dark`)
- Inline comments for non-obvious calculations (e.g., `// This isn't a very good seeding function, but it works ok`)
- Section comments before logical groups (e.g., `// Dark Mode Toggle`, `// Mobile Menu Toggle`, `// Search Modal`)
- Header comments for third-party code attribution (e.g., noisejs copyright and source)

**JSDoc/TSDoc:**
- Not detected in codebase
- Minimal documentation approach

## Function Design

**Size:**
- Small, focused functions (10-30 lines typical)
- Examples: `createParticle()` (8 lines), `setupCanvas()` (15 lines), `updateParticle()` (35 lines)
- Larger functions only when logically coherent (e.g., `simplex3()` is complex mathematical operation)

**Parameters:**
- Minimal parameters (0-3 typical)
- Configuration objects passed to functions where many options needed
- Example: `CONFIG` object holds 17 parameters instead of function arguments

**Return Values:**
- Functions return objects with properties (e.g., `createParticle()` returns `{x, y, vx, vy, age}`)
- Void functions for side effects and mutations (e.g., `updateParticle()` mutates particle in place)
- Module functions return module namespace objects (e.g., `global.noise = {}`)

## Module Design

**Exports:**
- Global namespace pollution pattern: `var module = global.noise = {}`
- Functions attached to module namespace: `module.seed = function(seed) {...}`
- All public functions exposed on module object

**Barrel Files:**
- Not applicable - no barrel files detected

**Self-Contained Modules:**
- IIFE pattern for private scope (perlin.js)
- Global initialization function pattern (flow-field-background.js)
- HTML template partials for composition

## Configuration

**Constants Object Pattern:**
Used extensively for tunable parameters:
```javascript
const CONFIG = {
  particleCount: 80,
  mobileParticleCount: 40,
  particleSize: 2,
  mobileParticleSize: 3,
  particleColor: '#6366f1',
  particleAlpha: 0.5,
  noiseScale: 0.005,
  noiseStrength: 0.3,
  timeIncrement: 0.001,
  mouseRadius: 120,
  mouseStrength: 3,
  maxSpeed: 2,
  trailFade: 0.15,
  particleMaxAge: 500,
  bgLight: 'rgba(255, 255, 255, 0.15)',
  bgDark: 'rgba(15, 23, 42, 0.15)'
};
```

All magic numbers centralized in `CONFIG` object - no hardcoded values in functions.

## Tailwind CSS

**Configuration File:** `tailwind.config.js`
- Uses extend pattern to add custom values
- Custom fluid font sizing with clamp()
- Dark mode enabled with class strategy
- Typography plugin customized with code styling

**Naming in Templates:**
- Tailwind utility classes only, no custom CSS classes
- BEM-like structure implied through component nesting (e.g., `header > nav > div`)

---

*Convention analysis: 2026-01-29*
