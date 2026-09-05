from langchain_core.prompts import ChatPromptTemplate

from app.services.rag_service import get_rag_context_and_sources
from langchain_groq import ChatGroq

from app.config import settings


reply_llm = ChatGroq(
    model=settings.GROQ_MODEL,
    api_key=settings.GROQ_API_KEY,
    temperature=0.2
)




reply_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are an AI Customer Support Copilot.

Generate a professional customer support reply.

IMPORTANT RULES:

1. Use the Company Knowledge Base when relevant.
2. Do not invent company policies.
3. Do not invent refunds, timelines, guarantees,
   account information, or other unsupported details.
4. If the Knowledge Base does not contain enough
   information to answer something, do not make up
   an answer.
5. Consider the entire conversation.
6. Address the customer's latest issue directly.
7. Keep the response professional, concise, and helpful.
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




def generate_ticket_reply(
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
    sources = rag_result["sources"]

    if not context:
        context = (
            "No relevant information was found "
            "in the company Knowledge Base."
        )

    chain = reply_prompt | reply_llm

    response = chain.invoke(
        {
            "subject": subject,
            "description": description,
            "conversation": conversation,
            "context": context
        }
    )

    return {
        "reply": response.content,
        "sources": sources
    }