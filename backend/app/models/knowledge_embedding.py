from datetime import datetime

from sqlalchemy import BigInteger, Column, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB
from pgvector.sqlalchemy import Vector

from app.database.connection import Base


class KnowledgeEmbedding(Base):

    __tablename__ = "knowledge_embeddings"

    id = Column(
        BigInteger,
        primary_key=True,
        index=True
    )

    content = Column(
        Text,
        nullable=False
    )

    chunk_metadata = Column(
        "metadata",
        JSONB,
        nullable=True
    )

    embedding = Column(
        Vector(384),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )