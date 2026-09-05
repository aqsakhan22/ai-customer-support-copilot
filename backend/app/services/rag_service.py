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

from langchain_chroma import Chroma

from app.services.embedding_service import embeddings


# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[2]

KNOWLEDGE_BASE_DIR = BASE_DIR / "knowledge_base"

VECTOR_DB_DIR = BASE_DIR / "chroma_db"


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

    file_hash = calculate_file_hash(
        file_path
    )


    # ==========================================
    # 2. Check duplicate
    # ==========================================

    if document_exists(file_hash):

        raise ValueError(
            "This document has already "
            "been uploaded."
        )


    # ==========================================
    # 3. Load document
    # ==========================================

    documents = load_single_document(
        file_path
    )

    if not documents:

        raise ValueError(
            "Could not load document."
        )


    # ==========================================
    # 4. Add metadata
    # ==========================================

    for document in documents:

        document.metadata[
            "filename"
        ] = file_path.name

        document.metadata[
            "source_filename"
        ] = file_path.name

        document.metadata[
            "file_hash"
        ] = file_hash


    # ==========================================
    # 5. Split into chunks
    # ==========================================

    chunks = split_documents(
        documents
    )


    # ==========================================
    # 6. Save to ChromaDB
    # ==========================================

    if VECTOR_DB_DIR.exists():

        vector_store = get_vector_store()

        vector_store.add_documents(
            chunks
        )

    else:

        Chroma.from_documents(
            documents=chunks,
            embedding=embeddings,
            persist_directory=str(
                VECTOR_DB_DIR
            )
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


# --------------------------------------------------
# Create vector database
# --------------------------------------------------

def create_vector_store():

    documents = load_documents()

    if not documents:

        raise ValueError(
            "No supported documents found "
            "in knowledge_base."
        )

    chunks = split_documents(
        documents
    )

    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=str(
            VECTOR_DB_DIR
        )
    )

    print(
        "Vector database created successfully."
    )

    return vector_store


# --------------------------------------------------
# Get existing vector database
# --------------------------------------------------

def get_vector_store():

    if not VECTOR_DB_DIR.exists():

        raise ValueError(
            "Knowledge Base vector database "
            "does not exist yet. "
            "Please upload a document first."
        )


    return Chroma(
        persist_directory=str(
            VECTOR_DB_DIR
        ),
        embedding_function=embeddings
    )

# --------------------------------------------------
# Create retriever
# --------------------------------------------------

def get_retriever():

    vector_store = get_vector_store()

    return vector_store.as_retriever(
        search_kwargs={
            "k": 3
        }
    )


# --------------------------------------------------
# Search knowledge base
# --------------------------------------------------
# User ticket
#      ↓
# search_knowledge_base()
#      ↓
# ChromaDB
#      ↓
# Top 4 relevant chunks

def search_knowledge_base(
    query: str,
    k: int = 4
):

    vector_store = get_vector_store()

    results = vector_store.similarity_search(
        query,
        k=k
    )

    return results

# --------------------------------------------------
# Delete retriever
# --------------------------------------------------

def delete_document_from_vector_store(
    filename: str
):

    vector_store = get_vector_store()


    results = vector_store.get(
        where={
            "source_filename": filename
        }
    )


    ids = results.get(
        "ids",
        []
    )


    if ids:

        vector_store.delete(
            ids=ids
        )


    return len(ids)

#

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



def document_exists(
    file_hash: str
) -> bool:

    if not VECTOR_DB_DIR.exists():

        return False

    vector_store = get_vector_store()

    results = vector_store.get(
        where={
            "file_hash": file_hash
        },
        limit=1
    )

    ids = results.get(
        "ids",
        []
    )

    return len(ids) > 0
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