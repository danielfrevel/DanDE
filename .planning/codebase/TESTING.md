# Testing Patterns

**Analysis Date:** 2026-01-29

## Test Framework

**Status:** Not detected

- No test runner installed (Jest, Vitest, Mocha not in `package.json`)
- No test configuration files detected (no `jest.config.js`, `vitest.config.ts`, etc.)
- No test files in source directories (only test files in `node_modules` from dependencies)
- No test scripts in `package.json` (only `dev`, `build`, `build:search`)

**Current NPM Scripts:**
```json
{
  "dev": "hugo server --buildDrafts --buildFuture",
  "build": "hugo --minify",
  "build:search": "npx pagefind --site public"
}
```

## Testing Approach

**Current State:**
- Manual testing only
- CI/CD pipeline runs Hugo build and Docker deployment (GitHub Actions)
- No automated unit, integration, or E2E tests

**Hugo Build Validation:**
- Build process is the primary validation mechanism
- Static site generation catches template errors at build time
- Markdown frontmatter validation happens during Hugo processing

## Code Organization for Testing

**JavaScript Modules:**
- `static/js/flow-field-background.js` - Self-contained animation module
  - Initialization via `init()` function
  - Module-level variables: `canvas`, `ctx`, `particles`, `noise`, `time`, `mouseX`, `mouseY`, `isAnimating`, `animationFrameId`, `isMobile`
  - Feature detection guards: `if (typeof window.noise === 'undefined')`
  - Would require DOM for testing (canvas API, event listeners)

- `static/js/perlin.js` - Pure math library (Simplex noise)
  - IIFE with no external dependencies
  - Testable functions: `module.seed()`, `module.simplex2()`, `module.simplex3()`, `module.perlin2()`, `module.perlin3()`
  - No side effects on global state beyond noise module itself
  - Could be unit tested with basic assertion framework

**HTML Templates:**
- `layouts/partials/scripts.html` - Inline event handlers
  - Theme toggle logic
  - Mobile menu toggle
  - Search modal handlers
  - Would require DOM testing
  - Could extract logic to testable functions

## Testability Gaps

**Current Challenges:**
1. **DOM Coupling:** Most JavaScript tied directly to DOM selectors (e.g., `document.getElementById('theme-toggle')`)
2. **Global State:** Module-level variables (canvas, particles, time, mouseX/Y) make isolated testing difficult
3. **No Dependency Injection:** Hard-coded references to `window`, `document`, `requestAnimationFrame`
4. **Browser APIs:** Heavy reliance on Canvas API, matchMedia, localStorage
5. **No Mocking Framework:** Would need to implement mocks for browser APIs

## Potential Testing Strategy

**If Testing Were to Be Implemented:**

**Unit Test Candidates (Perlin Noise):**
```javascript
// Pure functions suitable for testing
- module.simplex2(x, y)
- module.simplex3(x, y, z)
- module.perlin2(x, y)
- module.perlin3(x, y, z)
- module.seed(seed)
```

**Integration Test Candidates:**
- Canvas initialization with DPR handling
- Particle creation and wrapping at boundaries
- Flow field angle calculation
- Mouse interaction detection (distance calculations)
- Speed limiting algorithm

**E2E Test Candidates (Browser-based):**
- Theme toggle persists to localStorage
- Mobile menu open/close
- Search modal appearance with Cmd/Ctrl+K
- Reduced motion preference respected
- Animation starts on visibility change

## Manual Testing Patterns

**Observed Manual Validation:**
- Visual inspection of animations across devices (mobile vs desktop particles)
- Dark mode toggle testing (localStorage + classList mutations)
- Browser console for dependency checking (`typeof window.noise`)
- System preference detection via `matchMedia`

**Accessibility Testing:**
- `prefers-reduced-motion` media query support
- Keyboard shortcuts (Ctrl/Cmd+K for search)
- ARIA labels on interactive elements

## Performance Considerations

**Performance-Critical Code:**
- `animate()` loop: requestAnimationFrame to avoid jank
- `updateParticle()`: Called for each particle every frame - optimized with early returns
- Speed limiting: Normalizes velocity only when needed
- Device detection: `matchMedia('(pointer: coarse)')` for mobile particle count reduction

**Delta Time Usage:**
```javascript
const currentTime = performance.now();
const deltaTime = (currentTime - lastTime) / 16.67;
lastTime = currentTime;
time += CONFIG.timeIncrement * deltaTime;
```
Ensures frame-rate independent animation.

## Build-Time Validation

**Hugo Validation:**
- Template syntax checked during `hugo build`
- Shortcodes and template functions validated
- Markdown metadata validated
- Asset pipeline processing (CSS PostCSS)

**No Linting/Formatting:**
- No ESLint configuration
- No Prettier configuration
- No Type checking (no TypeScript)

## Deployment Testing

**CI/CD Pipeline (GitHub Actions):**
- `.github/workflows/*.yml` defines build and deploy process
- Steps: Docker build → push to container registry → SSH deploy
- No test step detected - only build verification

## Recommendations for Future Testing

**Low-Hanging Fruit:**
1. **Add ESLint** - Catch syntax/style issues early
2. **Extract Logic to Pure Functions** - Separate DOM manipulation from business logic
3. **Test Perlin Noise Library** - Simplest module to test (pure functions, no dependencies)
4. **Add Vitest** - Lightweight, ESM-native test runner
5. **Accessibility Testing** - Automated WCAG checks in CI

**Medium Effort:**
1. Mock Canvas API for animation testing
2. Extract theme/menu logic to testable functions
3. Integration tests for particle system physics
4. Snapshot tests for HTML layout

**High Effort:**
1. Full E2E test suite with Playwright or Cypress
2. Visual regression testing
3. Performance benchmarking in CI
4. Accessibility audit automation

---

*Testing analysis: 2026-01-29*
