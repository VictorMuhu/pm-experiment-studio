# Idea Validator

> A structured idea review workspace that scores a product idea across seven dimensions, surfaces fragile assumptions, and produces a clear verdict with next steps.

**Status:** `draft`
**Complexity:** `complex`
**Bucket:** `analytics-debugging`

---

## Goal

Enable a senior PM or founder to turn a fuzzy “we should build X” suggestion into an explicit, defensible go/no-go decision in under 15 minutes, with a written rationale they can reuse in a roadmap or leadership sync.

---

## Problem

In roadmap planning, the most confident voice often wins: a Head of Product or founder hears an idea, feels urgency, and commits time before the team has made the key assumptions explicit (who hurts, how often, why existing alternatives fail, and what makes this different). The failure mode shows up weeks later as slow adoption, unclear positioning, and scope creep—because the idea was never forced through a structured evaluation that makes weakness visible early.

---

## Why This Exists

A static checklist or spreadsheet can score an idea, but it doesn’t catch the most common pre-commitment errors: vague value props, “me-too” markets, hidden complexity, and untestable assumptions. This tool ties scoring to a live, progressive review flow—where each score prompts a short evidence note and generates a weakness scan—so the decision is explainable, not just numerical.

---

## Target Persona

A Head of Product or founder at a 20–200 person B2B SaaS company, trying to decide whether a new idea deserves roadmap capacity without a dedicated strategy or research team available for deep validation this week.

---

## Use Cases

- A Head of Product evaluates an inbound “enterprise asks for it” request before committing a squad to discovery.
- A founder sanity-checks a new adjacent-market idea the night before a board update and needs a crisp verdict and rationale.
- A PM lead compares two competing Q3 bets with the same rubric so trade-offs are explicit, not political.
- A product trio (PM/Design/Eng) uses it in a 30-minute working session to surface the assumptions that must be tested before scoping.

---

## Barebones Wireframe

```
┌───────────────────────────────────────────────────────────────────────────┐
│ IDEA VALIDATOR                                                           │
│ [Load example ▾]                                     Verdict: NEEDS WORK │
├───────────────────────────────────────────────────────────────────────────┤
│ Idea input                                                                │
│  Title: [_____________________________]                                   │
│  Target user: [_______________________]  Context: [____________________]  │
│  One-line value prop: [_______________________________________________]   │
│  Trigger moment (when do they feel it?): [____________________________]   │
│                                                                           │
│ Evaluation dimensions (live score + evidence note)                         │
│  Pain intensity      [ 7 ]  Evidence: [_______________________________]   │
│  Frequency           [ 5 ]  Evidence: [_______________________________]   │
│  Alternatives        [ 4 ]  Evidence: [_______________________________]   │
│  Differentiation     [ 3 ]  Evidence: [_______________________________]   │
│  Complexity          [ 6 ]  Evidence: [_______________________________]   │
│  Time-to-value       [ 5 ]  Evidence: [_______________________________]   │
│  Business impact     [ 8 ]  Evidence: [_______________________________]   │
│                                                                           │
│ Assumption breakdown (prompted by low/uncertain scores)                   │
│  Must-be-true assumptions (3–6 bullets)                                   │
│  Riskiest assumption + fastest test                                       │
│                                                                           │
│ Weakness detection (auto-generated flags + what to tighten)               │
│  - “Vague value prop” flag + suggested rewrite pattern                    │
│  - “Crowded market” flag + differentiation questions                      │
│  - “Hidden complexity” flag + scope traps checklist                       │
│                                                                           │
│ Next steps                                                                │
│  [Copy decision brief] [Export Markdown]                                  │
└───────────────────────────────────────────────────────────────────────────┘

Right side panel (sticky):
- Score summary (radar or bars)
- Key flags (top 3)
- Verdict rationale (3 bullets)
- Next steps (3 bullets)
```

---

## Product Decisions

- **Seven fixed dimensions with required evidence notes:** Each score is paired with a short “evidence” field to force traceability. Alternative was pure numeric scoring; rejected because it produces confident-looking numbers with no rationale to reuse in a leadership discussion.
- **Progressive disclosure instead of one long form:** Assumptions and weakness detection expand only after the idea and scores exist. Alternative was showing everything at once; rejected because it overwhelms the user and encourages skipping the sections that create the most insight.
- **Verdict panel is sticky and changes live:** The verdict updates as scores/evidence change so the user sees cause-and-effect. Alternative was a final “Generate verdict” button; rejected because it encourages a “magic button” moment and reduces iteration.
- **Weakness detection is rule-driven, not LLM-authored:** Flags are derived from score patterns and common failure signatures (e.g., low differentiation + high alternatives). Alternative was AI-generated critique; rejected because it tends to sound generic and is hard to trust without a review loop.

---

## Tech Stack

- **Runtime:** Vanilla JavaScript — runs locally with no build step so it works as an internal tool prototype.
- **Framework:** none — plain HTML/CSS/JS to keep interaction fast and inspectable.
- **AI/API:** none — deterministic rubric and rule engine.
- **Styling:** Custom CSS following the `executive-monochrome` style spec (dark editorial workspace, minimal sharp components).
- **Data:** none — stateless; example ideas are bundled in the app.
- **Deployment:** Static hosting (Replit/Netlify/GitHub Pages) — single folder.

---

## How to Run

**Prerequisites:** None.

```bash
# Clone
git clone <repo-url>
cd projects/2026-03-17-idea-validator

# Install
# No install required.

# Run
# Open the file directly (or serve locally if you prefer)
```

**Open:** `src/index.html` in your browser (or serve the folder with any static server).

---

## Screenshots

Screenshot pending — see screenshots/PENDING.md for capture instructions.

---

## Future Enhancements

- **Team comparison mode:** Evaluate two ideas side-by-side with deltas highlighted. Deferred because it adds UI density and state management that could distract from validating the single-idea flow first.
- **Saved briefs + history:** Persist past evaluations and let users revisit decisions. Deferred because it requires a storage layer and raises questions about sharing/permissions.
- **Calibration presets:** Adjustable weighting profiles (e.g., “enterprise readiness” vs “self-serve growth”). Deferred because fixed weights are simpler for V1 and weighting should be validated with real usage.
- **Evidence quality prompts:** Tighten evidence notes with templates (customer quotes, ticket counts, revenue impact). Deferred because it risks turning into a documentation tool rather than a decision tool.

---

## Decision Log

See [decision-log.md](./decision-log.md) for a full record of design and scoping decisions.
