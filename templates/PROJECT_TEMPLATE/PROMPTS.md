<!-- GENERATOR INSTRUCTIONS
     Only use this file if the project has an AI layer. Delete it for non-AI builds.
     Keep prompts at the version that shipped — do not update retroactively.
     Delete all HTML comments before publishing.
-->

# Prompts — [Project Name]

**Last updated:** YYYY-MM-DD

---

## Role of Prompting in This Build

<!-- One paragraph. What does the AI layer do in this build?
     What kind of task is the model handling — extraction, generation, classification,
     retrieval-augmented generation, evaluation, routing, something else?
     What happens if the model gets it wrong — what is the failure mode?
-->

[Describe what the model does, what task type it is, and what the failure mode looks like.]

---

## Main Prompt(s)

<!-- Paste the actual prompt(s) used. Include the system prompt if there is one.
     Use code blocks. Label each prompt clearly.
     If the prompt uses input variables, use [BRACKET_CAPS] to mark them.
-->

### System Prompt

```
[Paste system prompt here, or write "None."]
```

### User / Task Prompt

```
[Paste the main prompt here.]

Input variables used:
- [VARIABLE_NAME]: [what it contains]
- [VARIABLE_NAME]: [what it contains]
```

---

## Output Format

<!-- What should the model return?
     If JSON: paste the expected schema.
     If markdown: describe the structure.
     If free text: describe what makes a response good vs. bad.
-->

```
[Paste expected output format or schema here.]
```

---

## Prompt Decisions

<!-- Why is the prompt shaped this way?
     Only log non-obvious choices — system prompt role, output format constraint,
     chain-of-thought instructions, persona assignment, etc.
     One to two sentences per decision.
-->

- **[Decision]:** [What was decided and why.]
- **[Decision]:** [What was decided and why.]
- **[Decision — optional]:** [What was decided and why.]

---

## Prompt Risks

<!-- What can go wrong with this prompt in production?
     Hallucination risk, format breakage, prompt injection surface, instruction following failures, etc.
     Be specific. Vague risks ("model might be wrong") don't help.
-->

- **[Risk]:** [What happens, and how bad it is.]
- **[Risk]:** [What happens, and how bad it is.]
- **[Risk — optional]:** [What happens.]

---

## Prompt Iteration Log

<!-- Track what changed between versions and why.
     This is useful when the build goes wrong — you want to know what you touched.
     Add a row for each meaningful revision. Keep it honest.
-->

| Version | Change | Reason |
|---------|--------|--------|
| v1 | Initial prompt | [Starting point rationale] |
| v2 | [What changed] | [Why — what the previous version got wrong] |
| v3 | [What changed] | [Why] |
