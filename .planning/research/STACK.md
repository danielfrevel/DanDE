# Technology Stack

**Project:** Interactive Blog Enhancements
**Researched:** 2026-01-29
**Confidence:** HIGH

## Executive Summary

Stack for adding interactive canvas animations, force-directed graph views, and self-hosted comments to existing Hugo 0.154.5 + Tailwind 3.4 blog. Focus: vanilla JavaScript where possible, minimal dependencies, performance-critical.

## Recommended Stack

### Canvas Background Animation
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Vanilla Canvas API** | Native | Mouse-reactive geometric/physics animations | Zero dependencies, full control, best performance. requestAnimationFrame + offscreen canvas patterns sufficient for geometric/math visualizations |
| ~~GSAP~~ | - | NOT RECOMMENDED | 100kb+ library overkill for simple geometric animations. Use for complex timeline-based animations only |
| ~~Konva.js~~ | - | NOT RECOMMENDED | Object-oriented API adds unnecessary abstraction for direct canvas manipulation |

**Rationale:** Your use case (geometric/math/physics visualizations) fits perfectly with vanilla Canvas API + requestAnimationFrame. Modern browser APIs (2025) provide everything needed:
- `requestAnimationFrame()` for 60fps rendering
- `OffscreenCanvas` for Web Worker threading if needed
- `devicePixelRatio` handling for HiDPI displays
- CSS transform scaling for GPU acceleration

**Performance targets:**
- <16ms frame time (60fps)
- No dropped frames on mouse interaction
- <50kb JS bundle

**Confidence:** HIGH (verified with [MDN Canvas optimization docs](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas))

---

### Force-Directed Graph Visualization
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **sigma.js** | 3.0.2 | WebGL graph rendering | WebGL-based, 10K+ nodes at 60fps, Obsidian-style graph views |
| **graphology** | latest | Graph data structure | Required dependency for sigma.js, only 11.5kb gzipped |

**Rationale:** Sigma.js is purpose-built for network/knowledge graph visualization with WebGL rendering. Significantly outperforms D3.js for large graphs:
- D3.js: SVG-based, struggles beyond 1000 nodes
- Sigma.js: WebGL rendering, handles 10K+ nodes smoothly
- Bundle: sigma.js + graphology combined <50kb gzipped

D3.js rejected because:
1. SVG rendering bottleneck for graphs
2. More general-purpose (you don't need charts/dataviz)
3. Larger bundle for graph-only use case

**Installation:**
```bash
npm install sigma graphology
```

**Confidence:** HIGH (verified [sigma.js performance comparisons](https://memgraph.com/blog/you-want-a-fast-easy-to-use-and-popular-graph-visualization-tool) and [npm bundle size](https://bestofjs.org/projects/graphology))

---

### Self-Hosted Comments with SQLite
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Isso** | 0.13.0 | Comment backend | Python + SQLite, <5kb client JS, Docker support, actively maintained |
| **SQLite** | 3.x (WAL mode) | Comment storage | Bundled with Isso, zero-config, WAL mode for concurrent reads |
| **Docker** | - | Deployment | Official image: `ghcr.io/isso-comments/isso:0.13.0` |

**Rationale:** Isso is the cleanest SQLite-based comment system for static sites:
- Minimal client footprint (5kb JS gzipped)
- SQLite backend fits your preference for simplicity
- Official Docker image exists (aligns with your nginx setup)
- Active maintenance (v0.13.0 June 2024, webpack modernization)
- Email notifications, moderation, webhook support built-in

**Alternatives considered:**

| System | Why Not |
|--------|---------|
| Schnack | Node.js (you have Python in stack already via Hugo). Last commit 2020, likely abandoned |
| Cusdis | Newer (less proven), requires separate database config, cloud-focused model |
| Waline | Multi-database adds complexity, heavier client bundle |

**Deployment:**
```bash
docker run -d --name isso \
  -p 127.0.0.1:8080:8080 \
  -v /path/to/config:/config \
  -v /path/to/db:/db \
  ghcr.io/isso-comments/isso:0.13.0
```

Reverse proxy via existing nginx container.

**SQLite optimization:** Enable WAL mode in Isso config:
```ini
[general]
dbpath = /db/comments.db
mode = readonly  # For web workers
```

WAL mode = optimized for "many readers, occasional writers" (perfect for comments).

**Confidence:** HIGH (verified [Isso Docker deployment](https://linuxhandbook.com/deploy-isso-comment/) and [v0.13.0 release notes](https://github.com/isso-comments/isso/releases))

---

### View Transition API
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **View Transition API** | Native | Smooth page transitions | Baseline Newly Available (Oct 2025), zero-dependency, Hugo-friendly |

**Browser support (2025):**
- Chrome 111+
- Edge 111+
- Safari 18+
- Firefox 144+ (added Oct 2025)

**Status:** Same-document transitions now supported across all major browsers. Cross-document transitions limited to Chrome/Edge/Safari.

**Implementation:**
```javascript
// Same-document (navigation within SPA-like interactions)
document.startViewTransition(() => {
  // DOM update
});

// Auto-naming for bulk transitions
view-transition-name: match-element;
```

**Hugo integration:** Works with Hugo's standard navigation. No framework needed. Progressive enhancement pattern:
```javascript
if (document.startViewTransition) {
  // Enhanced experience
} else {
  // Instant navigation fallback
}
```

**Rationale:**
- Native API = zero bundle cost
- Baseline support as of Oct 2025 ([Chrome blog](https://developer.chrome.com/blog/view-transitions-in-2025))
- Auto-naming with `match-element` reduces boilerplate
- Falls back gracefully to instant navigation

**Confidence:** HIGH (verified [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) and [Can I Use](https://caniuse.com/view-transitions))

---

### Hugo JavaScript Bundling
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Hugo Pipes** | Built-in | JS bundling, minification | Zero external tooling, tree-shaking, fingerprinting built-in |

**Hugo asset pipeline** (for your custom JS):
```
assets/
  js/
    canvas-animation.js
    graph-view.js
    main.js
```

**Hugo template:**
```go
{{ $js := resources.Get "js/main.js" | js.Build | minify | fingerprint }}
<script src="{{ $js.RelPermalink }}"></script>
```

**Built-in features:**
- Bundling (import/export)
- Minification
- Tree shaking
- Code splitting
- Fingerprinting (cache busting)

**Rationale:** Hugo's asset pipeline eliminates webpack/vite/rollup. Your JS is simple enough (canvas utils, sigma initialization, Isso embed) that Hugo Pipes handles it perfectly.

**Confidence:** HIGH (verified [Hugo JS docs](https://gohugo.io/hugo-pipes/js/))

---

## Supporting Libraries (Optional)

### Math/Physics Utilities
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **None** | - | Math operations | Start with vanilla `Math.*`. Add libraries only if you need specialized algorithms (e.g., simplex noise, vector math) |

**Defer until needed.** Canvas animations rarely need external math libs.

---

## Installation Summary

```bash
# Graph visualization
npm install sigma graphology

# Comments (Docker)
docker pull ghcr.io/isso-comments/isso:0.13.0

# Canvas + View Transitions
# (Native APIs, no installation)
```

**Total added dependencies:** 2 npm packages (sigma + graphology)
**Total bundle cost:** ~50-60kb gzipped (sigma + graphology + Isso client)

---

## Bundle Size Budget

| Component | Size (gzipped) | Notes |
|-----------|----------------|-------|
| sigma.js + graphology | ~50kb | Graph visualization |
| Isso client | 5kb | Comment widget |
| Canvas animation | <10kb | Custom vanilla JS |
| View Transitions | 0kb | Native API |
| **Total** | **~65kb** | Well within performance budget |

---

## Anti-Recommendations

### What NOT to Use

| Technology | Why Avoid |
|------------|-----------|
| **GSAP** | 100kb+ for timeline animations you don't need. Vanilla `requestAnimationFrame` sufficient for geometric/physics visualizations |
| **Three.js** | 600kb+ library overkill. Canvas 2D handles your geometric animations. Only use if you need true 3D (you don't) |
| **D3.js** | SVG bottleneck for graph rendering. Sigma.js 10x faster for network graphs |
| **React/Vue/Svelte** | Framework overhead for simple DOM manipulation. Hugo already renders HTML. Use vanilla JS + View Transitions |
| **Disqus/Commento** | Third-party tracking, no SQLite. Isso meets all requirements |
| **Webpack/Vite** | Hugo Pipes handles JS bundling. Unnecessary build step |

---

## Architecture Notes

### Canvas Layer Strategy
Use **offscreen canvas** pattern for complex scenes:
1. **Background layer** (static/slow-changing): Pre-render to offscreen canvas
2. **Animation layer** (60fps): Mouse-reactive elements, cleared each frame
3. **UI layer** (on-demand): Labels, controls

**Why:** Minimizes redraw overhead. Background renders once, animation layer only redraws moving elements.

### Graph Data Loading
Hugo build-time pattern:
```
content/posts/post1.md  →  data/graph/post1.json
                          ↓
                    graph-data.json (aggregated)
                          ↓
                    sigma.js (runtime)
```

Generate graph JSON during Hugo build, load async at runtime. No server-side component needed beyond Isso.

### Isso Integration
```
┌─────────────┐
│ Hugo + nginx│
│   (static)  │
└──────┬──────┘
       │
       ├─── /             → Hugo site
       └─── /comments/*   → Isso (proxied)

Docker Compose:
  - hugo-nginx:80
  - isso:8080 (internal)
```

nginx proxies `/comments/*` to Isso container. No CORS issues.

---

## Development Workflow

### Local Development
```bash
# Start Hugo server
hugo server -D

# Start Isso (Docker)
docker-compose up isso

# JS changes auto-reload via Hugo
```

### Production Build
```bash
# Build Hugo site
hugo --minify

# Isso runs in Docker (persistent)
docker-compose up -d isso

# nginx serves Hugo static + proxies Isso
```

---

## Version Pinning

**Critical:** Pin versions in production.

```json
// package.json
{
  "dependencies": {
    "sigma": "3.0.2",
    "graphology": "^0.25.0"
  }
}
```

```yaml
# docker-compose.yml
services:
  isso:
    image: ghcr.io/isso-comments/isso:0.13.0  # NOT :latest
```

---

## Performance Validation Checklist

- [ ] Canvas maintains 60fps with mouse interaction (Chrome DevTools Performance)
- [ ] Graph renders <500ms for typical knowledge graph (<1000 nodes)
- [ ] Isso widget loads <200ms (5kb + RTT)
- [ ] View Transitions <300ms perceived navigation time
- [ ] Total JS bundle <100kb gzipped
- [ ] Lighthouse Performance Score >90

---

## Migration Path

Existing blog → Enhanced blog:

1. **Phase 1: Canvas background**
   - Vanilla JS in `assets/js/canvas-bg.js`
   - Test performance on target devices
   - No dependencies

2. **Phase 2: Graph view**
   - `npm install sigma graphology`
   - Hugo generates graph JSON at build time
   - Render on `/graph` page

3. **Phase 3: Comments**
   - Deploy Isso Docker container
   - Configure nginx proxy
   - Add Isso embed script to post template

4. **Phase 4: View Transitions**
   - Progressive enhancement in existing JS
   - `document.startViewTransition()` wrapper
   - Zero dependencies

Each phase independently deployable.

---

## Sources

**Canvas Animation:**
- [MDN Canvas Optimization Guide](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- [MDN requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
- [JavaScript Animation Libraries 2025](https://dev.to/hadil/top-10-javascript-animation-libraries-in-2025-2ch5)

**Graph Visualization:**
- [Sigma.js Official Docs](https://www.sigmajs.org/docs/)
- [Graph Visualization Performance Comparison](https://memgraph.com/blog/you-want-a-fast-easy-to-use-and-popular-graph-visualization-tool)
- [Graphology Bundle Size](https://bestofjs.org/projects/graphology)
- [Sigma.js vs D3.js Performance](https://weber-stephen.medium.com/the-best-libraries-and-methods-to-render-large-network-graphs-on-the-web-d122ece2f4dc)

**Comment System:**
- [Self-Hosted Comment Systems 2025](https://deployn.de/en/blog/self-hosted-comment-systems/)
- [Isso Docker Deployment](https://linuxhandbook.com/deploy-isso-comment/)
- [Isso Official Releases](https://github.com/isso-comments/isso/releases)
- [Cusdis Overview](https://cusdis.com/)

**View Transitions:**
- [View Transitions in 2025 (Chrome Blog)](https://developer.chrome.com/blog/view-transitions-in-2025)
- [MDN View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
- [Can I Use: View Transitions](https://caniuse.com/view-transitions)
- [Same-document View Transitions Baseline](https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available)

**Hugo Integration:**
- [Hugo JavaScript Bundling](https://gohugo.io/hugo-pipes/js/)
- [Why Hugo is Best in 2025](https://dev.to/leapcell/why-hugo-is-the-best-static-blog-framework-in-2025-43eh)
