# Decision Log — Feature Flag Impact Board

## Summary
This log captures key product, UX, and technical decisions for building a simple, fully-renderable internal dashboard to monitor post-release feature flag impact.

## Product Decisions

### 1) Primary object model: “Flag impact” as a first-class card/table row
**Decision:** Represent each feature flag as a row with rollout %, owner, metric movement, and risk status.
**Rationale:** These are the minimum fields needed for fast scanning and daily monitoring. Keeping them in a dense table optimizes for analyst workflows.
**Implication:** Additional fields (segments, environments, experiment IDs) are deferred to Future Enhancements.

### 2) Two-pane layout: list + detail panel
**Decision:** Use a master-detail pattern where selecting a flag updates a right-side detail panel (desktop) and navigates to a detail view (mobile).
**Rationale:** Analysts need both overview and drill-down without losing context. Master-detail is a common premium SaaS pattern.
**Implication:** State management should keep the selected flag stable across filters/sorts where possible.

### 3) Risk status as a prominent signal
**Decision:** Include a “Risk” column with color-coded badge (Low/Medium/High) and allow sorting/filtering by risk.
**Rationale:** Operationally, risk drives attention and prioritization more than raw metric movement alone.
**Implication:** Risk is derived from a simple heuristic in mock data (e.g., negative KPI delta + high rollout) and can be replaced later with real rules.

### 4) Metric movement shown as delta + sparkline
**Decision:** Show a compact delta (e.g., +1.8%) and a small sparkline in the detail panel.
**Rationale:** PMs need quick directional context; sparklines provide trend without heavy charting complexity.
**Implication:** Use lightweight charting (Recharts or inline SVG) to keep build simple.

## UX & Visual Design Decisions

### 5) Dark modern analyst dashboard theme
**Decision:** Default to a dark, modern, premium SaaS aesthetic with strong typography, subtle borders, and restrained accent colors.
**Rationale:** Matches requirement and supports long monitoring sessions with reduced glare.
**Implication:** Ensure contrast/accessibility; avoid overly saturated colors for large areas.

### 6) Dense table with sticky header + responsive card layout
**Decision:** Desktop uses a dense table with sticky header; mobile switches to cards.
**Rationale:** Tables are best for scanning. Cards improve readability on small screens.
**Implication:** Implement responsive breakpoints and ensure the detail panel becomes a full-screen route/modal on mobile.

### 7) Status chips and consistent semantic colors
**Decision:** Use semantic mapping:
- Low: green
- Medium: amber
- High: red
- Paused: muted/gray
**Rationale:** Standard operational semantics; faster comprehension.
**Implication:** Must test in dark mode for legibility; use tinted backgrounds + clear text.

## Technical Decisions

### 8) Fully renderable without backend
**Decision:** Ship with seeded mock data (JSON/TS) and local state for selections, filters, and sorting.
**Rationale:** Requirement is “fully renderable app” with simple complexity; avoids backend scope.
**Implication:** Data access is abstracted behind a small adapter so it can later be replaced with API calls.

### 9) Project structure and artifact requirements
**Decision:** Create `/projects/YYYY-MM-DD-feature-flag-impact-board` containing:
- `README.md`
- `manifest.json`
- `decision-log.md`
- `screenshots/`
- `src/` + full Vite app
**Rationale:** Consistency with internal experiment repository conventions and portability.
**Implication:** Keep paths and scripts relative to this folder.

### 10) Preview validation before PR
**Decision:** Add a “validate preview” step via script (e.g., `npm ci && npm run build && npm run preview -- --host` or a headless smoke test) before opening PR.
**Rationale:** Prevent broken previews and ensure the app is actually renderable.
**Implication:** Keep validation fast; prioritize build success and basic route render.

### 11) Branch + PR workflow
**Decision:** Work in a dedicated branch named `exp/feature-flag-impact-board` (or date-prefixed) and open a PR against `main`.
**Rationale:** Required by the prompt; standard collaboration practice.
**Implication:** PR should include screenshots in `screenshots/` and brief testing notes.

## Non-Goals (for this simple version)
- Authentication/authorization
- Real integrations with feature flag providers or analytics warehouses
- Multi-environment (dev/stage/prod) support
- Alerting/notification system

## Open Questions
- What is the canonical definition of “metric movement” (which metric, window, and baseline)?
- Should the board support multiple metrics per flag or just a single “primary KPI”?
- Do we need an explicit “rollback recommended” state beyond risk level?
