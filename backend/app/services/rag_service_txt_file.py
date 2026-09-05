from pathlib import Path

from langchain_community.document_loaders import (
    TextLoader
)
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter
)

from langchain_chroma import Chroma

from app.services.embedding_service import (
    embeddings
)


BASE_DIR = Path(__file__).resolve().parents[2]
print('BASE_DIR',BASE_DIR)

KNOWLEDGE_BASE_DIR = (
    BASE_DIR / "knowledge_base"
)
print('KNOWLEDGE_BASE_DIR',KNOWLEDGE_BASE_DIR)

VECTOR_DB_DIR = (
    BASE_DIR / "chroma_db"
)

def load_documents():

    documents = []

    for file_path in KNOWLEDGE_BASE_DIR.glob("*.txt"):

        loader = TextLoader(
            str(file_path),
            encoding="utf-8"
        )

        documents.extend(
            loader.load()
        )

    return documents


def split_documents(documents):

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    return splitter.split_documents(
        documents
    )

def create_vector_store():

    documents = load_documents()

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

    return vector_store

def get_vector_store():

    return Chroma(
        persist_directory=str(
            VECTOR_DB_DIR
        ),
        embedding_function=embeddings
    )

def get_retriever():

    vector_store = get_vector_store()

    return vector_store.as_retriever(
        search_kwargs={
            "k": 3
        }
    )

#Build the vector database
# if __name__ == "__main__":

#     create_vector_store()

#     print(
#         "Vector database created successfully."
#     )

#python3 -m app.services.rag_service  