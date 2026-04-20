<!-- GENERATOR INSTRUCTIONS
     Fill this before building, not after. That is the point.
     Delete all HTML comments before publishing.
     Skill paths reference the pm-ai-skills repo: https://github.com/VictorMuhu/pm-ai-skills
     Match the skill name to a folder that actually exists in that repo.
     If no skill maps cleanly to a build step, write "custom — [describe the method used]".
-->

# Skill Map — [Project Name]

**Build date:** YYYY-MM-DD
**Skill chain used:** [Name the chain — e.g., "Discovery to Definition" / "Metrics and Experimentation" / "Spec to Ship"]

---

## Skills Applied

<!-- For each skill used, name the exact folder in pm-ai-skills, explain what input you fed it,
     and what decision or artifact came out the other side.
     One sentence each. Not "I used problem framing" — "Problem framing defined the exact
     failure mode (missed follow-ups at T+24h) and ruled out two alternatives."
     Remove any row that doesn't apply. Add rows if you used unlisted skills.
-->

| Skill | pm-ai-skills path | How it shaped this build |
|-------|-------------------|--------------------------|
| Problem Framing | `strategy/problem-framing/` | [What decision or artifact this produced] |
| Customer Synthesis | `discovery/customer-synthesis/` | [What decision or artifact this produced] |
| Metric Stack | `analytics/metric-stack/` | [What decision or artifact this produced] |
| Experiment Design | `analytics/experiment-design/` | [What decision or artifact this produced] |
| PRD Writer | `execution/prd-writer/` | [What decision or artifact this produced] |
| Spec Critic | `execution/spec-critic/` | [What decision or artifact this produced] |
| AI Output Rubric | `evals/ai-output-rubric/` | [What decision or artifact this produced] |
| [Other] | [path or "custom"] | [What decision or artifact this produced] |

---

## Skill Chain

<!-- Name the chain from pm-ai-skills/skill-index.md that best describes how skills
     were sequenced in this build. Example:
     Discovery to Definition → Metrics and Experimentation → Quality and Rigor
     If you used a custom sequence, name it here and briefly explain why.
-->

[Chain name or custom sequence] — [one sentence on why this sequence fit the build]

---

## What the Skill System Caught

<!-- List anything the skill system surfaced that you would have missed or glossed over
     if you had just started building without it.
     This is the most interview-useful section. Be specific.
     Examples:
     - Problem framing ruled out the "team visibility" framing and forced the problem
       to be stated as a user-facing latency issue, which changed the solution direction entirely.
     - The spec critic flagged an undefined error state in the async flow before the
       ticket was broken down.
-->

- [Specific thing caught or course-corrected by the skill system]
- [Specific thing caught or course-corrected]
- [Specific thing caught or course-corrected — optional]

---

## Skills That Should Exist But Don't

<!-- Gaps you noticed while building. If the skill is a placeholder in pm-ai-skills,
     name it and say what you needed. If it doesn't exist at all, describe it.
     This section feeds back into pm-ai-skills as a prioritized request.
-->

- [Gap name]: [What you needed that wasn't there]
- [Gap name — optional]: [What you needed]

---

## Reusable Learnings to Promote Back into pm-ai-skills

<!-- Anything this build produced that should become a reusable framework, checklist,
     or pattern in pm-ai-skills. Not lessons learned in general — only things generic
     enough to apply to a different project and different team.
-->

- [Reusable pattern or checklist item]: [Where in pm-ai-skills it should live]
- [Reusable pattern — optional]: [Where it should live]
