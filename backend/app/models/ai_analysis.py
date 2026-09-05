from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, JSON,Boolean

from app.database.connection import Base


class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(Integer, primary_key=True, index=True)

    ticket_id = Column(
        Integer,
        ForeignKey("tickets.id", ondelete="CASCADE"),
        nullable=False
    )

    category = Column(String(100), nullable=True)
    sentiment = Column(String(100), nullable=True)
    priority = Column(String(50), nullable=True)
    summary = Column(Text, nullable=True)
    suggested_reply = Column(Text, nullable=True)

    model = Column(String(100), default="groq", nullable=True)

    sources = Column(JSON, nullable=True, default=list)
    
    recommended_action = Column(Text, nullable=True)

    escalation_required = Column(
    Boolean,
    default=False,
    nullable=False
     )

    escalation_reason = Column(Text, nullable=True)

    escalation_department = Column(
    String,
    nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )