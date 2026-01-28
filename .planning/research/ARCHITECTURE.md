# Architecture Patterns: Hugo Blog with Interactive Features

**Domain:** Static site generator with interactive enhancements
**Researched:** 2026-01-29
**Confidence:** MEDIUM (Hugo patterns HIGH, interactive integration MEDIUM)

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BUILD TIME                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Hugo Static Generator                                       │
│  ├─ HTML/CSS generation                                      │
│  ├─ JSON graph data (custom output format)                   │
│  │  └─ nodes: posts with metadata                           │
│  │  └─ links: tag relationships + explicit references        │
│  └─ Asset bundling (Tailwind, custom JS)                     │
│                                                              │
│  Output: /public/                                            │
│  ├─ Static HTML pages                                        │
│  ├─ graph-data.json                                          │
│  └─ assets/                                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       RUNTIME                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Client-Side (Browser)                                       │
│  ├─ Canvas Animation Layer                                   │
│  │  └─ requestAnimationFrame loop                           │
│  │  └─ Mouse event listeners                                │
│  │  └─ GPU-accelerated rendering                            │
│  │                                                           │
│  ├─ Knowledge Graph Visualization                            │
│  │  └─ D3.js force-directed layout                          │
│  │  └─ Loads graph-data.json                                │
│  │  └─ SVG or Canvas rendering                              │
│  │                                                           │
│  ├─ View Transition API                                      │
│  │  └─ CSS @view-transition rule                            │
│  │  └─ Cross-document transitions (MPA)                     │
│  │                                                           │
│  └─ Comments UI                                              │
│     └─ Fetch comments on page load                          │
│     └─ POST new comments to API                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↑↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│                    SERVER RUNTIME                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  nginx (static files) + Comments Backend                     │
│                                                              │
│  Option A: Same Container                                    │
│  ├─ nginx (port 80/443)                                      │
│  │  └─ Serves /public/** → static files                     │
│  │  └─ Proxy /api/comments/** → backend                     │
│  └─ Comments Service (port 3000)                             │
│     └─ Node.js/Go HTTP server                               │
│     └─ SQLite database (comments.db)                         │
│     └─ Endpoints: GET /api/comments/:post-id                 │
│     │             POST /api/comments                         │
│     └─ Rate limiting + honeypot spam prevention              │
│                                                              │
│  Option B: Separate Service (Recommended)                    │
│  ├─ Static Container: nginx                                  │
│  │  └─ Serves /public/**                                    │
│  └─ Comments Container: Node.js/Go + SQLite                  │
│     └─ CORS headers for blog domain                         │
│     └─ Separate deployment/scaling                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Component Boundaries

| Component | Responsibility | Communicates With | Lifecycle |
|-----------|---------------|-------------------|-----------|
| **Hugo Build** | Generate HTML, CSS, graph JSON from markdown | None (build-time only) | Build time |
| **Canvas Animation** | Background visual effect, mouse interaction | Browser events, DOM | Runtime (client) |
| **Knowledge Graph** | Visualize post relationships | graph-data.json, DOM | Runtime (client) |
| **View Transitions** | Smooth page navigation animations | Browser navigation API | Runtime (client) |
| **Comments UI** | Display/submit comments | Comments API (HTTP) | Runtime (client) |
| **nginx** | Serve static files, reverse proxy | Static files, Comments API | Runtime (server) |
| **Comments API** | Store/retrieve comments | SQLite, Comments UI | Runtime (server) |
| **SQLite DB** | Persist comments | Comments API | Runtime (server) |

## Data Flow

### Build-Time Flow

```
Markdown Posts (.md)
  └─> Hugo Templates
      ├─> HTML pages (navigation, content)
      ├─> CSS (Tailwind compilation)
      └─> graph-data.json (custom output format)
          {
            "nodes": [
              {"id": "post-1", "title": "...", "url": "...", "tags": [...]}
            ],
            "links": [
              {"source": "post-1", "target": "post-2", "type": "tag|reference"}
            ]
          }
```

**Implementation:** Hugo custom output format in `hugo.toml`:

```toml
[outputs]
  home = ["HTML", "RSS", "JSON"]

[outputFormats.JSON]
  baseName = "graph-data"
  mediaType = "application/json"
```

Then create `layouts/index.json` template to generate node/link data from `.Site.AllPages`.

### Runtime Client Flow

```
Page Load
  ├─> View Transition API activates (CSS-based, automatic)
  ├─> Canvas animation initializes
  │   └─> requestAnimationFrame loop starts
  │   └─> Mouse move events tracked
  ├─> Knowledge graph loads
  │   └─> Fetch graph-data.json
  │   └─> D3.js force simulation initializes
  │   └─> SVG/Canvas renders nodes and links
  └─> Comments load
      └─> Fetch GET /api/comments/:post-id
      └─> Render comment list

User submits comment
  ├─> POST /api/comments {postId, author, content}
  ├─> Backend validates + rate limits
  ├─> SQLite INSERT
  └─> Return success → Re-fetch comments
```

### Runtime Server Flow

```
HTTP Request
  ├─> Static file (/posts/*) → nginx serves from /public/
  ├─> API request (/api/comments/*)
      └─> nginx proxy → Comments backend
          └─> Rate limit check
          └─> Honeypot validation (anti-spam)
          └─> SQLite query/insert
          └─> JSON response
```

## Patterns to Follow

### Pattern 1: Hugo Custom Output Formats for Frontend Data
**What:** Generate JSON data at build time for client-side JavaScript consumption
**When:** Any time frontend needs structured data about content (graph, search index, metadata)
**Why:** Keeps client-side code stateless, leverages Hugo's build-time processing

**Example:**
```go
// layouts/index.json
{{- $nodes := slice -}}
{{- $links := slice -}}
{{- range .Site.RegularPages -}}
  {{- $nodes = $nodes | append (dict
      "id" .File.UniqueID
      "title" .Title
      "url" .RelPermalink
      "tags" .Params.tags
  ) -}}
  {{- range .Params.tags -}}
    {{- $tag := . -}}
    {{- range $.Site.RegularPages -}}
      {{- if and (ne . $) (in .Params.tags $tag) -}}
        {{- $links = $links | append (dict
            "source" $.File.UniqueID
            "target" .File.UniqueID
            "type" "tag"
        ) -}}
      {{- end -}}
    {{- end -}}
  {{- end -}}
{{- end -}}
{{- dict "nodes" $nodes "links" $links | jsonify -}}
```

**Source:** [Hugo Custom Output Formats Documentation](https://gohugo.io/configuration/output-formats/) (HIGH confidence)

### Pattern 2: Layered Canvas for Performance
**What:** Separate static background canvas from animated foreground canvas
**When:** Complex animations with both static and dynamic elements
**Why:** Avoids re-rendering static elements, reduces GPU load

**Example:**
```javascript
// Static background layer
const bgCanvas = document.getElementById('bg-canvas');
const bgCtx = bgCanvas.getContext('2d', { alpha: false });
// Draw grid, gradients once

// Animated layer
const animCanvas = document.getElementById('anim-canvas');
const animCtx = animCanvas.getContext('2d', { alpha: true });
function animate() {
  animCtx.clearRect(0, 0, width, height);
  // Draw moving elements only
  requestAnimationFrame(animate);
}
```

**Source:** [MDN Canvas Optimization](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) (HIGH confidence)

### Pattern 3: D3 Force-Directed Graph with Static Data
**What:** Load JSON graph data once, D3 force simulation updates positions
**When:** Visualizing relationships in static content (posts, tags)
**Why:** Familiar pattern, well-documented, handles layout automatically

**Example:**
```javascript
fetch('/graph-data.json')
  .then(r => r.json())
  .then(data => {
    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));

    simulation.on("tick", () => {
      // Update SVG link/node positions
    });
  });
```

**Source:** [D3 Force-Directed Graph Component](https://observablehq.com/@d3/force-directed-graph-component) (HIGH confidence)

### Pattern 4: Cross-Document View Transitions (MPA)
**What:** CSS-only smooth transitions between different HTML pages
**When:** Hugo multi-page site with same-origin navigation
**Why:** Native browser feature, no JavaScript required, progressive enhancement

**Example:**
```css
/* In main stylesheet */
@view-transition {
  navigation: auto; /* Enables for push/replace/traverse */
}

/* Customize specific elements */
.post-title {
  view-transition-name: title;
}

.post-content {
  view-transition-name: content;
}
```

**Browser Support:** Chrome 126+, Edge 126+, Safari 18.2+ (as of 2026-01)
**Fallback:** Graceful degradation to instant navigation in unsupported browsers

**Source:** [Chrome Cross-Document View Transitions](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document) (HIGH confidence)

### Pattern 5: Comments Backend - Separate Service Architecture
**What:** Deploy comments backend as separate container from static nginx
**When:** Building hybrid static+dynamic architecture
**Why:** Independent scaling, easier updates, follows 2026 hybrid architecture patterns

**Example Docker Compose:**
```yaml
services:
  blog-static:
    image: nginx:alpine
    volumes:
      - ./public:/usr/share/nginx/html:ro

  blog-comments:
    build: ./comments-service
    environment:
      DATABASE_PATH: /data/comments.db
    volumes:
      - comments-data:/data

  reverse-proxy:
    image: nginx:alpine
    depends_on: [blog-static, blog-comments]
    # Proxy /api/comments/* to blog-comments
    # Proxy /* to blog-static
```

**Source:** Based on [Serverless vs Containers 2026 trends](https://dev.to/ripenapps-technologies/serverless-vs-containers-whats-winning-in-2026-556e) showing 78%+ teams using hybrid architectures (MEDIUM confidence)

## Anti-Patterns to Avoid

### Anti-Pattern 1: Runtime Content Processing
**What:** Fetching markdown or processing content in browser
**Why bad:** Hugo already does this at build time, duplicates work, slower UX
**Instead:** Generate all needed data (HTML, JSON) at build time, load static files at runtime

### Anti-Pattern 2: Heavy JavaScript Animation Libraries
**What:** Using GSAP, Three.js, or complex libraries for simple background animation
**Why bad:** Large bundle size (100KB+), overkill for geometric patterns
**Instead:** Native Canvas API with requestAnimationFrame is <5KB, sufficient for Perlin noise/Voronoi/particles

### Anti-Pattern 3: Canvas shadowBlur for Performance-Critical Animations
**What:** Using `ctx.shadowBlur` in animation loop
**Why bad:** Extremely expensive GPU operation, causes jank on scroll/interaction
**Instead:** Pre-render shadows to off-screen canvas, or use CSS shadows on container

**Source:** [MDN Canvas Optimization - Avoid Expensive Operations](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) (HIGH confidence)

### Anti-Pattern 4: Polling Comments API
**What:** setInterval to check for new comments every N seconds
**Why bad:** Unnecessary server load, battery drain, overkill for low-traffic personal blog
**Instead:** Load comments once on page load, manual refresh if needed (no real-time requirement per PROJECT.md)

### Anti-Pattern 5: Client-Side Only SQLite
**What:** Using sql.js-httpvfs to query SQLite directly from browser
**Why bad:** Comments need write capability, sql.js-httpvfs is read-only
**Instead:** Traditional REST API with server-side SQLite for read+write operations

**Note:** Read-only SQLite via [sql.js-httpvfs](https://github.com/phiresky/sql.js-httpvfs) is valid for other use cases (static datasets), just not comments.

## Build Order and Dependencies

### Phase 1: Build-Time Foundation
**Must complete first** - All interactive features depend on Hugo generating correct structure

1. **Configure Hugo custom output format** for graph JSON
2. **Create graph data template** (`layouts/index.json`)
3. **Test build** → Verify graph-data.json generates correctly

**Why first:** Canvas, graph, and comments all need HTML structure and data files Hugo generates

### Phase 2: Client-Side Enhancements (Parallel)
**Can build simultaneously** - No dependencies between features

**Canvas Animation:**
- Initialize canvas on DOMContentLoaded
- requestAnimationFrame loop
- Mouse event listeners
- Independent, doesn't affect other features

**Knowledge Graph:**
- Fetch graph-data.json (depends on Phase 1 output)
- D3.js initialization
- Render to dedicated container
- Independent from canvas/comments

**View Transitions:**
- Add CSS `@view-transition` rule
- Add `view-transition-name` to key elements
- Test navigation between pages
- Pure CSS, no JS dependencies

**Why parallel:** Each feature operates independently, shares only DOM/CSS foundation

### Phase 3: Comments Backend
**Can start in parallel with Phase 2** - Backend doesn't depend on frontend features

1. **Backend service** (Node.js or Go + SQLite)
2. **API endpoints** (GET/POST comments)
3. **Rate limiting + spam prevention**
4. **Docker containerization**

**Why separate timeline:** Backend can be developed/tested independently, integrated last

### Phase 4: Integration
**Requires Phases 1-3 complete**

1. **Comments UI** fetches from API (needs Phase 3 backend)
2. **Nginx configuration** for reverse proxy (needs Phase 3 running)
3. **Docker Compose** orchestration
4. **End-to-end testing**

## Deployment Considerations

### Single Container (Simpler)
**Pros:**
- Single deployment artifact
- Simpler networking (localhost communication)
- Easier local development

**Cons:**
- Coupled lifecycle (nginx update = backend restart)
- Mixed concerns in one container
- Harder to scale independently

### Separate Containers (Recommended for 2026)
**Pros:**
- Independent scaling (static vs dynamic traffic patterns differ)
- Deploy backend updates without touching static content
- Aligns with 2026 hybrid architecture trends (78%+ adoption)
- Clearer separation of concerns

**Cons:**
- Slightly more complex Docker Compose
- Network configuration between containers

**Recommendation:** Start with separate containers. Modern Docker Compose makes this trivial, and flexibility is worth minimal added complexity.

## Performance Budgets

| Feature | Bundle Size | Runtime Impact | Notes |
|---------|------------|----------------|-------|
| Canvas Animation | <5KB custom JS | ~2-3ms/frame | requestAnimationFrame throttles to 60fps |
| D3.js | ~70KB (minified) | One-time layout | Force simulation runs once, then static |
| View Transitions | 0KB (CSS-only) | Native browser | Zero performance cost |
| Comments | <2KB fetch logic | On-demand HTTP | Only loads when user scrolls to comments |

**Total JavaScript for interactivity:** ~77KB (D3 + custom code)
**Existing JS:** Pagefind (~50KB), Tailwind utilities
**Budget:** <150KB total JS is reasonable for modern blog

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| **Static content** | nginx handles easily | CDN optional | CDN required |
| **Canvas animation** | Client-side, no server impact | Client-side | Client-side |
| **Graph visualization** | Static JSON <10KB | Static JSON <100KB | Consider pagination/filtering |
| **Comments API** | SQLite in-memory mode | SQLite with WAL mode | Migrate to PostgreSQL |
| **Comments UI** | Load all on page load | Pagination (load first 50) | Pagination + caching |

**Current target:** Personal blog, <1K monthly visitors → All "100 users" solutions sufficient

## Sources

**HIGH Confidence:**
- [Hugo Custom Output Formats](https://gohugo.io/configuration/output-formats/)
- [MDN Canvas Optimization](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- [D3 Force-Directed Graph](https://observablehq.com/@d3/force-directed-graph-component)
- [Chrome Cross-Document View Transitions](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document)

**MEDIUM Confidence:**
- [Hugo Static Site Interactive Features](https://adriano.fyi/posts/2023/2023-07-04-making-hugo-static-sites-dynamic-with-htmx-and-go/) (Community example)
- [Serverless vs Containers 2026](https://dev.to/ripenapps-technologies/serverless-vs-containers-whats-winning-in-2026-556e) (Trend data)
- [SQLite with Node.js 2026](https://betterstack.com/community/guides/scaling-nodejs/nodejs-sqlite/) (Implementation guide)

**LOW Confidence (flagged for validation):**
- Comments backend architecture (no Hugo-specific canonical pattern, extrapolated from general static site practices)
- Graph data structure specifics (will need validation with actual Hugo template testing)
