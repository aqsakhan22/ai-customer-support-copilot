# from langchain_huggingface import HuggingFaceEmbeddings


# embeddings = HuggingFaceEmbeddings(
#     model_name="sentence-transformers/all-MiniLM-L6-v2"
# )

# from functools import lru_cache

# from langchain_huggingface import HuggingFaceEmbeddings


# @lru_cache(maxsize=1)
# def get_embeddings():
#     return HuggingFaceEmbeddings(
#         model_name="sentence-transformers/all-MiniLM-L6-v2"
#     )


import os
from functools import lru_cache

from huggingface_hub import InferenceClient
from langchain_core.embeddings import Embeddings
from dotenv import load_dotenv

load_dotenv()

class HuggingFaceAPIEmbeddings(Embeddings):

    def __init__(
        self,
        model_name: str,
        api_token: str
    ):
        self.model_name = model_name

        self.client = InferenceClient(
            provider="hf-inference",
            api_key=api_token,
        )

    def embed_documents(
        self,
        texts: list[str]
    ) -> list[list[float]]:

        result = self.client.feature_extraction(
            texts,
            model=self.model_name,
        )

        return result.tolist()

    def embed_query(
        self,
        text: str
    ) -> list[float]:

        result = self.client.feature_extraction(
            text,
            model=self.model_name,
        )

        return result.tolist()


@lru_cache(maxsize=1)
def get_embeddings():

    model_name = os.getenv(
        "HF_EMBEDDING_MODEL",
        "sentence-transformers/all-MiniLM-L6-v2",
    )

    api_token = os.getenv(
        "HF_API_TOKEN",
        ""
    )

    if not api_token:
        raise RuntimeError(
            "HF_API_TOKEN is not configured."
        )

    return HuggingFaceAPIEmbeddings(
        model_name=model_name,
        api_token=api_token,
    )