from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.connection import get_db
from app.models.ticket import Ticket
from app.models.ai_analysis import AIAnalysis
from app.models.user import User
from app.services.auth_dependency import get_current_user


router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)


@router.get("/")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tickets = (
        db.query(Ticket)
        .filter(Ticket.user_id == current_user.id)
        .all()
    )

    total_tickets = len(tickets)

    open_tickets = sum(
        1 for ticket in tickets
        if ticket.status == "OPEN"
    )

    in_progress_tickets = sum(
        1 for ticket in tickets
        if ticket.status == "IN_PROGRESS"
    )

    waiting_tickets = sum(
        1 for ticket in tickets
        if ticket.status == "WAITING_FOR_CUSTOMER"
    )

    resolved_tickets = sum(
        1 for ticket in tickets
        if ticket.status in ["RESOLVED", "CLOSED"]
    )

    escalated_tickets = sum(
        1 for ticket in tickets
        if ticket.status == "ESCALATED"
    )

    high_priority_tickets = sum(
        1 for ticket in tickets
        if ticket.priority in ["HIGH", "URGENT"]
    )

    urgent_tickets = sum(
        1 for ticket in tickets
        if ticket.priority == "URGENT"
    )

    # ----------------------------------------
    # CATEGORY
    # ----------------------------------------

    category_counts = {}

    for ticket in tickets:
        category = ticket.ai_category or "Other"

        category_counts[category] = (
            category_counts.get(category, 0) + 1
        )

    # ----------------------------------------
    # PRIORITY
    # ----------------------------------------

    priority_counts = {}

    for ticket in tickets:
        priority = ticket.priority or "MEDIUM"

        priority_counts[priority] = (
            priority_counts.get(priority, 0) + 1
        )

    # ----------------------------------------
    # STATUS
    # ----------------------------------------

    status_counts = {}

    for ticket in tickets:
        status = ticket.status or "OPEN"

        status_counts[status] = (
            status_counts.get(status, 0) + 1
        )

    # ----------------------------------------
    # SENTIMENT
    # ----------------------------------------

    sentiment_counts = {}

    for ticket in tickets:
        sentiment = ticket.ai_sentiment or "Unknown"

        sentiment_counts[sentiment] = (
            sentiment_counts.get(sentiment, 0) + 1
        )

    # ----------------------------------------
    # AI ASSISTED
    # ----------------------------------------

    ai_assisted_tickets = sum(
        1
        for ticket in tickets
        if (
            ticket.ai_category
            or ticket.ai_sentiment
            or ticket.ai_summary
            or ticket.ai_suggested_reply
        )
    )

    # ----------------------------------------
    # ESCALATION
    # ----------------------------------------

    analyses = (
        db.query(AIAnalysis)
        .join(Ticket, Ticket.id == AIAnalysis.ticket_id)
        .filter(Ticket.user_id == current_user.id)
        .all()
    )

    escalation_required = sum(
        1
        for analysis in analyses
        if analysis.escalation_required
    )

    escalation_rate = (
        round(
            (escalation_required / len(analyses)) * 100,
            2
        )
        if analyses
        else 0
    )

    return {
        "overview": {
            "total_tickets": total_tickets,
            "open_tickets": open_tickets,
            "in_progress_tickets": in_progress_tickets,
            "waiting_tickets": waiting_tickets,
            "resolved_tickets": resolved_tickets,
            "escalated_tickets": escalated_tickets,
            "high_priority_tickets": high_priority_tickets,
            "urgent_tickets": urgent_tickets,
            "ai_assisted_tickets": ai_assisted_tickets
        },
        "tickets_by_category": category_counts,
        "tickets_by_priority": priority_counts,
        "tickets_by_status": status_counts,
        "sentiment_distribution": sentiment_counts,
        "escalation": {
            "escalation_required": escalation_required,
            "total_ai_analyses": len(analyses),
            "escalation_rate": escalation_rate
        }
    }