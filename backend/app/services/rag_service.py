from pathlib import Path
import hashlib

from langchain_community.document_loaders import (
    TextLoader,
    PyPDFLoader,
    Docx2txtLoader,
    CSVLoader,
)

from langchain_text_splitters import (
    RecursiveCharacterTextSplitter
)

# from sqlalchemy import select, delete

from app.database.connection import SessionLocal
from app.models.knowledge_embedding import KnowledgeEmbedding

from app.services.embedding_service import get_embeddings


from app.config import settings

# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[2]

KNOWLEDGE_BASE_DIR = BASE_DIR / "knowledge_base"




# --------------------------------------------------
# Supported file formats
# --------------------------------------------------

SUPPORTED_EXTENSIONS = {
    ".pdf",
    ".docx",
    ".txt",
    ".csv",
    ".md",
}


# --------------------------------------------------
# Load a single document
# --------------------------------------------------

def load_single_document(file_path: Path):

    extension = file_path.suffix.lower()

    print(
        f"Loading: {file_path.name}"
    )

    if extension == ".pdf":

        loader = PyPDFLoader(
            str(file_path)
        )

    elif extension == ".docx":

        loader = Docx2txtLoader(
            str(file_path)
        )

    elif extension == ".txt":

        loader = TextLoader(
            str(file_path),
            encoding="utf-8"
        )

    elif extension == ".csv":

        loader = CSVLoader(
            str(file_path)
        )

    elif extension == ".md":

       loader = TextLoader(
        str(file_path),
        encoding="utf-8"
         )

    else:

        print(
            f"Unsupported file: {file_path.name}"
        )

        return []

    return loader.load()


# --------------------------------------------------
# Load all documents
# --------------------------------------------------

def load_documents():

    documents = []

    if not KNOWLEDGE_BASE_DIR.exists():

        KNOWLEDGE_BASE_DIR.mkdir(
            parents=True
        )

        print(
            "Created knowledge_base directory."
        )

        return documents


    for file_path in KNOWLEDGE_BASE_DIR.iterdir():

        if not file_path.is_file():
            continue

        if file_path.suffix.lower() not in SUPPORTED_EXTENSIONS:

            print(
                f"Skipping unsupported file: "
                f"{file_path.name}"
            )

            continue

        try:

            loaded_documents = (
                load_single_document(
                    file_path
                )
            )

            documents.extend(
                loaded_documents
            )

        except Exception as e:

            print(
                f"Error loading "
                f"{file_path.name}: {e}"
            )


    print(
        f"Loaded {len(documents)} document pages."
    )

    return documents

def process_single_file(
    file_path: Path
):
    # ==========================================
    # 1. Calculate file hash
    # ==========================================

    file_hash = calculate_file_hash(file_path)

    # ==========================================
    # 2. Check duplicate
    # ==========================================

    if document_exists(file_hash):
        raise ValueError(
            "This document has already been uploaded."
        )

    # ==========================================
    # 3. Load document
    # ==========================================

    documents = load_single_document(file_path)

    if not documents:
        raise ValueError(
            "Could not load document."
        )

    # ==========================================
    # 4. Add metadata
    # ==========================================

    for document in documents:
        document.metadata["filename"] = file_path.name
        document.metadata["source_filename"] = file_path.name
        document.metadata["file_hash"] = file_hash

    # ==========================================
    # 5. Split into chunks
    # ==========================================

    chunks = split_documents(documents)

    # ==========================================
    # 6. Generate embeddings
    # ==========================================

    embedding_model = get_embeddings()

    embeddings = embedding_model.embed_documents(
        [chunk.page_content for chunk in chunks]
    )

    # ==========================================
    # 7. Save to PostgreSQL + pgvector
    # ==========================================

    db = SessionLocal()

    try:
        for chunk, embedding in zip(chunks, embeddings):

            db_embedding = KnowledgeEmbedding(
                content=chunk.page_content,
                chunk_metadata=chunk.metadata,
                embedding=embedding
            )

            db.add(db_embedding)

        db.commit()

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

    print(
        f"Saved {len(chunks)} chunks to PostgreSQL."
    )

    return len(chunks)


# --------------------------------------------------
# Split documents
# --------------------------------------------------

def split_documents(documents):

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
    )

    chunks = splitter.split_documents(
        documents
    )

    print(
        f"Created {len(chunks)} chunks."
    )

    return chunks


# search_knowledge_base()
#         ↓
# ChromaDB
#         ↓
# Documents
#         ↓
# get_rag_context()
#         ↓
# Formatted context

def get_rag_context(
    query: str,
    k: int = 4
):

    documents = search_knowledge_base(
        query,
        k=k
    )

    if not documents:
        return ""


    context_parts = []


    for document in documents:

        source = document.metadata.get(
            "source_filename",
            
            document.metadata.get(
                "filename",
                "Unknown"
            )
        )

        content = document.page_content


        context_parts.append(
            f"Source: {source}\n"
            f"Content: {content}"
        )


    return "\n\n".join(
        context_parts
    )



# it will return source
def get_rag_sources(
    query: str,
    k: int = 4
):

    documents = search_knowledge_base(
        query,
        k=k
    )

    if not documents:
        return []


    sources = []


    for document in documents:

        source = document.metadata.get(
            "source_filename",
            document.metadata.get(
                "filename",
                "Unknown"
            )
        )


        if source not in sources:

            sources.append(source)


    return sources

def get_rag_context_and_sources(
    query: str,
    k: int = 4
):

    documents = search_knowledge_base(
        query,
        k=k
    )

    if not documents:

        return {
            "context": "",
            "sources": []
        }

    context_parts = []

    sources = []

    for document in documents:

        filename = document.metadata.get(
            "source_filename",
            document.metadata.get(
                "filename",
                "Unknown"
            )
        )

        page_number = document.metadata.get(
            "page"
        )

        if page_number is not None:

            page_number = int(
                page_number
            ) + 1

        content = document.page_content

        # ==========================================
        # Context sent to Groq
        # ==========================================

        context_parts.append(
            f"Source: {filename}\n"
            f"Page: {page_number}\n"
            f"Content: {content}"
        )

        # ==========================================
        # Source saved to database
        # ==========================================

        sources.append({

            "filename": filename,

            "page_number": page_number,

            "content": content
        })

    return {

        "context": "\n\n".join(
            context_parts
        ),

        "sources": sources
    }


# --------------------------------------------------
# PostgreSQL vector search
# --------------------------------------------------

def search_knowledge_base(
    query: str,
    k: int = 4
):
    embedding_model = get_embeddings()

    query_embedding = embedding_model.embed_query(query)

    db = SessionLocal()

    try:
        results = (
            db.query(KnowledgeEmbedding)
            .filter(
                KnowledgeEmbedding.embedding.isnot(None)
            )
            .order_by(
                KnowledgeEmbedding.embedding.cosine_distance(
                    query_embedding
                )
            )
            .limit(k)
            .all()
        )

        return [
            embedding_to_document(item)
            for item in results
        ]

    finally:
        db.close()


# --------------------------------------------------
# PostgreSQL DELETE vector search
# --------------------------------------------------

def delete_document_from_vector_store(
    filename: str
):
    db = SessionLocal()

    try:
        result = (
            db.query(KnowledgeEmbedding)
            .filter(
                KnowledgeEmbedding.chunk_metadata[
                    "source_filename"
                ].as_string() == filename
            )
            .delete(
                synchronize_session=False
            )
        )

        db.commit()

        return result

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()



def document_exists(
    file_hash: str
) -> bool:

    db = SessionLocal()

    try:
        result = (
            db.query(KnowledgeEmbedding.id)
            .filter(
                KnowledgeEmbedding.chunk_metadata[
                    "file_hash"
                ].as_string() == file_hash
            )
            .first()
        )

        return result is not None

    finally:
        db.close()

#twice, your code can add the same chunks to ChromaDB twice.

# We'll fix that using a SHA-256 file hash.
def calculate_file_hash(
    file_path: Path
) -> str:

    sha256 = hashlib.sha256()

    with open(
        file_path,
        "rb"
    ) as file:

        while chunk := file.read(
            1024 * 1024
        ):

            sha256.update(chunk)

    return sha256.hexdigest()

def embedding_to_document(embedding):
    from langchain_core.documents import Document

    return Document(
        page_content=embedding.content,
        metadata=embedding.chunk_metadata or {}
    )



# --------------------------------------------------
# Generate AI answer from RAG context
# --------------------------------------------------

def generate_rag_answer(
    query: str,
    k: int = 4
):
    from langchain_groq import ChatGroq
    from langchain_core.messages import HumanMessage

    rag_data = get_rag_context_and_sources(
        query,
        k=k
    )

    context = rag_data["context"]
    sources = rag_data["sources"]

    if not context:
        return {
            "answer": (
                "I couldn't find relevant information "
                "in the knowledge base to answer your question."
            ),
            "sources": []
        }

    llm = ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model=settings.GROQ_MODEL,
        temperature=0
    )

    prompt = f"""
You are an AI customer support assistant.

Answer the user's question using ONLY the information
provided in the knowledge base context below.

IMPORTANT RULES:

1. Do not invent information.
2. Do not use outside knowledge.
3. Preserve dates, numbers, limits, conditions,
   prices, time periods, and policies exactly as
   stated in the context.
4. If the answer cannot be found in the context,
   clearly say that the information is not available
   in the knowledge base.
5. Write a professional, helpful customer-support answer.
6. Use Markdown formatting when it improves readability.
7. You may use:
   - headings
   - bullet points
   - numbered lists
   - Markdown tables
   - bold text
8. Do not mention embeddings, pgvector, retrieval,
   chunks, vector databases, or internal system details.
9. Do not make claims that are not supported by the
   provided context.

USER QUESTION:
{query}

KNOWLEDGE BASE CONTEXT:
{context}

Now provide the best answer to the user.
"""

    response = llm.invoke(
        [
            HumanMessage(content=prompt)
        ]
    )

    return {
        "answer": response.content,
        "sources": sources
    }











# --------------------------------------------------
# Test
# --------------------------------------------------

# if __name__ == "__main__":
#     results = search_knowledge_base(
#     "What is the refund policy?"
# )

# for document in results:

#     print(document.page_content)

#     print(
#         document.metadata.get("source")
#     )

#OLD TEST
# if __name__ == "__main__":

#     create_vector_store()

#     results = search_knowledge_base(
#         "Can I get a refund for my subscription?"
#     )

#     for document in results:

#         print(
#             "\n--------------------"
#         )

#         print(
#             document.page_content
#         )

#         print(
#             "Source:",
#             document.metadata.get(
#                 "source"
#             )
#         )