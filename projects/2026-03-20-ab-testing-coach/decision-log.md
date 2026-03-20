# Decision Log — Empirical Ledger A/B Testing Coach

## 1. What This Project Optimized For

A Growth PM who has received an experiment read-out and needs to determine — before a 9 AM stakeholder call — whether the reported +4% lift is real, which guardrail metrics disqualify it, and what recommendation to commit to, all without access to a data analyst. This tool optimizes for that 20-minute independent decision window, not for ongoing experiment monitoring or historical trend analysis.

## 2. What Was Intentionally Left Out

**Live statistical computation engine**: Implementing true Bayesian power calculations or frequentist significance tests in the browser requires a numerics library (jStat, stdlib) and meaningful test data. The exact trade-off: adding real math would require either a backend or a 200KB+ JS dependency, both of which break the zero-dependency, instant-load design goal. The simulator instead uses preset scenario archetypes, which is sufficient for coaching the PM's decision logic.

**Persistent experiment state**: No localStorage, no database, no API. All inputs reset on reload. The trade-off: a PM working across multiple sessions loses their configuration. The counter-argument is that each experiment decision is a discrete moment — the tool is meant for in-session use alongside a live read-out, not as a system of record.

**Multi-arm experiment support (A/B/C testing)**: The UI assumes exactly two arms. Supporting three or more variants requires Bonferroni or Holm correction UI, which would add a full configuration screen and significant complexity. Cut because the vast majority of entry-level PM experiment decisions involve two arms.

**Historical experiment database**: A "past experiments" screen was considered for the Metrics tab. Cut because it would require either a backend or localStorage serialization, and the portfolio value of the tool comes from the decision workflow, not from data storage.

## 3. Major Product Trade-offs

**Single-file SPA vs. build toolchain**: The first design considered using React + Vite with component isolation. Rejected in favor of a single-file HTML app because: (1) it requires zero server infrastructure to serve, (2) it demonstrates the ability to ship a visually polished product without framework overhead, (3) it is trivially inspectable by portfolio reviewers who might view source.

**Tailwind CDN vs. compiled CSS**: Using the Tailwind CDN script at runtime means the CSS is not optimized for production (the tool ships the entire JIT engine to the browser). The alternative was running a build step. Decision: CDN wins for a portfolio artifact where cold-load performance matters less than zero-friction deployment. The CDN warning in the console is acknowledged and accepted.

**Preset simulation data vs. formula-driven outcomes**: The Simulator screen could compute expected power given sample size and baseline CVR. Instead it uses three fixed scenario outputs (Success, Neutral, Failure). Trade-off: a PM who needs to test "what if my baseline is 8.2% instead of 4.28%" cannot do so. Accepted because the coaching narrative (coach analysis text, decision banner) is more valuable for learning than the specific numbers.

**Sidebar navigation vs. tab bar**: A tab bar at the top was mocked. Sidebar won because (1) it mirrors professional analytics tools (Amplitude, Mixpanel) that the target persona uses daily, (2) it leaves more vertical space for content on the most data-dense screens (Metrics Dashboard, Simulator).

## 4. Design Choices Made

**Style direction: premium-saas.** The target persona — a Growth PM — spends their workday in tools like Amplitude, Hex, and Linear. A design that reads like a legitimate SaaS product (not a portfolio toy) signals that the artifact is production-quality. The Material Design 3 color system was chosen specifically because it provides a complete semantic token hierarchy (surface-container, on-surface-variant, tertiary-container, etc.) that makes dark/light mode trivial to add later.

**Blue primary (#0040e0) with green tertiary (#006242)**: The primary/tertiary pairing was chosen to create a clear semantic split — blue for interactive configuration elements (sliders, buttons, active nav), green for positive outcomes and success states. Red (#ba1a1a) is reserved exclusively for failure and warning states. This tricolor semantic system means the PM can read the emotional valence of a screen without reading the labels.

**Sidebar active state — blue left border + white background**: Tested against a filled-blue pill and a bottom-border indicator. The left-border pattern won because it persists across all screen heights without reflow, reads as "current location" (not "selected action"), and is consistent with Linear, Notion, and Figma's navigation patterns.

**Success Threshold slider as green, Failure slider as red**: The color-coded thumb directly encodes the direction of the decision. A PM dragging the green thumb right is "raising the bar for shipping." The alternative (a neutral gray range with colored labels) required the user to read the label to understand direction. The colored thumb makes the directionality instantaneous.

## 5. Technical Shortcuts and Constraints

**In-memory state only**: No localStorage or session persistence is used — USER COST: if the user closes or refreshes the tab mid-session, all slider positions, hypothesis form inputs, and simulator mode selections reset to defaults.

**SVG chart is path-morphing, not data-driven**: The Simulator's timeline chart uses three hardcoded SVG path strings that swap on mode change — USER COST: the chart shape is illustrative only; it does not reflect the user's actual configured thresholds, so a PM who sets a 10% success threshold will see the same "success" trajectory as one who sets a 2% threshold.

**Tailwind CDN runtime**: The full Tailwind JIT engine (~100KB gzipped) is loaded at runtime — USER COST: on a slow connection, the first paint is unstyled for approximately 1–2 seconds while the CDN script loads and scans the HTML.

**No form validation on Hypothesis Builder**: The form does not validate that the expected change % is numeric or non-zero — USER COST: a user who enters "abc" in the Expected Change field will see "abc%" appear in the generated hypothesis statement without an error message.

**Simulator confidence thresholds are decorative**: The P-Value and Statistical Power progress bars in the Simulator's left panel are fixed visual elements (85% and 80%) — USER COST: changing the slider on the Experiment Configuration screen does not recalculate these values, so the displayed confidence parameters do not reflect the user's actual configuration.

## 6. Publish or Scratch — and Why

**Routed to: /projects/**

The artifact meets the bar because: (1) all five screens are complete with no placeholder panels or empty states, (2) every interactive element (sliders, checkboxes, segment pills, outcome mode buttons, step checklist) responds correctly to user input, (3) the design is production-quality — not a wireframe or mockup — with a coherent visual system, (4) the hypothesis builder produces grammatically correct, structured output in real time, (5) the decision engine is genuinely useful as a coaching tool for a PM making a ship/kill/extend decision independently.

It does not meet the bar for a full v1 production release because the simulation uses hardcoded scenario data rather than live statistical computation, which a data-literate reviewer would notice immediately.

## 7. What a V2 Would Include

1. **Live statistical power calculator**: Given a baseline CVR, sample size per day, and MDE, compute the required run time and expected confidence interval. Directly helps a PM answer "how long should I run this?" without back-of-envelope math — the most common experimentation question that gets answered wrong.

2. **localStorage hypothesis and configuration persistence**: Save the current hypothesis, threshold configuration, and metric selections to localStorage with a named-experiment key. Helps a PM return to the tool across multiple read-out meetings for the same experiment without re-entering the configuration.

3. **Segment breakdown modal on Decision Engine**: "View Segment Breakdown" currently shows a toast. A full modal showing metric lift split by device type, user cohort, and geography would let the PM give a more credible answer to "did this work for all users?" in stakeholder reviews — the second-most-common follow-up question after "is it significant?"
