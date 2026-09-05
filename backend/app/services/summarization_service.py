from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

from app.config import settings


summary_llm = ChatGroq(
    model=settings.GROQ_MODEL,
    api_key=settings.GROQ_API_KEY,
    temperature=0.2
)



summary_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are an AI Customer Support Copilot.

Summarize the customer support conversation for a support agent.

Rules:

1. Focus on the customer's issue.
2. Include important actions already taken.
3. Include important information provided by the customer.
4. Identify the current state of the issue.
5. Do not invent information.
6. Keep the summary concise and useful for an agent.

Then recommend the next action the support agent should take.

Return only:

SUMMARY:
<conversation summary>

NEXT ACTION:
<recommended next action>
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
"""
        )
    ]
)


def summarize_ticket_conversation(
    subject: str,
    description: str,
    conversation: str
):
    chain = summary_prompt | summary_llm

    response = chain.invoke(
        {
            "subject": subject,
            "description": description,
            "conversation": conversation
        }
    )

    content = response.content.strip()

    if "NEXT ACTION:" in content:
        summary_part, action_part = content.split(
            "NEXT ACTION:",
            1
        )

        summary = summary_part.replace(
            "SUMMARY:",
            ""
        ).strip()

        recommended_action = action_part.strip()

    else:
        summary = content
        recommended_action = (
            "Review the conversation and determine "
            "the appropriate next support action."
        )

    return {
        "summary": summary,
        "recommended_action": recommended_action
    }