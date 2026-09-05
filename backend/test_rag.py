from app.services.rag_service import get_rag_context


query = """
I purchased a product 10 days ago.
Can I get a refund?
"""


print("\n========== RAG SEARCH ==========\n")


context = get_rag_context(
    query,
    k=4
)


if context:
    print("Relevant Knowledge Base Information:\n")
    print(context)
else:
    print("No relevant information found.")


print("\n========== END ==========\n")