# Decision Log — Retention Loop Analyzer

## 1. Problem Statement

**Persona + Situation + Outcome formula:**

A Senior Growth PM at a Series B consumer app who has just received a week-1 retention report showing a 40% drop between activation and the core engagement loop — and needs to identify the exact friction point, model an intervention, and present a corrective plan to the CPO by Friday morning — currently has to run three separate tools in parallel: Amplitude for funnel drop-off data, Miro for drawing the behavioral loop, and a spreadsheet to model intervention scenarios.

**Why this moment is specific:** The Friday leadership cadence creates a hard deadline. The mismatch between three tools with incompatible output formats means the PM spends 60–70% of their time on assembly, not analysis.

## 2. What Was Built

Four-screen behavioral retention tool:

1. **Loop Builder** — Orbital node canvas (Trigger, Action, Reward, Investment) with a real-time Stability Index and a Node Inspector panel for tuning friction, trigger logic, and reward strength
2. **Behavioral Flow** — Sankey-style flow map with live breakpoint detection and friction magnitude scoring
3. **Intervention Simulator** — Side-by-side baseline vs. simulation with three variable sliders driving a projected 90-day retention curve
4. **Insights** — Executive strategy deck with a Health Index, critical alert bento cards, and a prioritized action queue

## 3. Key Decisions

### Navigation: Tab Bar Over Full-Screen Modal
Chose top tab bar navigation over full-page modal transitions because the PM workflow requires moving between Loop Builder and Simulator iteratively. Tab bar makes the active context explicit and supports rapid back-and-forth.

### Single SPA Over Multi-File Pages
Four screens are delivered as one `index.html` with a JS router toggling screen visibility. This eliminates state loss on navigation and makes the artifact trivially shareable — one URL, no build step.

### Dark Theme With Neon Accents (Not Enterprise Neutral)
Most analytics tools default to neutral gray or white. This design uses `#131313` surface with cyan + magenta + chartreuse — a dense-analyst-console aesthetic that signals "live system" rather than "static report." Intentional choice to match the high-urgency, real-time framing of the problem.

### Tailwind CDN (No Build)
Tailwind Play CDN with inline config is used instead of a build pipeline. Trade-off: runtime compilation, larger payload. Benefit: zero setup friction for reviewers, and the artifact works by opening the file directly.

## 4. What Was Cut

| Feature | Why Cut |
|---|---|
| Live data integration (Amplitude/Mixpanel) | Requires backend OAuth flow; out of scope for a PM tool prototype |
| Draggable node repositioning in Loop Builder | Adds drag-state complexity; visual positioning communicates the loop structure without full drag support |
| Persistent loop state / shareable URLs | No backend; would require a storage layer |
| Actual chart animations | Kept charts as static bar columns to focus attention on the comparison pattern, not motion |

## 5. Routing Decision

**Target: `/projects/`**

The artifact is structurally complete with all four screens, a coherent persona-problem-solution arc, non-trivial visual design, and working navigation. Decision log and README meet the specificity requirements.

## 6. Validation Notes

- All three source files (index.html, styles.css, app.js) are non-empty
- Navigation renders correctly — tab active state and screen toggling work via `data-tab` attributes
- Simulator floating insights card is screen-scoped (only appears on Simulator tab)
- Loop Builder footer status bar is screen-scoped

## 7. V2 Roadmap

1. **Loop state serialization** — Serialize node weights + slider values to a URL hash so PMs can share a pre-configured loop scenario before the meeting
2. **Mixpanel/Amplitude webhook import** — Accept a CSV funnel export and auto-populate the Behavioral Flow screen with real drop-off numbers
3. **Intervention history** — Save named simulation runs to compare multiple "what-if" scenarios side by side on the Insights deck
