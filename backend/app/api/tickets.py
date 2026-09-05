from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.models.ticket import Ticket
from app.models.user import User


from app.schemas.ticket import (
    TicketCreate,
    TicketResponse,
    TicketUpdate
)

from app.services.auth_dependency import get_current_user
from app.services.ai_service import (
    analyze_ticket,
    get_model_name
)
from app.models.ai_analysis import AIAnalysis
from app.models.ai_source import AISource
from app.schemas.ai import AIAnalysisResponse

from app.models.customer import Customer
from app.models.ticket_message import TicketMessage

from app.services.reply_service import generate_ticket_reply

from app.services.summarization_service import (
    summarize_ticket_conversation
)
from app.schemas.summarization import SummarizeResponse

from app.schemas.action import RecommendActionResponse
from app.services.action_service import recommend_ticket_action
from fastapi.responses import StreamingResponse

from app.services.stream_reply_service import (
    stream_ticket_reply
)



router = APIRouter(
    prefix="/api/tickets",
    tags=["Tickets"]
)


# ==================================================
# CREATE TICKET
# ==================================================

@router.post( "/",response_model=TicketResponse)
def create_ticket(
    ticket: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    if ticket.customer_id is not None:
      
      customer = (
        db.query(Customer)
        .filter(Customer.id == ticket.customer_id)
        .first()
       )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )


    new_ticket = Ticket(
    user_id=current_user.id,
    customer_id=ticket.customer_id,
    subject=ticket.subject,
    description=ticket.description,
    priority=ticket.priority
    )

    db.add(new_ticket)

    db.commit()

    db.refresh(new_ticket)

    return new_ticket


# ==================================================
# GET ALL CURRENT USER'S TICKETS
# ==================================================

@router.get( "/",response_model=list[TicketResponse]
)
def get_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    tickets = (
        db.query(Ticket)
        .filter(
            Ticket.user_id == current_user.id
        )
        .all()
    )

    return tickets


# ==================================================
# GET SINGLE TICKET
# ==================================================

@router.get(
    "/{ticket_id}",
    response_model=TicketResponse
)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
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

    return ticket


# ==================================================
# UPDATE TICKET
# ==================================================

@router.patch("/{ticket_id}",response_model=TicketResponse)
def update_ticket(
    ticket_id: int,
    ticket_data: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
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

    update_data = ticket_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(ticket, field, value)

    db.commit()
    db.refresh(ticket)

    return ticket


# ==================================================
# DELETE TICKET
# ==================================================

@router.delete(
    "/{ticket_id}"
)
def delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    ticket = (
        db.query(Ticket)
        .filter(
            Ticket.id == ticket_id,
            Ticket.user_id == current_user.id
        )
        .first()
    )

    print('ticket delet response is ',ticket)

    if not ticket:

        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    db.delete(ticket)

    db.commit()

    return {
        "message":
            "Ticket deleted successfully"
    }


# ==================================================
# ANALYZE TICKET WITH AI
# ==================================================




@router.post("/{ticket_id}/analyze")
def analyze_ticket_endpoint(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # ==========================================
    # 1. Find ticket
    # ==========================================

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


  

      # ==========================================
        # 2. CONERSATION
        # ==========================================


    messages = (
    db.query(TicketMessage)
    .filter(TicketMessage.ticket_id == ticket.id)
    .order_by(TicketMessage.created_at.asc())
    .all()
    )

    conversation = "\n\n".join(
    [
        f"{message.sender_type}: {message.message}"
        for message in messages
    ]
)

    if not conversation:
      conversation = "No additional conversation messages."

       # ==========================================
         # 2. Run AI analysis
         # ==========================================

    result = analyze_ticket(
            subject=ticket.subject,
            description=ticket.description,
            conversation=conversation
        )
   


    # ==========================================
    # 3. Create AI analysis record
    # ==========================================

    analysis = AIAnalysis(

    ticket_id=ticket.id,
    category=result.analysis.category,
    sentiment=result.analysis.sentiment,
    priority=result.analysis.priority,
    summary=result.analysis.summary,
    recommended_action=result.analysis.recommended_action,
    escalation_required=result.analysis.escalation_required,
    escalation_reason=result.analysis.escalation_reason,
    escalation_department=result.analysis.escalation_department,
    suggested_reply=result.analysis.suggested_reply,
    model=get_model_name()
    )

    db.add(analysis)

    # Flush so analysis.id is available
    db.flush()


    # ==========================================
    # 4. Save RAG sources
    # ==========================================

    for source in result.sources:

        ai_source = AISource(

            analysis_id=analysis.id,

            filename=source.get(
                "filename",
                "Unknown"
            ),

            page_number=source.get(
                "page_number"
            ),

            content=source.get(
                "content"
            )
        )

        db.add(ai_source)


    # ==========================================
    # 5. Commit everything
    # ==========================================

    db.commit()

    db.refresh(analysis)


    # ==========================================
    # 6. Return analysis + sources
    # ==========================================

    return {

        "ticket_id": ticket.id,
         "analysis": {
          "category": analysis.category,
    "sentiment": analysis.sentiment,
    "priority": analysis.priority,
    "summary": analysis.summary,
    "recommended_action": analysis.recommended_action,
    "escalation_required": analysis.escalation_required,
    "escalation_reason": analysis.escalation_reason,
    "escalation_department": analysis.escalation_department,
    "suggested_reply": analysis.suggested_reply
},

        "sources":
             result.sources or []
    }

@router.post("/{ticket_id}/generate-reply")
def generate_reply_endpoint(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ==========================================
    # 1. Find ticket
    # ==========================================

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

    # ==========================================
    # 2. Load conversation
    # ==========================================

    messages = (
        db.query(TicketMessage)
        .filter(
            TicketMessage.ticket_id == ticket.id
        )
        .order_by(
            TicketMessage.created_at.asc()
        )
        .all()
    )

    conversation = "\n\n".join(
        [
            f"{message.sender_type}: {message.message}"
            for message in messages
        ]
    )

    if not conversation:
        conversation = "No additional conversation messages."

    # ==========================================
    # 3. Generate reply
    # ==========================================

    result = generate_ticket_reply(
        subject=ticket.subject,
        description=ticket.description,
        conversation=conversation
    )

    # ==========================================
    # 4. Return reply
    # ==========================================

    return {
        "ticket_id": ticket.id,
        "reply": result["reply"],
        "sources": result["sources"]
    }





@router.get( "/{ticket_id}/analyses",response_model=list[AIAnalysisResponse])

def get_ticket_analysis_history(

    ticket_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )
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


    analyses = (
        db.query(AIAnalysis)
        .filter(
            AIAnalysis.ticket_id == ticket_id
        )
        .order_by(
            AIAnalysis.created_at.desc()
        )
        .all()
    )


    response = []


    for analysis in analyses:

        sources = (
            db.query(AISource)
            .filter(
                AISource.analysis_id ==
                analysis.id
            )
            .all()
        )

    response.append({
        "id": analysis.id,
        "ticket_id": analysis.ticket_id,
         "category": analysis.category,
    "sentiment": analysis.sentiment,
    "priority": analysis.priority,
    "summary": analysis.summary,
    "recommended_action": analysis.recommended_action,
    "escalation_required": analysis.escalation_required,
    "escalation_reason": analysis.escalation_reason,
    "escalation_department": analysis.escalation_department,
    "suggested_reply": analysis.suggested_reply,
    "model": analysis.model,
    "created_at": analysis.created_at,
    "sources": [
        {
            "id": source.id,
            "filename": source.filename,
            "page_number": source.page_number,
            "content": source.content
        }
        for source in sources
    ]
     })


    return response


    # ==========================================
    #  SUMMARIZE TICKET CONVERSTAION
    # ==========================================

@router.post(
    "/{ticket_id}/summarize",
    response_model=SummarizeResponse
)
def summarize_ticket(
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
            TicketMessage.ticket_id == ticket.id
        )
        .order_by(
            TicketMessage.created_at.asc()
        )
        .all()
    )

    conversation = "\n\n".join(
        [
            f"{message.sender_type}: {message.message}"
            for message in messages
        ]
    )

    if not conversation:
        conversation = (
            "No additional conversation messages."
        )

    result = summarize_ticket_conversation(
        subject=ticket.subject,
        description=ticket.description,
        conversation=conversation
    )

    return {
        "ticket_id": ticket.id,
        "summary": result["summary"],
        "recommended_action": result["recommended_action"]
    }


    # ==========================================
    # RECCOMENDED ACTION
    # ==========================================



@router.post(
    "/{ticket_id}/recommend-action",
    response_model=RecommendActionResponse
)
def recommend_action(
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
            TicketMessage.ticket_id == ticket.id
        )
        .order_by(
            TicketMessage.created_at.asc()
        )
        .all()
    )

    conversation = "\n\n".join(
        [
            f"{message.sender_type}: {message.message}"
            for message in messages
        ]
    )

    if not conversation:
        conversation = (
            "No additional conversation messages."
        )

    action = recommend_ticket_action(
        subject=ticket.subject,
        description=ticket.description,
        conversation=conversation
    )

    return {
        "ticket_id": ticket.id,
        "recommended_action": action
    }





 # ==========================================
    # AI STREAMING REPLY
    # ==========================================
@router.post("/{ticket_id}/stream-reply")
def stream_reply(
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
            TicketMessage.ticket_id == ticket.id
        )
        .order_by(
            TicketMessage.created_at.asc()
        )
        .all()
    )

    conversation = "\n\n".join(
        [
            f"{message.sender_type}: {message.message}"
            for message in messages
        ]
    )

    if not conversation:
        conversation = (
            "No additional conversation messages."
        )

    def generate():
        for chunk in stream_ticket_reply(
            subject=ticket.subject,
            description=ticket.description,
            conversation=conversation
        ):
            if chunk.content:
                yield chunk.content

    return StreamingResponse(
        generate(),
        media_type="text/plain"
    )


# EXCALATE TICKET
@router.patch("/{ticket_id}/escalate")
def escalate_ticket(
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

    ticket.status = "ESCALATED"

    db.commit()
    db.refresh(ticket)

    return {
        "ticket_id": ticket.id,
        "status": ticket.status,
        "message": "Ticket escalated successfully"
    }

@router.patch("/{ticket_id}/resolve")
def resolve_ticket(
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

    ticket.status = "RESOLVED"

    db.commit()
    db.refresh(ticket)

    return {
        "ticket_id": ticket.id,
        "status": ticket.status,
        "message": "Ticket resolved successfully"
    }