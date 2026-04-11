import os
from pathlib import Path

from dotenv import load_dotenv
import chromadb
from chromadb.utils import embedding_functions

# Load API key from .env if present
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise EnvironmentError(
        "OPENAI_API_KEY not set. Add it to a .env file in the project root or set it as an environment variable."
    )

EMBEDDING_MODEL = "text-embedding-3-small"
COLLECTION_NAME = "support_kb"
TOP_K = 3  # Number of KB entries to return per query

BASE_DIR = Path(__file__).parent.parent
CHROMA_PATH = BASE_DIR / "output" / "chroma_store"


def load_collection():
    """Load the Chroma collection from disk. Requires ingest_kb.py to have been run first."""
    openai_ef = embedding_functions.OpenAIEmbeddingFunction(
        api_key=OPENAI_API_KEY,
        model_name=EMBEDDING_MODEL,
    )
    client = chromadb.PersistentClient(path=str(CHROMA_PATH))
    try:
        collection = client.get_collection(
            name=COLLECTION_NAME,
            embedding_function=openai_ef,
        )
    except Exception:
        raise RuntimeError(
            f"Collection '{COLLECTION_NAME}' not found. Run ingest_kb.py first to build the index."
        )
    return collection


def retrieve(query: str, top_k: int = TOP_K) -> list[dict]:
    """
    Embed a query string and return the top_k most semantically similar KB entries.

    Each result includes:
      - rank       : position in the result list (1 = most similar)
      - title      : KB entry title
      - category   : KB entry category
      - content    : full embedded text
      - distance   : cosine distance (lower = more similar)
    """
    collection = load_collection()

    results = collection.query(
        query_texts=[query],
        n_results=top_k,
        include=["documents", "metadatas", "distances"],
    )

    retrieved = []
    for i in range(len(results["ids"][0])):
        retrieved.append({
            "rank": i + 1,
            "title": results["metadatas"][0][i]["title"],
            "category": results["metadatas"][0][i]["category"],
            "content": results["documents"][0][i],
            "distance": round(results["distances"][0][i], 4),
        })

    return retrieved


def print_results(ticket: dict, results: list[dict]) -> None:
    """Print a support ticket and its retrieved KB entries in a readable format."""
    print("\n" + "=" * 60)
    print("TICKET")
    print("=" * 60)
    print(f"Subject : {ticket['subject']}")
    print(f"Body    : {ticket['body']}")

    print("\n" + "=" * 60)
    print(f"TOP {len(results)} RETRIEVED KB ENTRIES")
    print("=" * 60)

    for r in results:
        print(f"\n[{r['rank']}] {r['title']}")
        print(f"     Category : {r['category']}")
        print(f"     Distance : {r['distance']}  (lower = more similar)")
        # Truncate long content for readability in the terminal
        preview = r["content"][:300] + "..." if len(r["content"]) > 300 else r["content"]
        print(f"     Content  : {preview}")


if __name__ == "__main__":
    # Standalone test using a hardcoded query — useful for quick checks
    test_query = "I cannot log in to my account"
    print(f"\nRunning standalone retrieval test.\nQuery: \"{test_query}\"\n")
    results = retrieve(test_query)
    for r in results:
        print(f"[{r['rank']}] {r['title']}  (distance: {r['distance']})")
        print(f"     {r['content'][:200]}\n")
