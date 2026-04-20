# Support Ticket Triage

> A CLI tool that classifies a raw support ticket into urgency score, category, KB topic, and a one-sentence agent brief — output is structured JSON ready for routing.

**Status:** `draft`
**Complexity:** `simple`
**Bucket:** `customer-experience`
**Skills applied:** See [SKILL_MAP.md](./SKILL_MAP.md)

---

## Goal

A support agent receives a structured triage brief (urgency, category, KB topic, one-line summary) without re-reading the original ticket, cutting time-to-first-response and removing per-agent classification inconsistency.

---

## Problem

Support agents read the full ticket text to determine urgency and routing category. With high ticket volume, this is inconsistent — different agents score the same ticket differently, and P4/P5 tickets can slip into the wrong queue. There is no structured triage step between ticket submission and agent assignment that produces a machine-readable output.

---

## Why This Exists

A static triage checklist gives agents a framework but still requires judgment per ticket. A generative classification step produces the same structured output regardless of who runs it, and the controlled output schema (urgency enum, category enum, KB topic vocabulary) connects directly to the retrieval layer from W02 — something a checklist cannot do.

---

## Target Persona

A support team lead at a B2B SaaS company managing a queue of 50+ tickets per day, who needs a consistent urgency and routing signal before tickets reach an agent.

---

## Use Cases

- A support lead runs the tool on incoming tickets before agent assignment to populate a routing field in the queue.
- A support agent pastes a ticket to get a structured brief before drafting a response.
- A PM building a support automation pipeline uses the triage output to seed the KB retrieval step (W02).
- A support team tests triage consistency by comparing their manual urgency labels to tool output.
- An on-call engineer runs the tool on escalation tickets to quickly surface the urgency score and category.

---

## Barebones Wireframe

```
$ python src/triage.py ticket.txt

{
  "urgency": 4,
  "category": "account",
  "kb_topic": "account-access",
  "summary": "User locked out of account with client demo in 30 minutes."
}

# Or pipe from stdin:
$ echo "I was charged twice this month." | python src/triage.py

{
  "urgency": 4,
  "category": "billing",
  "kb_topic": "billing-refund",
  "summary": "User requesting refund for duplicate subscription charge."
}
```

---

## Product Decisions

- **Structured JSON output over prose summary:** Routes directly into downstream tooling (W02 retrieval, queue systems). Prose summaries require a human to re-extract routing metadata. Alternative was a free-text summary; rejected because it breaks the pipeline integration.
- **Controlled KB topic vocabulary:** Vocabulary matches the KB structure from W02. Free-text topics would break retrieval silently. Enforced at both the prompt level and in code, with an `other` fallback for novel ticket types.
- **Urgency bias-high rule for ambiguous signals:** A missed P4/P5 costs more than a false P5. Stated explicitly in the prompt to override the model's default tendency toward middle scores. Alternative was leaving urgency to the model's judgment; rejected because it produced too many 3s on clearly high-urgency tickets.
- **`gpt-4o-mini` over a larger model:** Classification with a well-defined schema is not a reasoning-heavy task. The smaller model produces the same output at lower cost. Upgrade path exists if edge cases accumulate.

---

## Tech Stack

- **Runtime:** Python 3.11+
- **Framework:** None — single script, no build step
- **AI/API:** OpenAI (`gpt-4o-mini`) with `response_format: json_object`
- **Styling:** N/A — CLI tool, no UI
- **Data:** None — stateless
- **Deployment:** Local CLI; no server required

---

## How to Run

**Prerequisites:** Python 3.11+, an OpenAI API key

```bash
# Clone
git clone https://github.com/VictorMuhu/pm-experiment-studio
cd weekly-builds/2026-w03-ticket-triage

# Install dependencies
pip install openai python-dotenv

# Configure
cp .env.example .env
# Edit .env and add your key: OPENAI_API_KEY=sk-...

# Run on a ticket file
python src/triage.py path/to/ticket.txt

# Or pipe from stdin (Ctrl+D to submit on Mac/Linux, Ctrl+Z on Windows)
python src/triage.py

# Run the offline eval suite
python src/test_tickets.py
```

**Output:** JSON printed to stdout. Errors go to stderr with exit code 1.

---

## Screenshots

Screenshot pending — see screenshots/PENDING.md for capture instructions.

---

## Future Enhancements

- **Confidence signal:** Return a confidence field (low/medium/high) so low-confidence classifications can be flagged for human review rather than auto-routed. Deferred because calibration requires a labeled dataset that doesn't exist yet.
- **W02 pipeline integration:** Feed triage output directly into the W02 retrieval step and return the top KB article alongside the triage brief. Deferred — each weekly build is a discrete prototype; integration is a W04+ concern.
- **Batch processing:** Accept a JSONL file of tickets and output a JSONL file of triage results. Deferred — single-ticket scope was sufficient to validate the prompt and classification logic.
- **Online accuracy measurement:** Compare model classifications against support agent labels on real tickets to measure category accuracy and urgency score deviation. Deferred — no production traffic yet.

---

## Decision Log

See [decision-log.md](./decision-log.md) for a full record of design and scoping decisions.
