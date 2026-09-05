import sys
from pathlib import Path

# Add the backend directory to Python's import path
BACKEND_DIR = Path(__file__).resolve().parents[1]
print('BACKEND_DIR',BACKEND_DIR)

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


from app.services.ai_service import analyze_ticket


def test_password_reset_ai_analysis():
    result = analyze_ticket(
        subject="Password reset",
        description=(
            "I cannot log into my account because I forgot my password."
        ),
        conversation=""
    )

    # Valid AI categories
    valid_categories = {
        "Billing",
        "Technical",
        "Account",
        "Delivery",
        "Refund",
        "Product",
        "Subscription",
        "Other"
    }

    # Valid AI sentiments
    valid_sentiments = {
        "Positive",
        "Neutral",
        "Frustrated",
        "Angry",
        "Negative"
    }

    # Valid AI priorities
    valid_priorities = {
        "LOW",
        "MEDIUM",
        "HIGH",
        "URGENT"
    }

    # Make sure the AI returned a result
    assert result is not None

    # Make sure the analysis exists
    assert result.analysis is not None

    # Validate category
    assert result.analysis.category in valid_categories

    # Validate sentiment
    assert result.analysis.sentiment in valid_sentiments

    # Validate priority
    assert result.analysis.priority in valid_priorities

    # Validate summary
    assert result.analysis.summary

    # Validate suggested reply
    assert result.analysis.suggested_reply

    # Validate RAG sources
    assert isinstance(result.sources, list)

    # Display result in terminal
    print()
    print("==============================")
    print("AI EVALUATION RESULT")
    print("==============================")

    print(
        "Category:",
        result.analysis.category
    )

    print(
        "Sentiment:",
        result.analysis.sentiment
    )

    print(
        "Priority:",
        result.analysis.priority
    )

    print(
        "Summary:",
        result.analysis.summary
    )

    print(
        "Suggested Reply:",
        result.analysis.suggested_reply
    )

    print(
        "Number of Sources:",
        len(result.sources)
    )

    print("==============================")