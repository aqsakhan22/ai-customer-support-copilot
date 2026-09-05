from datetime import datetime

from pydantic import BaseModel
from typing import Literal


# ==================================================
# CREATE TICKET
# ==================================================

class TicketCreate(BaseModel):

    subject: str

    description: str

    priority: str = "MEDIUM"

    customer_id: int | None = None


# ==================================================
# UPDATE TICKET
# ==================================================

class TicketUpdate(BaseModel):
    status: str | None = None
    priority: str | None = None

# class TicketUpdate(BaseModel):
#     status: Literal[
#         "OPEN",
#         "IN_PROGRESS",
#         "RESOLVED",
#         "CLOSED"
#     ] | None = None

#     priority: Literal[
#         "LOW",
#         "MEDIUM",
#         "HIGH"
#     ] | None = None


# ==================================================
# TICKET RESPONSE
# ==================================================

class TicketResponse(BaseModel):

    id: int

    user_id: int
    customer_id: int | None = None

    subject: str

    description: str

    status: str

    priority: str


    # ----------------------------------------------
    # AI fields
    # ----------------------------------------------

    ai_category: str | None = None

    ai_sentiment: str | None = None

    ai_priority: str | None = None

    ai_summary: str | None = None

    ai_suggested_reply: str | None = None


    # ----------------------------------------------
    # Timestamps
    # ----------------------------------------------

    created_at: datetime

    updated_at: datetime


    class Config:

        from_attributes = True

