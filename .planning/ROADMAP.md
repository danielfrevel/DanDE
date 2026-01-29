# Roadmap: Blog Enhancement

## Overview

Transform a basic Hugo blog into a visually distinctive experience through four sequential phases: establish readable layout and typography foundation, add mouse-reactive canvas background animation, integrate self-hosted comments with Isso, and polish navigation with View Transitions API. Knowledge graph visualization deferred to v2.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Layout & Typography Foundation** - Readable content structure with optimal line length and sticky footer
- [x] **Phase 2: Interactive Background** - Mouse-reactive Perlin noise flow field on canvas
- [ ] **Phase 3: Comments System** - Self-hosted Isso comments with spam protection
- [ ] **Phase 4: View Transitions** - Smooth page navigation with native API

## Phase Details

### Phase 1: Layout & Typography Foundation
**Goal**: Content is readable and professionally structured with proper spacing, width, and theme support
**Depends on**: Nothing (first phase)
**Requirements**: LAYOUT-01, LAYOUT-02, LAYOUT-03, LAYOUT-04, LAYOUT-05, LAYOUT-06
**Success Criteria** (what must be TRUE):
  1. Content has optimal line length (50-75 chars desktop) without horizontal scroll on mobile
  2. Footer stays at viewport bottom when content is short
  3. Typography scales smoothly across viewport sizes with variable font loading
  4. Light theme displays by default with functional dark mode toggle
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Tailwind typography config (65ch) and sticky footer layout
- [x] 01-02-PLAN.md — Variable font loading and light-default theme
- [x] 01-03-PLAN.md — Visual verification checkpoint

### Phase 2: Interactive Background
**Goal**: Subtle, performant background animation that reacts to mouse without impacting usability
**Depends on**: Phase 1
**Requirements**: BG-01, BG-02, BG-03, BG-04, BG-05
**Success Criteria** (what must be TRUE):
  1. Perlin noise flow field renders behind content without obscuring text
  2. Particles respond to mouse movement in real-time
  3. Animation respects prefers-reduced-motion (static fallback)
  4. Scrolling and interaction remain smooth (no jank) on desktop and mobile
  5. Animation pauses when tab is not visible
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — Core flow field animation with Simplex noise and mouse interaction
- [x] 02-02-PLAN.md — Browser optimizations and accessibility (visibility, reduced-motion, mobile)
- [x] 02-03-PLAN.md — Visual verification checkpoint

### Phase 3: Comments System
**Goal**: Visitors can leave guest comments with effective spam prevention
**Depends on**: Phase 2
**Requirements**: COMM-01, COMM-02, COMM-03, COMM-04, COMM-05
**Success Criteria** (what must be TRUE):
  1. Guests can submit comments without authentication on blog posts
  2. Comments display below post content with proper formatting
  3. Spam submissions are blocked by honeypot and rate limiting
  4. Isso backend runs in Docker container alongside static site
**Plans**: TBD

Plans:
- [ ] TBD

### Phase 4: View Transitions
**Goal**: Page navigation feels smooth and intentional without breaking unsupported browsers
**Depends on**: Phase 3
**Requirements**: VT-01, VT-02, VT-03
**Success Criteria** (what must be TRUE):
  1. Page transitions use View Transition API in supported browsers
  2. Navigation feels smooth without jarring instant load
  3. Browsers without View Transition support get instant navigation (progressive enhancement)
**Plans**: TBD

Plans:
- [ ] TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Layout & Typography Foundation | 3/3 | ✓ Complete | 2026-01-29 |
| 2. Interactive Background | 3/3 | ✓ Complete | 2026-01-29 |
| 3. Comments System | 0/TBD | Not started | - |
| 4. View Transitions | 0/TBD | Not started | - |
