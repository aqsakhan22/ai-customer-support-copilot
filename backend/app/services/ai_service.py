
import os

from dotenv import load_dotenv

from langchain_groq import ChatGroq

from app.schemas.ai import TicketAnalysis

from app.prompts.ticket_analysis import (
    ticket_analysis_prompt
)

from app.services.rag_service import (
    get_rag_context_and_sources
)
from dataclasses import dataclass

from app.prompts.rag_chat import (
    rag_chat_prompt
)

load_dotenv()


# -----------------------------------------
# Groq configuration
# -----------------------------------------

GROQ_API_KEY = os.getenv(
    "GROQ_API_KEY"
)

GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-20b"
)


# -----------------------------------------
# Groq LLM
# -----------------------------------------

llm = ChatGroq(
    model=GROQ_MODEL,
    api_key=GROQ_API_KEY,
    temperature=0
).with_structured_output(
    TicketAnalysis
)

chat_llm = ChatGroq(
    model=GROQ_MODEL,
    api_key=GROQ_API_KEY,
    temperature=0
)

# -----------------------------------------
# LangChain chain
# -----------------------------------------

chain = (
    ticket_analysis_prompt
    | llm
)
def get_model_name():
    return GROQ_MODEL





@dataclass
class AIAnalysisResult:

    analysis: TicketAnalysis

    sources: list[dict]


# -----------------------------------------
# Analyze ticket with RAG
# -----------------------------------------

def analyze_ticket(
    subject: str,
    description: str,
    conversation: str = ""
) -> AIAnalysisResult:

    # -------------------------------------
    # 1. Create ticket query
    # -------------------------------------

    ticket_query = f"""
     Subject:
     {subject}

     Description:
     {description}

      Conversation:
     {conversation}
    """


    # -------------------------------------
    # 2. Search Knowledge Base
    # -------------------------------------

    rag_result = get_rag_context_and_sources( query=ticket_query,k=4 )

    context = rag_result["context"]

    sources = rag_result["sources"]

    print("========== RAG DEBUG ==========")
    print("CONTEXT:")
    print(context)

    print("SOURCES:")
    print(sources)

    print("NUMBER OF SOURCES:")
    print(len(sources))

    print("================================")


    # -------------------------------------
    # 3. Fallback if nothing found
    # -------------------------------------

    if not context:

        context = (
        "No relevant information was found "
        "in the company Knowledge Base."
       )
    #     output will return like this
    #     {
    # "context": "Source: refund_policy.pdf...",
    # "sources": [
    #     "refund_policy.pdf",
    #     "requirements.pdf"
    # ]
    #  }


    # -------------------------------------
    # 4. Send ticket + RAG context to Groq
    # -------------------------------------

    response = chain.invoke(
        {
            "subject": subject,

            "description": description,

            "context": context,
            
            "conversation": conversation,
        }
    )


    return AIAnalysisResult( analysis=response,sources=sources)



def chat_with_knowledge_base(
    question: str
):

    # ==========================================
    # 1. Search Knowledge Base
    # ==========================================

    rag_result = get_rag_context_and_sources(
        query=question,
        k=4
    )

    context = rag_result["context"]

    sources = rag_result["sources"]


    # ==========================================
    # 2. No documents found
    # ==========================================

    if not context:

        return {
            "answer": (
                "I couldn't find relevant "
                "information in the Knowledge Base "
                "to answer your question."
            ),

            "sources": []
        }


    # ==========================================
    # 3. Send context + question to Groq
    # ==========================================

    response = (
        rag_chat_prompt | chat_llm
    ).invoke(
        {
            "context": context,

            "question": question
        }
    )


    # ==========================================
    # 4. Return answer + sources
    # ==========================================

    return {

        "answer": response.content,

        "sources": sources
    }






# if __name__ == "__main__":

#     result = analyze_ticket(
#         subject="Charged twice",
#         description=(
#             "I was charged twice for my subscription. "
#             "Please refund the extra payment."
#         )
#     )

#     print(result)


# simple prompt
# from app.prompts.ticket_analysis import (ticket_analysis_prompt)

# load_dotenv()


# GROQ_API_KEY = os.getenv("GROQ_API_KEY")
# GROQ_MODEL = os.getenv(
#     "GROQ_MODEL",
#     "openai/gpt-oss-20b"
# )


# llm = ChatGroq(
#     model=GROQ_MODEL,
#     api_key=GROQ_API_KEY,
#     temperature=0
# )


# chain = ticket_analysis_prompt | llm

# def analyze_ticket(
#     subject: str,
#     description: str
# ):

#     response = chain.invoke(
#         {
#             "subject": subject,
#             "description": description
#         }
#     )

#     return response.content

# if __name__ == "__main__":

#     result = analyze_ticket(
#         subject="Charged twice",
#         description=(
#             "I was charged twice for my subscription. "
#             "Please refund the extra payment."
#         )
#     )

#     print(result)
    #python3 -m app.services.ai_service