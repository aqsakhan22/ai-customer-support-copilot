from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

from app.config import settings
from app.services.rag_service import get_rag_context_and_sources


stream_llm = ChatGroq(
    model=settings.GROQ_MODEL,
    api_key=settings.GROQ_API_KEY,
    temperature=0.2
)


stream_reply_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are an AI Customer Support Copilot.

Generate a professional customer-facing support reply.

Rules:

1. Use the Knowledge Base when relevant.
2. Do not invent company policies.
3. Do not invent customer information.
4. Do not promise unsupported refunds, timelines,
   guarantees, or outcomes.
5. Consider the entire conversation.
6. Address the customer's latest issue directly.
7. Be concise, professional, and helpful.
8. Do not mention the Knowledge Base.
9. Do not mention that you are an AI.

Return ONLY the customer-facing reply.
"""
        ),
        (
            "human",
            """
Ticket Subject:
{subject}

Ticket Description:
{description}

Conversation:
{conversation}

Company Knowledge Base:
{context}

Generate the customer-facing reply.
"""
        )
    ]
)


def stream_ticket_reply(
    subject: str,
    description: str,
    conversation: str = ""
):
    ticket_query = f"""
Subject:
{subject}

Description:
{description}

Conversation:
{conversation}
"""

    rag_result = get_rag_context_and_sources(
        query=ticket_query,
        k=4
    )

    context = rag_result["context"]

    if not context:
        context = (
            "No relevant information was found "
            "in the company Knowledge Base."
        )

    chain = stream_reply_prompt | stream_llm
    print("Starting Groq streaming...")

    return chain.stream(
        {
            "subject": subject,
            "description": description,
            "conversation": conversation,
            "context": context
        }
    )