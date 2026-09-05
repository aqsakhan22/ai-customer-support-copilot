import os

from dotenv import load_dotenv


load_dotenv()


class Settings:
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        ""
    )

    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY",
        ""
    )

    GROQ_API_KEY: str = os.getenv(
        "GROQ_API_KEY",
        ""
    )

    GROQ_MODEL: str = os.getenv(
        "GROQ_MODEL",
        "openai/gpt-oss-20b"
    )

    HF_API_TOKEN: str = os.getenv(
        "HF_API_TOKEN",
        ""
    )

    HF_EMBEDDING_MODEL: str = os.getenv(
        "HF_EMBEDDING_MODEL",
        "sentence-transformers/all-MiniLM-L6-v2"
    )

    VECTOR_DB_URL: str = os.getenv(
        "VECTOR_DB_URL",
        ""
    )


settings = Settings()