from pydantic import BaseModel


class RecommendActionResponse(BaseModel):
    ticket_id: int
    recommended_action: str