import { useState } from "react";
import { chatWithKnowledgeBase } from "../services/aiService";
import "../styles/knowledgeBase.css";

function KnowledgeBase() {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copiedIndex, setCopiedIndex] = useState(null);

    async function handleSubmit(event) {
        event.preventDefault();

        const trimmedQuestion = question.trim();

        if (!trimmedQuestion || loading) {
            return;
        }

        setError("");

        setMessages(previous => [
            ...previous,
            {
                role: "user",
                content: trimmedQuestion
            }
        ]);

        setQuestion("");
        setLoading(true);

        try {
            const result = await chatWithKnowledgeBase(
                trimmedQuestion
            );

            setMessages(previous => [
                ...previous,
                {
                    role: "assistant",
                    content:
                        result?.answer ||
                        result?.response ||
                        result?.message ||
                        "No answer was returned.",
                    sources: Array.isArray(result?.sources)
                        ? result.sources
                        : []
                }
            ]);
        } catch (error) {
            console.error(
                "Knowledge Base chat failed:",
                error
            );

            setError(
                error.message ||
                "Unable to get AI response."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleCopy(text, index) {
        try {
            await navigator.clipboard.writeText(text);

            setCopiedIndex(index);

            setTimeout(() => {
                setCopiedIndex(null);
            }, 1800);
        } catch (error) {
            console.error("Copy failed:", error);
        }
    }

    function handleExampleClick(example) {
        setQuestion(example);
    }

    return (
        <main className="knowledge-page">

            {/* =====================================
                PAGE HEADER
            ====================================== */}

            <section className="knowledge-header">

                <div className="knowledge-header-content">

                    <span className="page-eyebrow">
                        KNOWLEDGE ASSISTANT
                    </span>

                    <div className="knowledge-title-row">

                        <div className="knowledge-title-icon">
                            📚
                        </div>

                        <div>
                            <h1>Knowledge Base</h1>

                            <p>
                                Ask questions and get answers
                                from your company's documentation.
                            </p>
                        </div>

                    </div>

                </div>

                <div className="knowledge-status">
                    <span className="status-live-dot"></span>
                    Knowledge Base Connected
                </div>

            </section>


            {/* =====================================
                CHAT CARD
            ====================================== */}

            <section className="knowledge-chat-card">

                {/* =================================
                    CHAT HEADER
                ================================== */}

                <div className="chat-header">

                    <div className="chat-header-left">

                        <div className="chat-header-icon">
                            ✦
                        </div>

                        <div>

                            <div className="chat-title-row">

                                <h2>
                                    AI Knowledge Assistant
                                </h2>

                                <span className="ai-badge">
                                    AI POWERED
                                </span>

                            </div>

                            <p>
                                Answers are grounded in your
                                uploaded Knowledge Base.
                            </p>

                        </div>

                    </div>

                    <div className="chat-header-indicator">
                        <span></span>
                        Ready
                    </div>

                </div>


                {/* =================================
                    MESSAGES
                ================================== */}

                <div className="chat-messages">

                    {messages.length === 0 && (

                        <div className="chat-empty">

                            <div className="chat-empty-icon">
                                <span>✦</span>
                            </div>

                            <span className="empty-eyebrow">
                                ASK YOUR DOCUMENTATION
                            </span>

                            <h3>
                                What would you like to know?
                            </h3>

                            <p>
                                Ask about policies, procedures,
                                refunds, account requirements,
                                billing, or anything contained
                                in your uploaded documents.
                            </p>

                            <div className="example-questions">

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleExampleClick(
                                            "What is the refund policy?"
                                        )
                                    }
                                >
                                    <span>↗</span>
                                    What is the refund policy?
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleExampleClick(
                                            "What are the account requirements?"
                                        )
                                    }
                                >
                                    <span>↗</span>
                                    What are the account requirements?
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleExampleClick(
                                            "How should billing issues be handled?"
                                        )
                                    }
                                >
                                    <span>↗</span>
                                    How should billing issues be handled?
                                </button>

                            </div>

                        </div>

                    )}


                    {messages.map((message, index) => (

                        <div
                            className={
                                message.role === "user"
                                    ? "chat-message user-message"
                                    : "chat-message assistant-message"
                            }
                            key={index}
                        >

                            <div className="message-avatar">

                                {message.role === "user"
                                    ? "U"
                                    : "✦"}

                            </div>


                            <div className="message-content">

                                <div className="message-label-row">

                                    <div className="message-label">
                                        {message.role === "user"
                                            ? "You"
                                            : "AI Assistant"}
                                    </div>

                                    {message.role === "assistant" && (
                                        <span className="message-ai-label">
                                            Knowledge Base
                                        </span>
                                    )}

                                </div>


                                <div className="message-text">
                                    {message.content}
                                </div>


                                {/* =================================
                                    SOURCES
                                ================================== */}

                                {message.role === "assistant" &&
                                    Array.isArray(message.sources) &&
                                    message.sources.length > 0 && (

                                        <div className="chat-sources">

                                            <div className="chat-sources-header">

                                                <div>
                                                    <span className="sources-icon">
                                                        📚
                                                    </span>

                                                    <div>
                                                        <strong>
                                                            Knowledge Base Sources
                                                        </strong>

                                                        <span>
                                                            Information used to
                                                            generate this answer
                                                        </span>
                                                    </div>
                                                </div>

                                                <span className="source-count">
                                                    {message.sources.length}
                                                </span>

                                            </div>


                                            <div className="chat-source-list">

                                                {message.sources.map(
                                                    (
                                                        source,
                                                        sourceIndex
                                                    ) => {

                                                        if (
                                                            typeof source ===
                                                            "string"
                                                        ) {
                                                            return (
                                                                <div
                                                                    className="chat-source"
                                                                    key={
                                                                        sourceIndex
                                                                    }
                                                                >
                                                                    <div className="source-file-icon">
                                                                        📄
                                                                    </div>

                                                                    <div className="source-details">
                                                                        <strong>
                                                                            {source}
                                                                        </strong>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <div
                                                                className="chat-source"
                                                                key={
                                                                    source?.id ||
                                                                    sourceIndex
                                                                }
                                                            >

                                                                <div className="source-file-icon">
                                                                    📄
                                                                </div>

                                                                <div className="source-details">

                                                                    <strong>
                                                                        {
                                                                            source?.filename ||
                                                                            "Unknown file"
                                                                        }
                                                                    </strong>

                                                                    {source?.page_number && (
                                                                        <span>
                                                                            Page{" "}
                                                                            {
                                                                                source.page_number
                                                                            }
                                                                        </span>
                                                                    )}

                                                                </div>

                                                            </div>
                                                        );
                                                    }
                                                )}

                                            </div>

                                        </div>

                                    )}


                                {/* =================================
                                    COPY ANSWER
                                ================================== */}

                                {message.role === "assistant" &&
                                    message.content && (

                                        <button
                                            type="button"
                                            className="copy-answer-button"
                                            onClick={() =>
                                                handleCopy(
                                                    message.content,
                                                    index
                                                )
                                            }
                                        >
                                            <span>
                                                {copiedIndex === index
                                                    ? "✓"
                                                    : "⧉"}
                                            </span>

                                            {copiedIndex === index
                                                ? "Copied"
                                                : "Copy answer"}
                                        </button>

                                    )}

                            </div>

                        </div>

                    ))}


                    {/* =================================
                        LOADING
                    ================================== */}

                    {loading && (

                        <div className="chat-message assistant-message">

                            <div className="message-avatar">
                                ✦
                            </div>

                            <div className="message-content">

                                <div className="message-label-row">

                                    <div className="message-label">
                                        AI Assistant
                                    </div>

                                    <span className="message-ai-label">
                                        Thinking
                                    </span>

                                </div>

                                <div className="typing-card">

                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>

                                    <span>
                                        Searching your Knowledge Base...
                                    </span>

                                </div>

                            </div>

                        </div>

                    )}

                </div>


                {/* =================================
                    ERROR
                ================================== */}

                {error && (

                    <div className="chat-error">

                        <span className="chat-error-icon">
                            !
                        </span>

                        <div>
                            <strong>
                                Unable to answer
                            </strong>

                            <p>
                                {error}
                            </p>
                        </div>

                    </div>

                )}


                {/* =================================
                    INPUT
                ================================== */}

                <form
                    className="chat-input-area"
                    onSubmit={handleSubmit}
                >

                    <div className="input-wrapper">

                        <span className="input-icon">
                            ✦
                        </span>

                        <textarea
                            value={question}
                            onChange={event =>
                                setQuestion(
                                    event.target.value
                                )
                            }
                            placeholder="Ask something about your Knowledge Base..."
                            rows={2}
                            disabled={loading}
                            onKeyDown={event => {

                                if (
                                    event.key === "Enter" &&
                                    !event.shiftKey
                                ) {
                                    event.preventDefault();
                                    handleSubmit(event);
                                }

                            }}
                        />

                    </div>


                    <button
                        type="submit"
                        disabled={
                            loading ||
                            !question.trim()
                        }
                    >

                        {loading ? (
                            <>
                                <span className="send-spinner"></span>
                                Thinking...
                            </>
                        ) : (
                            <>
                                Ask AI
                                <span>→</span>
                            </>
                        )}

                    </button>

                </form>


                <div className="chat-footer">

                    <span>✦</span>

                    AI answers are generated from your
                    uploaded Knowledge Base.

                    <span className="footer-dot">•</span>

                    Always verify important information.

                </div>

            </section>

        </main>
    );
}

export default KnowledgeBase;