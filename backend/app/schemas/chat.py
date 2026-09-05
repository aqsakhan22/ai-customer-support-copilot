from pydantic import BaseModel


class ChatRequest(BaseModel):

    question: str


class ChatSource(BaseModel):

    filename: str

    page_number: int | None = None

    content: str


class ChatResponse(BaseModel):

    answer: str

    sources: list[ChatSource]
