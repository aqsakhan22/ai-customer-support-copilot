from pydantic import BaseModel


class GenerateReplyResponse(BaseModel):
    ticket_id: int
    reply: str
    sources: list