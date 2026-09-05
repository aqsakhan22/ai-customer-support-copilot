import { useState } from "react";

import { chatWithKnowledgeBase } from "../services/aiService";

import "../styles/knowledgeAssistant.css";


function KnowledgeAssistant() {

    const [question, setQuestion] =
        useState("");

    const [answer, setAnswer] =
        useState("");

    const [sources, setSources] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    const handleAsk = async (event) => {

        event.preventDefault();

        if (!question.trim()) {

            setError(
                "Please enter a question."
            );

            return;
        }


        try {

            setLoading(true);

            setError("");

            setAnswer("");

            setSources([]);


            const result =
                await chatWithKnowledgeBase(
                    question
                );


            setAnswer(
                result.answer
            );

            setSources(
                result.sources || []
            );


        } catch (error) {

            console.error(
                "AI chat error:",
                error
            );

            setError(
                error.message ||
                "Something went wrong."
            );


        } finally {

            setLoading(false);

        }
    };


    const exampleQuestions = [
        "What is the refund policy?",
        "How long do refunds take?",
        "When should a billing issue be escalated?"
    ];


    const handleExampleClick = (
        example
    ) => {

        setQuestion(example);

    };


    return (

        <div className="assistant-page">

            <div className="assistant-container">

                {/* ================================= */}
                {/* Header */}
                {/* ================================= */}

                <div className="assistant-header">

                    <div className="assistant-icon">
                        ✨
                    </div>

                    <div>

                        <h1>
                            AI Knowledge Assistant
                        </h1>

                        <p>
                            Ask questions about your
                            company knowledge base.
                        </p>

                    </div>

                </div>


                {/* ================================= */}
                {/* Question Box */}
                {/* ================================= */}

                <div className="question-card">

                    <form
                        onSubmit={handleAsk}
                    >

                        <label>
                            Ask your question
                        </label>


                        <div className="question-input-wrapper">

                            <textarea
                                value={question}
                                onChange={(event) =>
                                    setQuestion(
                                        event.target.value
                                    )
                                }
                                placeholder="Ask something about your company documents..."
                                rows="4"
                            />

                            <button
                                type="submit"
                                disabled={loading}
                            >

                                {loading
                                    ? "Thinking..."
                                    : "Ask AI"
                                }

                            </button>

                        </div>

                    </form>


                    {/* ================================= */}
                    {/* Example Questions */}
                    {/* ================================= */}

                    <div className="examples">

                        <span>
                            Try asking:
                        </span>


                        <div className="example-list">

                            {exampleQuestions.map(
                                (example) => (

                                    <button
                                        key={example}
                                        type="button"
                                        onClick={() =>
                                            handleExampleClick(
                                                example
                                            )
                                        }
                                    >
                                        {example}
                                    </button>

                                )
                            )}

                        </div>

                    </div>

                </div>


                {/* ================================= */}
                {/* Error */}
                {/* ================================= */}

                {error && (

                    <div className="error-message">

                        ⚠️ {error}

                    </div>

                )}


                {/* ================================= */}
                {/* Answer */}
                {/* ================================= */}

                {answer && (

                    <div className="answer-card">

                        <div className="section-heading">

                            <div className="heading-icon">
                                🤖
                            </div>

                            <div>

                                <h2>
                                    AI Answer
                                </h2>

                                <span>
                                    Based on your
                                    knowledge base
                                </span>

                            </div>

                        </div>


                        <div className="answer-content">

                            {answer}

                        </div>

                    </div>

                )}


                {/* ================================= */}
                {/* Sources */}
                {/* ================================= */}

                {sources.length > 0 && (

                    <div className="sources-section">

                        <div className="section-heading">

                            <div className="heading-icon">
                                📚
                            </div>

                            <div>

                                <h2>
                                    Sources
                                </h2>

                                <span>
                                    Documents used by AI
                                </span>

                            </div>

                        </div>


                        <div className="sources-list">

                            {sources.map(
                                (source, index) => (

                                    <div
                                        className="source-card"
                                        key={
                                            source.id ||
                                            index
                                        }
                                    >

                                        <div className="source-top">

                                            <div className="file-icon">
                                                📄
                                            </div>

                                            <div className="source-info">

                                                <strong>
                                                    {
                                                        source.filename
                                                    }
                                                </strong>

                                                {source.page_number && (

                                                    <span>
                                                        Page{" "}
                                                        {
                                                            source.page_number
                                                        }
                                                    </span>

                                                )}

                                            </div>

                                        </div>


                                        <p>
                                            {
                                                source.content
                                            }
                                        </p>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                )}


                {/* ================================= */}
                {/* Empty State */}
                {/* ================================= */}

                {!answer &&
                 !loading &&
                 !error && (

                    <div className="empty-state">

                        <div className="empty-icon">
                            💬
                        </div>

                        <h2>
                            Ask your Knowledge Base
                        </h2>

                        <p>
                            Your AI assistant will search
                            uploaded company documents and
                            provide an answer with sources.
                        </p>

                    </div>

                )}

            </div>

        </div>

    );
}


export default KnowledgeAssistant;