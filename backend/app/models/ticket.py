from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text
)

from app.database.connection import Base


class Ticket(Base):


    __tablename__ = "tickets"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    customer_id = Column(
    Integer,
    ForeignKey("customers.id"),
    nullable=True
)

 
    subject = Column(
        String(255),
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    status = Column(
        String(50),
        default="OPEN",
        nullable=False
    )

    priority = Column(
        String(50),
        default="MEDIUM",
        nullable=False
    )

    ai_category = Column(String, nullable=True)

    ai_sentiment = Column(String, nullable=True)

    ai_priority = Column(String, nullable=True)

    ai_summary = Column(Text, nullable=True)

    ai_suggested_reply = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


