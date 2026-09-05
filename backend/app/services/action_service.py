from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

from app.config import settings
from app.services.rag_service import get_rag_context_and_sources


action_llm = ChatGroq(
    model=settings.GROQ_MODEL,
    api_key=settings.GROQ_API_KEY,
    temperature=0.2
)


action_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are an AI Customer Support Copilot.

Recommend the next action a support agent should take.

Rules:

1. Consider the ticket description.
2. Consider the entire conversation.
3. Use the Knowledge Base when relevant.
4. Do not invent company policies.
5. Do not invent customer information.
6. Do not promise unsupported outcomes.
7. The action must be practical and specific.
8. Keep it concise.
9. Return ONLY the recommended action.
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

Relevant Knowledge Base:
{context}

Recommend the next action for the support agent.
"""
        )
    ]
)


def recommend_ticket_action(
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

    chain = action_prompt | action_llm

    response = chain.invoke(
        {
            "subject": subject,
            "description": description,
            "conversation": conversation,
            "context": context
        }
    )

    return response.content.strip()