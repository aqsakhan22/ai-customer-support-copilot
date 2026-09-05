from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class TicketMessageCreate(BaseModel):
    sender_type: Literal[
        "CUSTOMER",
        "AGENT"
    ]

    message: str


class TicketMessageResponse(BaseModel):
    id: int
    ticket_id: int
    sender_type: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True