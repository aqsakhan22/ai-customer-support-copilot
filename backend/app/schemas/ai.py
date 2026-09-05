
from datetime import datetime

from pydantic import BaseModel,Field




# ==================================================
# AI Analysis returned by Groq
# ==================================================

class TicketAnalysis(BaseModel):
    category: str
    sentiment: str
    priority: str
    summary: str
    recommended_action: str
    escalation_required: bool
    escalation_reason: str | None
    escalation_department: str | None
    suggested_reply: str


# ==================================================
# AI Source
# ==================================================


class AISourceResponse(BaseModel):

    id: int

    filename: str

    page_number: int | None = None

    content: str | None = None


    class Config:

        from_attributes = True




# ==================================================
# AI Analysis History
# ==================================================

class AIAnalysisResponse(BaseModel):

    id: int

    ticket_id: int

    category: str | None = None

    sentiment: str | None = None

    priority: str | None = None

    summary: str | None = None

    suggested_reply: str | None = None

    model: str | None = None

    recommended_action: str | None
    escalation_required: bool
    escalation_reason: str | None
    escalation_department: str | None

    created_at: datetime

    sources: list[AISourceResponse] = Field( default_factory=list)


    class Config:

        from_attributes = True

