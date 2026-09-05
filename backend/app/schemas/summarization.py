from pydantic import BaseModel


class SummarizeResponse(BaseModel):
    ticket_id: int
    summary: str
    recommended_action: str

    