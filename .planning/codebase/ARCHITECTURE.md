# Architecture

**Analysis Date:** 2026-01-29

## Pattern Overview

**Overall:** Static Site Generation with Hugo + Client-side Interactivity

**Key Characteristics:**
- Server-side rendering of static HTML via Hugo
- Client-side JavaScript for interactive features (theme toggle, search, animations)
- CSS-in-JS workflow via Tailwind CSS with PostCSS processing
- Decoupled content (Markdown) from presentation (HTML templates)
- Canvas-based animated background with Perlin noise

## Layers

**Content Layer:**
- Purpose: Author-facing markdown files that define blog posts, pages, and metadata
- Location: `/content/`
- Contains: Markdown files (.md) with YAML frontmatter (title, date, tags, description)
- Depends on: Hugo schema expectations (taxonomies, date format)
- Used by: Hugo build process to generate pages

**Template Layer:**
- Purpose: Hugo template files that transform content into HTML
- Location: `/layouts/`
- Contains: Hugo templating syntax (if, range, with blocks) + Tailwind CSS classes
- Depends on: Hugo functions/variables (.Title, .Content, .Params, .Site)
- Used by: Hugo renderer to generate pages during build

**Style Layer:**
- Purpose: Styling and utility classes
- Location: `/assets/css/main.css` (source) → compiled to public via Tailwind + PostCSS
- Contains: Tailwind directives (@tailwind base/components/utilities), custom @layer rules
- Depends on: Tailwind CSS framework, PostCSS plugins (autoprefixer)
- Used by: Browser to style all pages

**Client Script Layer:**
- Purpose: Browser-side interactivity and animations
- Location: `/static/js/` (checked in) and `/layouts/partials/scripts.html` (inline)
- Contains: Vanilla JavaScript for theme toggle, search modal, mobile menu, flow field animation
- Depends on: Pagefind library for search indexing
- Used by: Browser to enhance UX during page interaction

**Static Assets Layer:**
- Purpose: Pre-generated files copied directly to public directory
- Location: `/static/`
- Contains: JavaScript libraries (perlin.js, flow-field-background.js)
- Depends on: None
- Used by: Browser at runtime

**Configuration Layer:**
- Purpose: Build and deployment settings
- Location: `hugo.toml`, `tailwind.config.js`, `postcss.config.js`, `package.json`
- Contains: Site metadata, theme options, build pipelines
- Depends on: Hugo, Node ecosystem expectations
- Used by: Build system and development servers

## Data Flow

**Build-time Flow:**

1. **Content Input:** Markdown files in `/content/` + archetypes in `/archetypes/`
2. **Hugo Processing:** Reads content, applies taxonomies (tags/categories), renders with templates
3. **Template Rendering:** `/layouts/` templates process Hugo context (. object) → HTML
4. **CSS Processing:** `main.css` + Tailwind config → PostCSS → minified output
5. **Static Copy:** Files in `/static/` copied to `/public/`
6. **Search Index:** Pagefind scans generated HTML → creates search index
7. **Output:** Complete static site in `/public/`

**Runtime Flow (Browser):**

1. User requests page → Browser downloads HTML from server
2. HTML loads CSS, JavaScript bundles
3. `head.html` partial runs dark mode detection script (checks localStorage + system preference)
4. `header.html` renders with theme toggle, search button, mobile menu
5. Main content renders from layout (index.html, single.html, list.html)
6. `scripts.html` initializes:
   - Theme toggle listener
   - Mobile menu toggle
   - Search modal (Pagefind UI)
   - Flow field canvas animation
7. `flow-field-background.js` initializes: creates canvas, runs animation loop with Perlin noise
8. User interactions trigger JavaScript handlers → DOM updates

**Content Taxonomy Flow:**

- Posts in `/content/posts/` → rendered to `/posts/` URL path
- Tags defined in frontmatter → generates `/tags/[tag-name]/` pages via Hugo taxonomy
- Categories (if used) → generates `/categories/[category]/` pages
- List template iterates `.Pages` → displays posts with metadata

## Key Abstractions

**Template Inheritance:**
- Purpose: DRY template structure
- Examples: `baseof.html` defines overall page structure; `_default/single.html` and `_default/list.html` define specific block content
- Pattern: `{{ block "main" . }}{{- end }}` in baseof.html; `{{ define "main" }} ... {{ end }}` in child templates

**Partials (Reusable Components):**
- Purpose: Extract common layout sections
- Examples: `head.html`, `header.html`, `footer.html`, `scripts.html`
- Pattern: `{{ partial "component-name.html" . }}` includes partial with current context

**Taxonomies (Content Organization):**
- Purpose: Classify posts without nested directories
- Examples: Tags, categories (configured in `hugo.toml`)
- Pattern: Frontmatter `tags: [tag1, tag2]` → Hugo auto-generates taxonomy pages

**Configuration Objects:**
- Purpose: Centralize magic numbers and constants
- Examples: `tailwind.config.js` theme extensions, `CONFIG` object in `flow-field-background.js`
- Pattern: JS/config files define constants; templates/scripts reference them

## Entry Points

**Build Entry:**
- Location: `hugo.toml`
- Triggers: `npm run build` or `hugo` command
- Responsibilities: Define site baseURL, output formats, taxonomies, menus; point Hugo to content/layouts

**Development Server:**
- Location: `package.json` → `npm run dev`
- Triggers: `hugo server --buildDrafts --buildFuture`
- Responsibilities: Watch file changes, rebuild incrementally, serve with live reload

**Homepage:**
- Location: `/layouts/index.html`
- Triggers: User visits `/`
- Responsibilities: Render hero section, list 5 recent posts, link to full post list

**Post Single Page:**
- Location: `/layouts/_default/single.html`
- Triggers: User visits `/posts/[slug]/`
- Responsibilities: Render article header (date, title, description, tags), content, post navigation

**Post List Page:**
- Location: `/layouts/_default/list.html`
- Triggers: User visits `/posts/`, `/tags/[tag]/`, or `/categories/[cat]/`
- Responsibilities: List posts with pagination, show title/description/tags

**Search:**
- Location: Header search button → `scripts.html` opens Pagefind modal
- Triggers: Click search icon, Cmd/Ctrl+K, focus search input
- Responsibilities: Search across all page content, display results

**Background Animation:**
- Location: `/static/js/flow-field-background.js`
- Triggers: Page load (script tag in `baseof.html`)
- Responsibilities: Create canvas, animate particles with Perlin noise flow field, respond to mouse input

## Error Handling

**Strategy:** Graceful degradation for missing content/features

**Patterns:**
- Hugo `with` blocks: `{{ with .Description }}{{ . }}{{ else }}fallback{{ end }}`
- Missing images/content: List pages show "No posts yet" message
- JavaScript feature detection: Dark mode falls back to system preference; animations disable on mobile/reduced motion
- Search: Pagefind UI handles missing search index gracefully

## Cross-Cutting Concerns

**Logging:** No structured logging. `console.log()` used minimally in animations for debugging.

**Validation:**
- Hugo frontmatter validation via archetype defaults
- No runtime validation (static site)

**Authentication:** Not applicable (static site)

**Dark Mode:**
- System preference detection in `head.html`
- User preference saved to localStorage
- Class-based CSS (`dark:` Tailwind prefix)
- JavaScript toggles `dark` class on `<html>` element

**Responsive Design:**
- Tailwind breakpoints (sm, md, lg, xl)
- Fluid typography using `clamp()` CSS function
- Mobile menu hidden by default, shown on click
- Grid/flex layouts adjust per breakpoint

**Performance Optimization:**
- Static HTML (no runtime rendering cost)
- CSS minification in production (`| minify | fingerprint` in head.html)
- Deferred image loading (no lazy loading configured)
- Canvas animation respects `prefers-reduced-motion` via `isMobile` check

---

*Architecture analysis: 2026-01-29*
