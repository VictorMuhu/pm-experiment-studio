# Decision Log

## 1) What was optimized for
- Scan speed: a PM should understand “what’s risky” in under 10 seconds.
- Decision clarity: each flag resolves into a clear recommended next action.
- Interaction quality: hover/selected states, meaningful state changes, responsive layout, and a memorable demo moment (selection drives summary + recommendation).
- Portfolio polish: screenshot-worthy dark console styling with sharp hierarchy.

## 2) What was intentionally left out
- Authentication, roles, and permissions.
- Deep metric drill-down (segmentation, cohorts, statistical significance pages).
- Flag lifecycle automation (auto-archiving, approval workflows).
- Real integrations (LaunchDarkly/Datadog/Amplitude), webhooks, and background jobs.

## 3) Major tradeoffs
- Opinionated scoring vs. transparency: recommendations are faster than raw dashboards, but require visible “why” text and thresholds to build trust.
- Lightweight charts vs. charting libraries: sparklines are intentionally minimal to keep load fast and visuals clean.
- Single-page state management vs. routing: selection + drawer keeps the flow tight, but deep-linking is deferred.

## 4) What would make this a V2
- Pluggable risk model editor (weights, thresholds, metric definitions, guardrail “red lines”).
- Persistence (save filters, pin flags, annotate decisions, export weekly report).
- Deep links for flags and shareable “impact snapshots”.
- Integrations + real-time updates (streaming metric deltas during rollout).
