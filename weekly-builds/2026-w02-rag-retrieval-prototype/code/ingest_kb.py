import json
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

# Resolve paths relative to this file so the script works from any working directory
BASE_DIR = Path(__file__).parent.parent
KB_PATH = BASE_DIR / "examples" / "knowledge_base.json"
CHROMA_PATH = BASE_DIR / "output" / "chroma_store"


def load_knowledge_base(path: Path) -> list[dict]:
    """Load KB entries from a JSON file."""
    if not path.exists():
        raise FileNotFoundError(f"Knowledge base not found at: {path}")
    with open(path, "r", encoding="utf-8") as f:
        entries = json.load(f)
    print(f"Loaded {len(entries)} knowledge base entries from {path.name}")
    return entries


def build_chroma_collection(entries: list[dict]) -> None:
    """Embed KB entries and store them in a local Chroma collection."""

    # Set up OpenAI embedding function
    openai_ef = embedding_functions.OpenAIEmbeddingFunction(
        api_key=OPENAI_API_KEY,
        model_name=EMBEDDING_MODEL,
    )

    # Persistent client saves the index to disk so retrieve_context.py can load it later
    client = chromadb.PersistentClient(path=str(CHROMA_PATH))

    # Drop and recreate to ensure a clean state on re-runs
    try:
        client.delete_collection(COLLECTION_NAME)
        print(f"Deleted existing '{COLLECTION_NAME}' collection — rebuilding from scratch.")
    except Exception:
        pass  # Collection did not exist yet; that is fine

    collection = client.create_collection(
        name=COLLECTION_NAME,
        embedding_function=openai_ef,
    )

    ids = []
    documents = []
    metadatas = []

    for entry in entries:
        # Embed title + content together so the model has categorical context from the title
        text = f"{entry['title']}\n\n{entry['content']}"
        ids.append(entry["id"])
        documents.append(text)
        metadatas.append({
            "title": entry["title"],
            "category": entry.get("category", "general"),
        })

    collection.add(ids=ids, documents=documents, metadatas=metadatas)

    print(f"Ingested {len(ids)} entries into Chroma collection '{COLLECTION_NAME}'.")
    print(f"Embedding model : {EMBEDDING_MODEL}")
    print(f"Chroma store    : {CHROMA_PATH}")


if __name__ == "__main__":
    entries = load_knowledge_base(KB_PATH)
    build_chroma_collection(entries)
    print("\nIngestion complete. Run retrieve_context.py or run_demo.py to test retrieval.")
