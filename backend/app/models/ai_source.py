from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey
)

from app.database.connection import Base


class AISource(Base):

    __tablename__ = "ai_sources"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    analysis_id = Column(
        Integer,
        ForeignKey(
            "ai_analyses.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    filename = Column(
        String(255),
        nullable=False
    )

    page_number = Column(
        Integer,
        nullable=True
    )

    content = Column(
        Text,
        nullable=True
    )