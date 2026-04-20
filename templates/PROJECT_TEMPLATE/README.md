<!-- GENERATOR INSTRUCTIONS
     Replace every bracketed placeholder with real content.
     Delete all HTML comments before publishing.
     Do not add sections. Do not rename sections.
     Aim for one tight paragraph per section unless noted otherwise.
     If a section genuinely does not apply, write "N/A — [one sentence why]" rather than leaving it blank or padding it.
-->

# [Project Name]

<!-- One sentence. What is this thing? Lead with the artifact, not the backstory.
     Example: "A scored checklist that flags gaps in a PRD before it goes to engineering."
     Not: "This project is a tool I built to help product managers improve their PRDs."
-->

> [One-line description of what this is and what it does.]

**Status:** `draft` | `published` | `archived`
**Complexity:** `simple` | `intermediate` | `complex`
**Bucket:** `pm-productivity` | `gtm-workflow` | `analytics-debugging` | `customer-experience` | `internal-tooling` | `decision-support`
**Skills applied:** See [SKILL_MAP.md](./SKILL_MAP.md)

---

## Goal

<!-- What outcome does this project produce for the person using it?
     One or two sentences. Measurable if possible.
     Example: "A PM using this tool should be able to identify the top 3 structural gaps
     in a requirements doc in under 5 minutes, before sending it for eng review."
     Not: "The goal is to help PMs write better PRDs and improve team efficiency."
-->

[What a user should be able to do after using this that they couldn't easily do before.]

---

## Problem

<!-- The specific failure mode this addresses. Be precise.
     Name the moment, the person, and what goes wrong.
     One paragraph. No more.
     Example: "By the time a PRD reaches engineering kickoff, gaps surface as questions:
     missing error states, undefined edge cases, no rollback plan. These are asked live,
     in front of the team, under time pressure. The review that should have caught them
     happened too late or not at all."
     Not: "PRD quality is a problem in many organizations."
-->

[Name the specific failure mode. Who experiences it, when, and what the consequence is.]

---

## Why This Exists

<!-- The PM rationale. Why build this instead of using a doc template, a checklist, or nothing?
     What does the artifact form do that a static document can't?
     One paragraph. Answer the "why not just use a spreadsheet" question preemptively.
-->

[The reason the interactive/generative form of this is better than a static alternative.]

---

## Target Persona

<!-- One specific person in a specific context. Not a persona card — a sentence.
     Include: role, company stage or context, what they're trying to accomplish.
     Example: "A PM at a 50–200 person B2B SaaS company writing a PRD for a mid-sized
     feature, working without a dedicated QA or technical writer to review it."
     Not: "Product managers at software companies."
-->

[Role] at [context/company type], [what they are trying to do and what constraint they're operating under].

---

## Use Cases

<!-- 3–5 concrete scenarios where this gets used. Bullet list.
     Each bullet is one sentence. Specific enough that someone can picture the exact moment.
     Example:
     - A PM pastes a requirements doc before sending it to the engineering lead for kickoff review.
     - A PM lead uses it to calibrate quality across PRDs submitted by their team.
     - An IC PM uses it mid-draft to self-audit before asking for async feedback.
     Not: "Can be used by anyone who needs to review documents."
-->

- [Specific scenario 1 — who does what, at what moment, with what input]
- [Specific scenario 2]
- [Specific scenario 3]
- [Specific scenario 4 — optional]
- [Specific scenario 5 — optional]

---

## Barebones Wireframe

<!-- A plain-text or ASCII sketch of the interface or interaction flow.
     This does not need to be pretty. It needs to be unambiguous about layout and sequence.
     For a single-page tool: sketch the input area, trigger, and output structure.
     For a multi-step flow: show the steps in sequence with what each step contains.
     For a CLI tool: show the command signature and example terminal output.
     Use code blocks for all wireframe content.

     Example — single page tool:
     ┌──────────────────────────────────────────────┐
     │  [Paste PRD text here]                       │
     │                                              │
     │  [ Analyze ]                                 │
     ├──────────────────────────────────────────────┤
     │  RESULTS                                     │
     │  ✗ Missing: success metric (line 4)          │
     │  ✗ Undefined: error state for empty input    │
     │  ✓ Rollback plan present                     │
     │  ✓ Acceptance criteria defined               │
     └──────────────────────────────────────────────┘
-->

```
[ASCII or plain-text wireframe of the primary interface or interaction]
```

---

## Product Decisions

<!-- 3–5 explicit decisions made during design or build. Not observations — decisions.
     Each bullet answers: what was decided, what the alternative was, why this over that.
     This is where the PM thinking lives. Vague decisions ("I kept it simple") don't count.
     Example:
     - Output is categorized by gap type (missing metric / undefined actor / no error state)
       rather than a flat list, so the PM knows who owns each fix without reading every item.
       Alternative was a flat prioritized list; rejected because priority without routing is
       still ambiguous.
     - Input is a single free-text paste rather than structured fields. Structured input would
       improve output quality but increases friction enough that the tool wouldn't be used mid-draft.
-->

- **[Decision title]:** [What was decided.] Alternative was [X]. Chose this because [specific reason tied to the use case or constraint].
- **[Decision title]:** [What was decided.] Alternative was [X]. Chose this because [specific reason].
- **[Decision title]:** [What was decided.] Alternative was [X]. Chose this because [specific reason].
- **[Decision title — optional]:** [What was decided and why.]
- **[Decision title — optional]:** [What was decided and why.]

---

## Tech Stack

<!-- List what was actually used. Specific names, not categories.
     If there is a notable reason for a stack choice (e.g., no backend to keep it deployable
     as a static file), note it in one clause.
     Example:
     - **Runtime:** Vanilla JS — no framework, runs as a static file with no build step
     - **AI:** Claude API (claude-sonnet-4-6) via direct fetch
     - **Styling:** Custom CSS following the `dense-analyst-console` style spec
     - **Deployment:** Netlify drop (drag-and-drop, no CI required)
-->

- **Runtime:** [specific language/runtime and brief reason if non-obvious]
- **Framework:** [specific framework or "none — vanilla [language]"]
- **AI/API:** [model and provider, or "none"]
- **Styling:** [approach and style spec reference]
- **Data:** [persistence layer or "none — stateless"]
- **Deployment:** [where and how]

---

## How to Run

<!-- Exact steps from a clean clone to a running instance.
     Assume the reader has basic dev familiarity but does not know your setup.
     If environment variables are required, name them and explain what they're for.
     If there are no dependencies: say so — "No install required. Open index.html in a browser."
     Do not skip steps. Do not write "standard setup."
-->

**Prerequisites:** [List any requirements — Node version, Python version, API keys needed, etc. Or "None."]

```bash
# Clone
git clone [repo-url]
cd projects/[folder-name]

# Install (if applicable)
[install command or "No install required."]

# Configure (if applicable)
cp .env.example .env
# Add your [API_KEY_NAME] — get one at [where]

# Run
[run command]
```

**Open:** [URL or instruction — e.g., "http://localhost:3000" or "Open index.html directly in a browser."]

---

## Screenshots

<!-- One screenshot minimum if the project has a UI.
     Use real or realistic data in the screenshot — not placeholder text.
     Caption each screenshot in one sentence.
     If the tool is CLI-only, include a terminal capture showing realistic output.
     If no screenshot exists yet, replace this section with:
     "Screenshot pending — see screenshots/PENDING.md for capture instructions."
-->

![Screenshot](./screenshots/screenshot.png)

<!-- Add additional screenshots for distinct states if useful:
     ![Results view](./screenshots/screenshot-results.png)
     ![Empty state](./screenshots/screenshot-empty.png)
-->

*[One-sentence caption describing what the screenshot shows and with what data.]*

---

## Future Enhancements

<!-- What would you build next if this project continued?
     3–5 items. Each as a concrete feature or change, not a vague direction.
     Include the reason it was deferred — scope, complexity, or validation needed first.
     Example:
     - **Segment by persona:** Show which gap types appear most often for a specific product area.
       Deferred because it requires storing analysis history, which adds backend complexity
       out of scope for the initial prototype.
     - **PRD format detection:** Auto-detect whether the input is a narrative PRD or a
       ticket-style spec and apply a different rubric. Deferred to validate that the
       current rubric is useful before adding variation.
-->

- **[Feature name]:** [What it would do.] Deferred because [specific reason — complexity, scope, or "needs validation first"].
- **[Feature name]:** [What it would do.] Deferred because [specific reason].
- **[Feature name]:** [What it would do.] Deferred because [specific reason].
- **[Feature name — optional]:** [What it would do and why deferred.]

---

## Decision Log

See [decision-log.md](./decision-log.md) for a full record of design and scoping decisions.
