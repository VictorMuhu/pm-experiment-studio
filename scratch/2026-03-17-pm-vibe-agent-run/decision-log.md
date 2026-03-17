# Decision Log — PM Vibe Agent Run

**Last updated:** 2026-03-17

---

## What This Project Optimized For

- A PM at a 30–200 person B2B SaaS company who just got pinged “activation is down since this morning” needs to produce a first-hour investigation run plan (top checks, owners, and exact data cuts) they can paste into Slack in 10 minutes — this tool optimizes for that moment, not for comprehensive root-cause analysis.
- An on-call analyst partnered with a PM needs a repeatable way to avoid forgetting whole classes of causes (segment shift, instrumentation drift, external traffic quality) and leave with a categorized checklist they can execute in sequence — this tool optimizes for category coverage under time pressure, not for bespoke, metric-specific modeling.
- A PM writing a quick incident-style update needs a single copy/paste brief (summary + timeline + open questions) derived from the investigation plan — this tool optimizes for a usable coordination artifact, not for storing investigation history across incidents.

---

## What Was Intentionally Left Out

| Cut Item | Reason |
|----------|--------|
| Slack slash command version (/investigate …) | It’s a stronger “meets you where you are” artifact, but it requires auth, hosting, and workspace installation. V1 stays static and local to keep time-to-run near zero. |
| Automated data connection (Amplitude/GA4/warehouse) | Connecting to real data shifts the product into integration, permissions, and schema mapping. The core V1 value is a better plan and delegation structure, independent of the data source. |
| Multi-metric causal graphs and correlation discovery | These can look impressive but they introduce false authority without real data and domain calibration. V1 focuses on reliable first checks and explicit next steps. |
| Persistent incident/run history | Storing runs adds storage decisions (local vs backend), privacy concerns (production metric names), and a browsing UI. V1 keeps the tool stateless to stay portable. |

---

## Major Product Trade-offs

**Deterministic taxonomy over LLM-generated hypotheses**
Chose a fixed hypothesis taxonomy with simple ranking heuristics over calling an LLM to generate hypotheses. The taxonomy means the output is consistent and avoids generic filler; the downside is it can’t invent a novel cause unique to a product. An LLM would have produced more variety but would often drift into untestable suggestions. Went with deterministic output because the persona needs a dependable runbook under pressure.

**Two time horizons over a single “priority score”**
Chose “0–15 min fast checks” and “15–60 min deep dives” over a single ranked list with a numeric score. The horizon approach sacrifices a sense of precision, but it matches how investigations are actually paced and helps the PM decide what to do before the next leadership update. A single score would require users to trust weighting they can’t validate.

**Owner routing on every item over a cleaner-looking checklist**
Chose to include an “owner” field (PM/Analyst/Eng/Data Eng) in each hypothesis row over a simpler list that’s easier to read. The routing makes the output slightly denser, but it prevents the common coordination failure where the PM has to translate each check into “who does this” in Slack.

**Minimal input form over higher-fidelity configuration**
Chose a small set of inputs (metric type, direction, magnitude, detection time, window, recent changes) over a more complete configuration (event definitions, segment schema, experiment IDs). Minimal input reduces friction in the first-response moment; the downside is less personalized ranking. The alternative would have pushed usage to “later,” which is exactly when teams stop being disciplined about investigations.

---

## Design Choices Made

- **Style applied:** `high-contrast-command`. This fits the “incident response” vibe: high contrast, terse labels, and an operator-console feel that signals urgency and precision, matching the on-call moment rather than a polished marketing aesthetic.
- **Output structure mirrors an incident playbook:** The output is split into Fast checks, Deep dives, and Instrumentation sanity instead of a single narrative. This is intentional so the PM can execute sequentially and delegate immediately.
- **Brief is copy/paste first:** A dedicated “Brief” block is included that reads like a Slack/Jira incident update (summary, what changed, what we checked, what’s next). This is prioritized over long explanations because the artifact must travel.

---

## Technical Shortcuts or Constraints

- **No persistence:** Runs are not saved — USER COST: if the PM refreshes or closes the tab, they must re-enter the anomaly details to regenerate the plan.
- **Heuristic ranking (no real priors):** Hypothesis ordering is based on rule-of-thumb weights (e.g., “recent deploy” increases technical hypotheses) — USER COST: the “top 3” may not match the org’s true base rates, so users may still need to reorder items manually.
- **No schema-aware query generation:** “Exact data cut/query” is expressed as SQL-like pseudocode and analytics actions (segment by device/source) — USER COST: analysts must translate the guidance into their warehouse/dash tool syntax.

---

## Publish Recommendation

**Recommendation:** `Publish`

The concept is specific (first-hour anomaly triage) and produces a concrete coordination artifact (a structured run plan + brief) that isn’t interchangeable with a generic prompt. The value is in the taxonomy, the time-horizon pacing, and the owner routing—product decisions that are visible in the output structure. This should clear the bar as long as the final implementation includes realistic demo data and the UI follows the `high-contrast-command` style spec.

---

## What a V2 Would Include

- **Slack handoff export:** Generate an “@owner” split message (Analyst/Eng/Data Eng) so each person gets only their checks — improves speed of delegation during active incidents.
- **Org priors calibration:** A small settings panel to adjust likelihood weights (e.g., “instrumentation breaks are common after mobile releases”) — helps teams get a top-3 list that matches their real world.
- **Warehouse-specific query templates:** Export runnable SQL templates for common warehouses with parameter placeholders — reduces analyst translation time and improves consistency across investigations.
- **Run history + outcome tagging:** Save runs and let users tag the root cause when known — helps identify recurring failure modes and improves future ranking.
