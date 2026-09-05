import sys
from pathlib import Path

sys.path.insert(
    0,
    str(Path(__file__).resolve().parents[1])
)

from app.services.ai_service import analyze_ticket


def test_password_reset_ai_analysis():
    result = analyze_ticket(
        subject="Password reset",
        description=(
            "I cannot log into my account because I forgot my password."
        )
    )

    valid_priorities = {
        "LOW",
        "MEDIUM",
        "HIGH",
        "URGENT"
    }

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

    valid_sentiments = {
        "Positive",
        "Neutral",
        "Frustrated",
        "Angry",
        "Negative"
    }

    assert result is not None
    assert result.analysis is not None

    assert result.analysis.priority in valid_priorities
    assert result.analysis.category in valid_categories
    assert result.analysis.sentiment in valid_sentiments

    assert result.analysis.summary
    assert result.analysis.suggested_reply

    assert isinstance(result.sources, list)

    print("\n==============================")
    print("AI RESULT")
    print("==============================")

    print("Category:", result.analysis.category)
    print("Sentiment:", result.analysis.sentiment)
    print("Priority:", result.analysis.priority)
    print("Summary:", result.analysis.summary)
    print("Suggested Reply:", result.analysis.suggested_reply)

    print("==============================")