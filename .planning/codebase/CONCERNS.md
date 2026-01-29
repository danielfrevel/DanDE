# Codebase Concerns

**Analysis Date:** 2026-01-29

## Tech Debt

**Inline scripting in HTML partials:**
- Issue: Multiple `<script>` blocks embedded directly in `layouts/partials/scripts.html` (lines 2-66), creating inline event handlers for theme toggle, mobile menu, and search modal
- Files: `layouts/partials/scripts.html` (80 lines)
- Impact: No module system, difficult to test, potential security issues with DOM manipulation, tight coupling between markup and behavior
- Fix approach: Extract to separate modules in `/static/js/` with clear separation of concerns. Consider using data attributes for element selection instead of IDs.

**Missing CSS asset configuration:**
- Issue: Tailwind CSS is processed via Hugo Pipes in `layouts/partials/head.html` (lines 65-70) but no `/assets/css/main.css` exists to be processed—only empty base layer in `assets/css/main.css`
- Files: `assets/css/main.css` (5 lines)
- Impact: CSS postprocessing relies on defaults, no custom utilities or theme extensions beyond Tailwind config
- Fix approach: Populate `assets/css/main.css` with meaningful base layers, components, and utilities matching design system

**Hardcoded DOM IDs for JavaScript coupling:**
- Issue: JavaScript targets specific DOM IDs (`search-button`, `search-modal`, `search-backdrop`, `theme-toggle`, `mobile-menu-button`, `mobile-menu`, `flow-field-canvas`) scattered across files with no single source of truth
- Files: `layouts/partials/scripts.html`, `layouts/partials/header.html`, `static/js/flow-field-background.js`
- Impact: Renaming HTML requires updating multiple JS files; fragile to refactoring
- Fix approach: Create a configuration file (e.g., `static/js/config.js`) with centralized ID mappings

**Performance: Redundant dark mode detection:**
- Issue: Dark mode detection logic duplicated across three places: `layouts/partials/head.html` (lines 49-58, synchronous check), `layouts/partials/scripts.html` (lines 2-16, event listener), and `static/js/flow-field-background.js` (lines 142-145, runtime check)
- Files: `layouts/partials/head.html`, `layouts/partials/scripts.html`, `static/js/flow-field-background.js`
- Impact: Redundant DOM queries and conditional logic; inconsistent theme detection across components
- Fix approach: Centralize theme management in a single module that other scripts subscribe to

**Unused CSS classes in stats:**
- Issue: `hugo_stats.json` contains many CSS classes not actively used (`dark:bg-gray-100`, `dark:hover:bg-gray-200`, `hover:bg-gray-800`, `inline-block`, etc.)
- Files: `hugo_stats.json` (auto-generated), layout files
- Impact: Generated CSS may include unused utilities; harder to understand active design system
- Fix approach: Run PurgeCSS/Tailwind minification in production build; audit Tailwind config against actual usage

## Known Bugs

**Particle clustering on dark mode switch:**
- Symptoms: Particles visibly converge/cluster when toggling dark mode
- Files: `static/js/flow-field-background.js` (lines 142-145, 225-236)
- Trigger: Click theme toggle button while animation is running
- Workaround: Brief visual glitch but recovers; particles respawn after `particleMaxAge` (500ms)
- Root cause: `isDarkMode()` function rechecks `.dark` class but particle velocities and angles aren't reset during mode switch

**Search modal focus not guaranteed:**
- Symptoms: setTimeout hack (line 38-41 in `layouts/partials/scripts.html`) to focus search input after Pagefind loads
- Files: `layouts/partials/scripts.html` (lines 37-41)
- Trigger: Open search modal via search button or Cmd/Ctrl+K
- Workaround: Manual click in input field
- Root cause: Pagefind UI injected asynchronously; no load event to hook into

**Body overflow: hidden persists after modal close:**
- Symptoms: If search modal closes abnormally (e.g., page navigation), `document.body.style.overflow` may remain `'hidden'`, locking scroll
- Files: `layouts/partials/scripts.html` (lines 44-46)
- Trigger: Open search → navigate to another page before closeSearch() executes
- Workaround: Manually set `document.body.style.overflow = ''` in browser console
- Root cause: No cleanup on page unload; modal state not persisted to localStorage

## Security Considerations

**XSS via unsafe Hugo markup renderer:**
- Risk: `hugo.toml` line 25 sets `unsafe = true` for Goldmark renderer, allowing raw HTML in Markdown
- Files: `hugo.toml` (line 25)
- Current mitigation: Trust in content authors
- Recommendations:
  - If publishing user-generated content, set `unsafe = false`
  - Document HTML content restrictions in contributor guidelines
  - Add HTML sanitizer middleware if adding comment system

**localStorage theme without validation:**
- Risk: `localStorage.theme` read in `layouts/partials/head.html` and `layouts/partials/scripts.html` without validation
- Files: `layouts/partials/head.html` (line 52), `layouts/partials/scripts.html` (line 7)
- Current mitigation: Only 'dark' and 'light' values are meaningful; invalid values ignored
- Recommendations: Explicitly whitelist theme values: `if (['dark', 'light'].includes(localStorage.theme))`

**Mouse position tracking without rate limiting:**
- Risk: `document.addEventListener('mousemove', ...)` in `static/js/flow-field-background.js` (line 169) fires on every pixel movement with no debounce
- Files: `static/js/flow-field-background.js` (lines 168-178)
- Current mitigation: Particle update runs at ~60fps, so excess events are harmless
- Recommendations: Consider event delegation or passive listeners if cursor interaction becomes more complex

## Performance Bottlenecks

**Canvas animation on every frame:**
- Problem: `animate()` in `static/js/flow-field-background.js` (lines 147-166) redraws entire canvas + 80 particles every frame (~60fps)
- Files: `static/js/flow-field-background.js`
- Cause: Full canvas repaint (line 160) instead of incremental updates
- Current: Acceptable on modern devices; mobile throttled to 40 particles
- Improvement path:
  - Implement particle pooling to reduce GC pressure
  - Use transform tricks instead of redrawing if possible (limited for flow fields)
  - Add frame-skip option for low-end devices

**resize event debounce at 100ms:**
- Problem: Window resize triggers `resizeCanvas()` (line 207-209) after 100ms delay, but delay is fixed
- Files: `static/js/flow-field-background.js` (lines 204-210)
- Cause: Arbitrary timeout duration
- Improvement path: Use requestAnimationFrame instead of setTimeout for resize batching

**Pagefind integration blocks search:**
- Problem: Pagefind loads asynchronously in `layouts/partials/scripts.html` (lines 70-80), creating race condition on first search
- Files: `layouts/partials/scripts.html` (lines 70-80)
- Cause: `new PagefindUI()` may not be ready when user opens search modal
- Improvement path: Wait for Pagefind to initialize before allowing search modal to open; show loading state

**Three-library initialization sequence:**
- Problem: `flow-field-background.js` depends on `perlin.js` loading first, but no explicit dependency management
- Files: `layouts/_default/baseof.html` (lines 18-19)
- Cause: Script order matters; loading perlin.js after flow-field will cause `window.noise` to be undefined
- Improvement path: Use ES modules or defer/async attributes; add integrity checks in init function (lines 213-216)

## Fragile Areas

**Flow field animation state management:**
- Files: `static/js/flow-field-background.js` (global state: lines 20-26)
- Why fragile: Multiple global flags (`isAnimating`, `animationFrameId`, `isMobile`, `time`, `mouseX`, `mouseY`, `lastTime`) with no synchronization mechanism
- Safe modification: Always use `stopAnimation()` and `startAnimation()` to control state; never set `isAnimating` directly
- Test coverage: No tests; manual testing required for visibility changes, theme switches, and mobile detection

**Particle physics model:**
- Files: `static/js/flow-field-background.js` (lines 83-131)
- Why fragile: Tuning `CONFIG` values (noiseScale, noiseStrength, maxSpeed, trailFade) requires visual testing; no unit tests
- Safe modification: Changes to CONFIG affect visual output immediately; test in both light/dark modes and on mobile
- Test coverage: None; visual regression testing needed

**Hugo template cascade:**
- Files: `layouts/_default/baseof.html`, `layouts/_default/single.html`, `layouts/_default/list.html`, `layouts/index.html`
- Why fragile: Inheritance chain not explicit; changing `baseof.html` affects all pages
- Safe modification: Test all page types (home, post list, single post, 404) after layout changes
- Test coverage: None; rely on manual site build and link verification

**Tailwind configuration with custom fonts:**
- Files: `tailwind.config.js` (lines 10-19)
- Why fragile: Depends on fonts.bunny.net CDN loading in `layouts/partials/head.html` (line 62)
- Safe modification: Test font loading on slow networks (3G throttle in DevTools)
- Test coverage: None; layout shift issues possible if fonts load slowly

## Scaling Limits

**Particle animation on large viewports:**
- Current capacity: 80 desktop particles, 40 mobile particles; responsive based on pointer capability
- Limit: ~150 particles causes noticeable frame drop on 4K displays
- Scaling path: Implement WebGL renderer or batch draw calls instead of individual `ctx.arc()` for each particle

**Canvas memory at high DPR (device pixel ratio):**
- Current capacity: Canvas size = `innerWidth * DPR × innerHeight * DPR`; at 4K + 2x DPR = 16MP canvas
- Limit: Beyond 3x DPR or 8K viewport becomes memory-constrained
- Scaling path: Downscale canvas for high DPR displays (trade resolution for memory)

**Hugo build time with pagefind:**
- Current capacity: Pagefind index generation on each `npm run build:search`
- Limit: Not a concern for small blogs (<1000 posts); would need incremental indexing for large archives
- Scaling path: Use Pagefind's incremental build feature once available; consider external search SaaS for 10k+ posts

## Dependencies at Risk

**pagefind@^1.0.4:**
- Risk: Semver `^1.0.4` allows up to `<2.0.0`; Pagefind is relatively new (v1.4.0 in package-lock)
- Impact: Breaking changes in v2 could break search UI; maintainer has been active
- Migration plan: Pin to `^1.4.0` for stability; monitor releases for v2; test search heavily before upgrading

**perlin.js (vendored noisejs):**
- Risk: Vendored 2012-era library (static/js/perlin.js); no build system or updates
- Impact: No security updates possible; library is small and math-only, so low risk
- Migration plan: If Perlin noise becomes bottleneck, consider WebAssembly port or dedicated library

**Tailwind CSS @tailwindcss/typography@0.5.10:**
- Risk: Plugin adds 50KB of prose styles; major version 1.0+ exists but may have breaking changes
- Impact: Markdown rendering depends on plugin; major bump could change article styling
- Migration plan: Pin to `0.5.10`; test upgrade in staging; check prose theme customization before bumping

## Missing Critical Features

**No analytics or monitoring:**
- Problem: No way to detect if animation is draining battery, causing scroll jank, or degrading performance
- Blocks: Can't measure real-world impact of flow field animation

**No automated testing:**
- Problem: No unit tests, integration tests, or E2E tests
- Blocks: Can't safely refactor JavaScript; visual regressions undetected; particle physics changes risky

**No build step for JavaScript:**
- Problem: JavaScript delivered unbundled; no tree-shaking, minification, or module resolution
- Blocks: Can't use npm packages for animation; all code must be vanilla or vendored

**No dark mode testing:**
- Problem: Dark mode toggling tested manually only
- Blocks: Particle clustering bug (lines 225-236) may have similar siblings

## Test Coverage Gaps

**Flow field animation state transitions:**
- What's not tested: Visibility change → animation pause/resume, theme toggle → color adjustment, resize → particle respawn
- Files: `static/js/flow-field-background.js` (lines 196-236, 249-252)
- Risk: Logic errors in `handleVisibilityChange()` and `init()` cascade to entire animation
- Priority: High

**Search modal state machine:**
- What's not tested: Opening/closing via button, backdrop click, Escape key, Cmd/Ctrl+K, focus trap
- Files: `layouts/partials/scripts.html` (lines 28-66)
- Risk: `document.body.style.overflow` persistence, focus management, multiple opens without close
- Priority: High

**Responsive design at breakpoints:**
- What's not tested: Mobile menu toggle, particle count switch at `pointer: coarse` breakpoint, layout reflow
- Files: `layouts/partials/header.html`, `static/js/flow-field-background.js` (line 238)
- Risk: Mobile-only bugs go unnoticed
- Priority: Medium

**Dark mode flash on page load:**
- What's not tested: Initial page load with theme preference stored; verify no white flash in dark mode
- Files: `layouts/partials/head.html` (lines 49-58)
- Risk: FCP (First Contentful Paint) shows wrong theme for milliseconds
- Priority: Medium

**Pagefind integration failure:**
- What's not tested: Pagefind CDN down, slow network, missing `public/pagefind/` directory
- Files: `layouts/partials/scripts.html` (lines 69-80)
- Risk: Search modal opens but no results; no error messaging
- Priority: Low (static site, unlikely to fail)

---

*Concerns audit: 2026-01-29*
