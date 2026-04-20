"""
Support Ticket Triage
---------------------
Given a raw support ticket, returns a structured triage brief:
  - urgency:   1 (low) to 5 (critical) — biases high when signal is ambiguous
  - category:  billing | account | product | technical | unclear
  - kb_topic:  controlled vocabulary term matching the KB structure from W02
  - summary:   one sentence, under 20 words, written for the support agent

Output: JSON object printed to stdout.
Errors: printed to stderr, exit code 1.
"""

import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

# ── Config ────────────────────────────────────────────────────────────────────

load_dotenv(Path(__file__).parent.parent / ".env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("Error: OPENAI_API_KEY not set in .env", file=sys.stderr)
    sys.exit(1)

MODEL = "gpt-4o-mini"

# Controlled vocabulary for kb_topic — must match the KB structure used in W02
KB_TOPICS = [
    "password-reset",
    "billing-refund",
    "billing-subscription",
    "account-access",
    "account-settings",
    "product-bug",
    "product-feature-request",
    "technical-integration",
    "technical-performance",
    "other",
]

# ── Prompt ────────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are a support ticket triage assistant. Your job is to classify
incoming support tickets so they can be routed to the right agent quickly.

Return ONLY a valid JSON object. No explanation, no markdown, no preamble.

JSON schema:
{
  "urgency": <integer 1-5>,
  "category": "<billing|account|product|technical|unclear>",
  "kb_topic": "<one of the allowed KB topics>",
  "summary": "<one sentence under 20 words for the support agent>"
}

Category definitions:
  billing   = charges, refunds, invoices, pricing questions
  account   = login, access, permissions, settings
  product   = any bug or issue inside the product UI, feature behavior, or workflow
  technical = API, webhooks, integrations, performance, outages — things outside the UI
  unclear   = cannot determine from ticket text alone

Urgency scale:
  1 = informational, no time pressure
  2 = low — user frustrated but not blocked
  3 = medium — user blocked on a non-critical task
  4 = high — user blocked on a business-critical task
  5 = critical — data loss, outage, or compliance risk

When urgency is ambiguous, score one level higher. A missed P4/P5 is worse than
a false alarm.

Allowed kb_topic values:
""" + "\n".join(f"  - {t}" for t in KB_TOPICS)


def triage(ticket_text: str) -> dict:
    client = OpenAI(api_key=OPENAI_API_KEY)

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Ticket:\n{ticket_text.strip()}"},
        ],
        temperature=0,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content
    result = json.loads(raw)

    # Validate required fields
    required = {"urgency", "category", "kb_topic", "summary"}
    missing = required - result.keys()
    if missing:
        raise ValueError(f"Model response missing fields: {missing}")

    # Enforce controlled vocabulary on kb_topic
    if result["kb_topic"] not in KB_TOPICS:
        result["kb_topic"] = "other"

    return result


# ── CLI ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Read ticket from file
        ticket_path = Path(sys.argv[1])
        if not ticket_path.exists():
            print(f"Error: file not found: {ticket_path}", file=sys.stderr)
            sys.exit(1)
        ticket_text = ticket_path.read_text(encoding="utf-8")
    else:
        # Read ticket from stdin
        print("Paste ticket text, then press Ctrl+D (or Ctrl+Z on Windows):",
              file=sys.stderr)
        ticket_text = sys.stdin.read()

    if not ticket_text.strip():
        print("Error: empty ticket text", file=sys.stderr)
        sys.exit(1)

    try:
        result = triage(ticket_text)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
