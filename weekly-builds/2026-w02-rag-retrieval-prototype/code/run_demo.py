import json
import sys
from pathlib import Path

# Add the code directory to sys.path so retrieve_context imports cleanly
sys.path.insert(0, str(Path(__file__).parent))

from retrieve_context import retrieve, print_results

BASE_DIR = Path(__file__).parent.parent
TICKETS_PATH = BASE_DIR / "examples" / "support_tickets.json"

RETRIEVAL_NOTE = """
--- WHY RETRIEVAL QUALITY MATTERS ---
Retrieval is the foundation of grounded generation. In a support copilot,
the response drafted for an agent is only as good as the context it was
given. Poor retrieval — returning loosely related or irrelevant KB entries
— causes the generation layer to hallucinate, misguide, or produce generic
responses that erode user trust.

Getting retrieval right first, before adding a generation layer, ensures
that when the response step is added it has reliable signal to reason from.
The output above is retrieved context only. No response has been generated.
That is intentional — this build validates the retrieval step in isolation.
"""


def load_tickets(path: Path) -> list[dict]:
    if not path.exists():
        raise FileNotFoundError(f"Support tickets not found at: {path}")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def run_demo(ticket_index: int = 0) -> None:
    tickets = load_tickets(TICKETS_PATH)

    if ticket_index >= len(tickets):
        raise IndexError(
            f"Ticket index {ticket_index} is out of range. "
            f"{len(tickets)} tickets are available (indices 0–{len(tickets) - 1})."
        )

    ticket = tickets[ticket_index]

    # Combine subject and body as the retrieval query
    query = f"{ticket['subject']} {ticket['body']}"

    results = retrieve(query)
    print_results(ticket, results)
    print(RETRIEVAL_NOTE)


if __name__ == "__main__":
    # Pass a ticket index as a command-line argument to test different tickets.
    # Defaults to ticket 0 (login issue).
    # Usage: python run_demo.py 2
    index = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    run_demo(ticket_index=index)
