from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.schemas.chat import (
    ChatRequest,
    ChatResponse
)
from app.services.ai_service import (
    chat_with_knowledge_base
)
from app.services.auth_dependency import (
    get_current_user
)


router = APIRouter(
    prefix="/api/ai",
    tags=["AI"]
)


# ==================================================
# AI CHAT
# ==================================================

@router.post(
    "/chat",
    response_model=ChatResponse
)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    result = chat_with_knowledge_base(
        request.question
    )

    return result