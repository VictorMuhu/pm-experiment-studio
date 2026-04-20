"""
Response Evaluator
------------------
Evaluates a generated support response against a rubric.

Inputs:
  - ticket:             raw support ticket text
  - retrieved_context:  KB content used to generate the response (from W02)
  - generated_response: the response being evaluated

Output:
  A structured dictionary with scores (1-5) and one-sentence justifications for:
    - relevance:     does the response address what the user asked?
    - groundedness:  is the response based on the retrieved context, not invented?
    - completeness:  does it cover all parts of the issue?
    - actionability: can the user take a clear next step?
  Plus an average score across all four dimensions.
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

DIMENSIONS = ["relevance", "groundedness", "completeness", "actionability"]

# ── Prompt ────────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are an evaluator for AI-generated customer support responses.

Given a support ticket, the retrieved knowledge base context used to generate the response,
and the generated response itself, score the response on four dimensions.

Return ONLY a valid JSON object. No explanation, no markdown, no preamble.

JSON schema:
{
  "relevance":     { "score": <integer 1-5>, "justification": "<one sentence>" },
  "groundedness":  { "score": <integer 1-5>, "justification": "<one sentence>" },
  "completeness":  { "score": <integer 1-5>, "justification": "<one sentence>" },
  "actionability": { "score": <integer 1-5>, "justification": "<one sentence>" }
}

Dimension definitions:
  relevance     = Does the response directly address what the user asked in the ticket?
                  A response that answers a different question scores low even if accurate.
  groundedness  = Is the response based only on information present in the retrieved context?
                  A response that introduces facts, steps, or claims not in the context scores low.
  completeness  = Does the response cover all parts of the issue raised in the ticket?
                  A response that addresses only one part of a multi-part issue scores low.
  actionability = Can the user take a clear, specific next step from this response?
                  A response that explains the problem without telling the user what to do scores low.

Scale:
  1 = Poor     — fails the dimension entirely
  2 = Weak     — partially meets the bar, meaningful gaps
  3 = Acceptable — meets the minimum bar
  4 = Good     — clearly above the bar, minor gaps only
  5 = Excellent — no meaningful gap on this dimension

Important: for groundedness, compare the response only against the retrieved context provided.
Do not use general knowledge to fill in gaps."""


def evaluate_response(ticket: str, retrieved_context: str, generated_response: str) -> dict:
    """
    Score a generated support response on four quality dimensions.

    Returns a dict with per-dimension scores and justifications, plus an average score.
    Raises ValueError if the model response is missing required fields.
    """
    client = OpenAI(api_key=OPENAI_API_KEY)

    user_prompt = (
        f"TICKET:\n{ticket.strip()}\n\n"
        f"RETRIEVED CONTEXT:\n{retrieved_context.strip()}\n\n"
        f"GENERATED RESPONSE:\n{generated_response.strip()}"
    )

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content

    try:
        result = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Model returned invalid JSON: {e}\nRaw output: {raw}")

    # Validate all dimensions are present with required fields
    for dim in DIMENSIONS:
        if dim not in result:
            raise ValueError(f"Model response missing dimension: '{dim}'")
        if "score" not in result[dim]:
            raise ValueError(f"Missing 'score' field in dimension: '{dim}'")
        if "justification" not in result[dim]:
            # Fallback: add empty justification rather than failing
            result[dim]["justification"] = ""

    # Clamp scores to valid range (1-5) in case of model drift
    for dim in DIMENSIONS:
        score = result[dim]["score"]
        result[dim]["score"] = max(1, min(5, int(score)))

    # Add average score
    scores = [result[dim]["score"] for dim in DIMENSIONS]
    result["average"] = round(sum(scores) / len(scores), 2)

    return result


# ── Smoke test ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    sample = {
        "ticket": (
            "I cannot log in to my account. I reset my password but still get "
            "'invalid credentials'. I have a client presentation in one hour."
        ),
        "retrieved_context": (
            "Account access issues after a password reset are commonly caused by "
            "cached session tokens. Steps: (1) Clear browser cookies and cache. "
            "(2) Try an incognito/private window. (3) If still blocked, contact "
            "support with your account email — a manual session reset takes under "
            "5 minutes."
        ),
        "generated_response": (
            "Please clear your browser cookies and cache, then try logging in again "
            "in an incognito window. This resolves most post-reset login issues. "
            "If you are still blocked, reply here with your account email and we "
            "will reset your session manually — this takes under 5 minutes."
        ),
    }

    print("Running smoke test...")
    result = evaluate_response(**sample)
    print(json.dumps(result, indent=2))
