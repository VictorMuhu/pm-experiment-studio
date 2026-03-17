# Decision Log — Dependency Risk Radar

**Last updated:** 2026-03-17

---

## 1. What This Project Optimized For

- **Triage-ready clarity for non-security specialists** — at the cost of not being a full vulnerability management tool; the output is designed to route work, not to satisfy compliance reporting.
- **Evidence you can cite in a meeting** (links + explicit tier rules) — at the cost of “wow-factor” scoring; deterministic rules are less flashy than a single magic risk number, but easier to defend.
- **Fast time-to-first-insight from copy/paste input** — at the cost of completeness; v1 focuses on direct dependencies rather than attempting a full transitive graph.

---

## 2. What Was Intentionally Left Out

| Cut Item | Reason |
|----------|--------|
| Transitive dependency analysis from lockfiles | It changes the core model from “list of packages” to “graph with versions per edge,” which adds significant parsing, deduplication, and UI complexity that would delay validating whether the risk table schema is useful. |
| License risk detection (GPL/AGPL, etc.) | License classification is messy across ecosystems and would require another data source plus policy interpretation; it also shifts the persona toward legal/compliance rather than upgrade planning. |
| Authenticated scanning of private repos and internal packages | Supporting private GitHub orgs and private registries introduces auth UX, token scopes, and data handling concerns; v1 is meant to be safe to run locally with optional tokens, not an enterprise scanner. |
| “Fix it for me” PR generation | Auto-PR flows are high-leverage but would require repo write access, branch management, and conflict handling; that’s a different product with a much higher failure cost than a read-only triage report. |

---

## 3. Major Product Trade-offs

**Explainable tiers vs. black-box scoring**
Chose explicit tier rules (e.g., CVE present + last release older than threshold ⇒ High) over a single opaque “risk score.” Explicit tiers mean users can disagree and still act (“we accept this risk because…”) while a black-box score would invite debate about the score itself rather than the decision.

**Read-only report vs. integrated workflow tool**
Chose a standalone triage report (copy/paste in, export out) over Jira/GitHub issue creation. Standalone keeps setup minimal for a one-time due diligence moment; workflow integration would help ongoing operations but adds permissions, configuration, and more ways the tool can fail when the user needs it most.

**Two supported input formats vs. broad format detection**
Chose first-class support for `package.json` and `requirements.txt` over accepting many formats (pipenv, poetry, yarn/pnpm lockfiles). Narrow inputs reduce parsing ambiguity and let the UI teach the exact “contract” of what the tool can reliably interpret; broad support would create edge cases that undermine trust in the output.

---

## 4. Design Choices Made

- **Style direction: `high-contrast-command`:** This project’s core action is scanning, sorting, and comparing signals; a command-console aesthetic supports dense information, strong hierarchy, and keyboard-first interaction, which fits the “upgrade war-room” moment better than a friendly marketing UI.
- **Table-first IA with a detail drawer:** The primary view is a sortable table because the user’s job is prioritization. A card grid would look nice but makes cross-row comparison harder. The drawer preserves context (the list) while exposing the evidence and links needed to justify the tier.
- **“Next Action” as a first-class column:** The output is designed to become a work queue. Without an explicit next step, users would still have to translate metrics into actions, which is the exact place due diligence efforts stall.

---

## 5. Technical Shortcuts and Constraints

- **Trend proxy, not true time-series downloads:** Uses a simplified “trend” indicator derived from available registry endpoints (or skipped when unavailable) rather than storing historical data — USER COST: the user sees only ↑/→/↓ (or Unknown) and cannot rely on it to justify a precise claim like “downloads dropped 23% QoQ.”
- **Best-effort enrichment with partial failures:** If GitHub/npm/PyPI lookups fail (rate limits, missing metadata), the tool still produces a report with Unknown tiers for affected packages — USER COST: the user must manually check sources for those packages and cannot treat the report as complete.
- **No persistence for decision notes in v1:** Any “decision note” entered in the UI is session-only — USER COST: if they refresh or close the tab, their notes disappear and they must re-enter rationale before sharing the triage.

---

## 6. Publish or Scratch — and Why

**Recommendation:** `Hold`

The concept clears the bar for a portfolio-worthy tool because the output is structured, explainable, and grounded in a real decision moment (upgrade due diligence). It should be held until the runtime implementation proves it can reliably fetch and normalize signals across npm/PyPI and handle rate limits gracefully; without that, the core promise (“triage-ready”) collapses into “sometimes useful.” Once the tool runs end-to-end on realistic sample inputs with stable failure states and a captured screenshot, it should be publishable.

---

## 7. What a V2 Would Include

- **Lockfile-based transitive risk graph:** Helps tech leads catch the real risk (transitive CVEs and abandoned subdeps) that direct-dep triage misses.
- **Policy file overlays (team-specific risk rules):** Helps orgs encode “what we consider risky” (e.g., max staleness, forbidden licenses, minimum maintenance cadence) so the report matches internal standards.
- **Export to Jira-ready markdown + CSV:** Helps PMs move from triage to execution by pasting directly into tickets or planning docs with consistent formatting.
- **Caching layer with per-run audit trail:** Helps repeatability by making reruns faster and letting users see exactly what data was used for a given decision (useful in review meetings).
