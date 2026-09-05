from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Text,
    String
)

from app.database.connection import Base


class TicketMessage(Base):
    __tablename__ = "ticket_messages"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    ticket_id = Column(
        Integer,
        ForeignKey(
            "tickets.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    sender_type = Column(
        String(20),
        nullable=False
    )

    message = Column(
        Text,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )