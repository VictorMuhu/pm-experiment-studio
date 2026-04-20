"""
Demo runner for the response evaluator.

Loads one evaluation case from examples/evaluation_cases.json,
runs the evaluator, and prints the inputs and scores clearly.

Usage:
  python code/run_demo.py          # runs case 0 (strong response)
  python code/run_demo.py 1        # runs case 1 (partially grounded)
  python code/run_demo.py 2        # runs case 2 (weak/generic)
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from evaluate_response import evaluate_response

CASES_PATH = Path(__file__).parent.parent / "examples" / "evaluation_cases.json"

SCORE_LABELS = {1: "Poor", 2: "Weak", 3: "Acceptable", 4: "Good", 5: "Excellent"}

BAR = "─" * 60
DOUBLE_BAR = "═" * 60


def section(title: str, body: str):
    print(f"\n{BAR}")
    print(f"  {title}")
    print(BAR)
    print(body.strip())


def run_demo(case_index: int = 0):
    cases = json.loads(CASES_PATH.read_text(encoding="utf-8"))

    if case_index >= len(cases):
        print(f"Error: only {len(cases)} cases available (0–{len(cases) - 1})", file=sys.stderr)
        sys.exit(1)

    case = cases[case_index]
    print(f"\n{DOUBLE_BAR}")
    print(f"  CASE {case['id']} — {case.get('label', '')}")
    print(DOUBLE_BAR)

    section("TICKET", case["ticket"])
    section("RETRIEVED CONTEXT", case["retrieved_context"])
    section("GENERATED RESPONSE", case["generated_response"])

    print(f"\n{BAR}")
    print("  RUNNING EVALUATOR...")
    print(BAR)

    result = evaluate_response(
        ticket=case["ticket"],
        retrieved_context=case["retrieved_context"],
        generated_response=case["generated_response"],
    )

    print(f"\n{DOUBLE_BAR}")
    print("  EVALUATION SCORES")
    print(DOUBLE_BAR)

    dimensions = ["relevance", "groundedness", "completeness", "actionability"]
    for dim in dimensions:
        score = result[dim]["score"]
        label = SCORE_LABELS.get(score, str(score))
        justification = result[dim]["justification"]
        print(f"\n  {dim.upper():<16} {score}/5  ({label})")
        print(f"  {justification}")

    print(f"\n{DOUBLE_BAR}")
    print(f"  AVERAGE SCORE:   {result['average']} / 5.0")
    print(DOUBLE_BAR)

    print(
        "\nEvaluation helps define what good looks like before scaling an AI system.\n"
    )


if __name__ == "__main__":
    index = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    run_demo(index)
