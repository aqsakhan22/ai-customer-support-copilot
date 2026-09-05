from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.ticket import Ticket
from app.models.ticket_message import TicketMessage
from app.models.user import User
from app.schemas.ticket_message import (
    TicketMessageCreate,
    TicketMessageResponse
)
from app.services.auth_dependency import get_current_user


router = APIRouter(
    prefix="/api/tickets",
    tags=["Ticket Messages"]
)


@router.post(
    "/{ticket_id}/messages",
    response_model=TicketMessageResponse
)
def create_ticket_message(
    ticket_id: int,
    message_data: TicketMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = (
        db.query(Ticket)
        .filter(
            Ticket.id == ticket_id,
            Ticket.user_id == current_user.id
        )
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    message = TicketMessage(
        ticket_id=ticket.id,
        sender_type=message_data.sender_type,
        message=message_data.message
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message


@router.get(
    "/{ticket_id}/messages",
    response_model=list[TicketMessageResponse]
)
def get_ticket_messages(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = (
        db.query(Ticket)
        .filter(
            Ticket.id == ticket_id,
            Ticket.user_id == current_user.id
        )
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    messages = (
        db.query(TicketMessage)
        .filter(
            TicketMessage.ticket_id == ticket_id
        )
        .order_by(TicketMessage.created_at.asc())
        .all()
    )

    return messages


@router.delete(
    "/{ticket_id}/messages/{message_id}"
)
def delete_ticket_message(
    ticket_id: int,
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = (
        db.query(Ticket)
        .filter(
            Ticket.id == ticket_id,
            Ticket.user_id == current_user.id
        )
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    message = (
        db.query(TicketMessage)
        .filter(
            TicketMessage.id == message_id,
            TicketMessage.ticket_id == ticket_id
        )
        .first()
    )

    if not message:
        raise HTTPException(
            status_code=404,
            detail="Message not found"
        )

    db.delete(message)
    db.commit()

    return {
        "message": "Ticket message deleted successfully"
    }