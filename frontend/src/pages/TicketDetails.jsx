import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  analyzeTicket,
  getAnalysisHistory,
  generateTicketReply,
  summarizeTicket,
  recommendTicketAction,
    streamTicketReply
} from "../services/aiService";

import {
  getTicket,
  getTicketMessages,
  createTicketMessage,
  deleteTicketMessage,
  escalateTicket,
   resolveTicket
} from "../services/ticketService";

import "../styles/ticket-detail.css";

function TicketDetail() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  // TICKET MESSAGES
  const [messages, setMessages] = useState([]);
const [newMessage, setNewMessage] = useState("");
const [sendingMessage, setSendingMessage] = useState(false);


const [generatedReply, setGeneratedReply] = useState("");
const [generatingReply, setGeneratingReply] = useState(false);
const [editingReply, setEditingReply] = useState(false);
const [copiedReply, setCopiedReply] = useState(false);

// # SUMMARY STATE
const [conversationSummary, setConversationSummary] = useState("");
const [summarizing, setSummarizing] = useState(false);


const [recommendedAction, setRecommendedAction] = useState("");
const [recommendingAction, setRecommendingAction] = useState(false);

// AI STREAMING OUPUT REPLY
const [streamingReply, setStreamingReply] = useState(false);

const [escalating, setEscalating] = useState(false);

const [resolving, setResolving] = useState(false);



  useEffect(() => {
    loadTicket();
  }, [ticketId]);

async function loadTicket() {
  try {
    setLoading(true);
    setError("");

    const [ticketData, analysisData, messageData] =
      await Promise.all([
        getTicket(ticketId),
        getAnalysisHistory(ticketId),
        getTicketMessages(ticketId)
      ]);

    setTicket(ticketData);

    setAnalysis(
      analysisData?.length
        ? {
            ...analysisData[0],
            sources: analysisData[0].sources || []
          }
        : null
    );

    setHistory(analysisData || []);
    setMessages(messageData || []);

  } catch (err) {
    console.error("Failed to load ticket:", err);
    setError(
      err.message || "Failed to load ticket."
    );
  } finally {
    setLoading(false);
  }
}

  async function handleAnalyze() {
    try {
      setAnalyzing(true);
      setError("");

      const result =
        await analyzeTicket(ticketId);

      setAnalysis({
        ...result.analysis,
        sources: result.sources || []
      });

      const historyData =
        await getAnalysisHistory(ticketId);

      setHistory(historyData || []);
    } catch (error) {
      console.error(
        "Failed to analyze ticket:",
        error
      );

      setError(
        error.message ||
        "Failed to analyze ticket."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  function formatDate(date) {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString();
  }

 function getStatusLabel(status) {
  const labels = {
    OPEN: "Open",
    IN_PROGRESS: "In Progress",
    WAITING_FOR_CUSTOMER: "Waiting for Customer",
    ESCALATED: "Escalated",
    RESOLVED: "Resolved",
    CLOSED: "Closed"
  };

  return labels[status] || status;
}

  function getPriorityLabel(priority) {
    const labels = {
      LOW: "Low",
      MEDIUM: "Medium",
      HIGH: "High",
      URGENT: "Urgent"
    };

    return labels[priority] || priority;
  }

  if (loading) {
    return (
      <div className="ticket-detail-page">
        <div className="ticket-detail-loading">
          Loading ticket...
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="ticket-detail-page">
        <div className="ticket-detail-error">
          {error || "Ticket not found."}
        </div>
      </div>
    );
  }

  const handleSendMessage = async () => {
  if (!newMessage.trim()) {
    return;
  }

  try {
    setSendingMessage(true);

    const message = await createTicketMessage(ticketId, {
      sender_type: "AGENT",
      message: newMessage.trim()
    });

    setMessages((previous) => [
      ...previous,
      message
    ]);

    setNewMessage("");
  } catch (err) {
    setError(err.message);
  } finally {
    setSendingMessage(false);
  }
};


const handleDeleteMessage = async (messageId) => {
  try {
    await deleteTicketMessage(ticketId, messageId);

    setMessages((previous) =>
      previous.filter((message) => message.id !== messageId)
    );
  } catch (err) {
    setError(err.message);
  }
};

async function handleGenerateReply() {
  try {
    setGeneratingReply(true);
    setError("");
    setCopiedReply(false);

    const data = await generateTicketReply(ticketId);

    setGeneratedReply(data.reply || "");
    setEditingReply(false);
  } catch (err) {
    console.error("Failed to generate reply:", err);
    setError(err.message || "Failed to generate reply.");
  } finally {
    setGeneratingReply(false);
  }
}

async function handleRegenerateReply() {
  await handleGenerateReply();
}

async function handleCopyReply() {
  if (!generatedReply) return;

  try {
    await navigator.clipboard.writeText(generatedReply);

    setCopiedReply(true);

    setTimeout(() => {
      setCopiedReply(false);
    }, 2000);
  } catch (err) {
    console.error("Failed to copy reply:", err);
  }
}


async function handleSummarizeConversation() {
  try {
    setSummarizing(true);
    setError("");

    const data = await summarizeTicket(ticketId);

    setConversationSummary(data.summary || "");
    setRecommendedAction(data.recommended_action || "");
  } catch (err) {
    console.error("Failed to summarize conversation:", err);

    setError(
      err.message || "Failed to summarize conversation."
    );
  } finally {
    setSummarizing(false);
  }
}

async function handleRecommendAction() {
  try {
    setRecommendingAction(true);
    setError("");

    const data = await recommendTicketAction(ticketId);

    setRecommendedAction(
      data.recommended_action || ""
    );
  } catch (err) {
    console.error(
      "Failed to recommend action:",
      err
    );

    setError(
      err.message ||
      "Failed to recommend next action."
    );
  } finally {
    setRecommendingAction(false);
  }
}


async function handleStreamReply() {
  try {
    setStreamingReply(true);
    setError("");
    setGeneratedReply("");
    setEditingReply(false);

    await streamTicketReply(
      ticketId,
      (chunk) => {
        setGeneratedReply((previous) => {
          return previous + chunk;
        });
      }
    );
  } catch (err) {
    console.error(
      "Failed to stream reply:",
      err
    );

    setError(
      err.message || "Failed to generate streaming reply."
    );
  } finally {
    setStreamingReply(false);
  }
}

async function handleEscalateTicket() {
  try {
    setEscalating(true);
    setError("");

    const data = await escalateTicket(ticketId);

    setTicket((previous) => ({
      ...previous,
      status: data.status
    }));
  } catch (err) {
    console.error(
      "Failed to escalate ticket:",
      err
    );

    setError(
      err.message || "Failed to escalate ticket."
    );
  } finally {
    setEscalating(false);
  }
}

async function handleResolveTicket() {
  try {
    setResolving(true);
    setError("");

    const data = await resolveTicket(ticketId);

    setTicket((previous) => ({
      ...previous,
      status: data.status
    }));
  } catch (err) {
    console.error(
      "Failed to resolve ticket:",
      err
    );

    setError(
      err.message || "Failed to resolve ticket."
    );
  } finally {
    setResolving(false);
  }
}

  return (
    <div className="ticket-detail-page">

      <button
        type="button"
        className="back-button"
        onClick={() => navigate("/tickets")}
      >
        ← Back to Tickets
      </button>

      {error && (
        <div className="ticket-detail-error">
          {error}
        </div>
      )}

      <div className="ticket-detail-header">

        <div>
          <span className="ticket-detail-eyebrow">
            TICKET #{ticket.id}
          </span>

          <h1>{ticket.subject}</h1>

          <p>
            Created {formatDate(ticket.created_at)}
          </p>
        </div>

   <div className="ticket-detail-header-actions">

  <span
    className={`detail-status status-${(
      ticket.status || ""
    ).toLowerCase()}`}
  >
    {getStatusLabel(ticket.status)}
    
  </span>

  <span
    className={`detail-priority priority-${(
      ticket.priority || ""
    ).toLowerCase()}`}
  >
    {getPriorityLabel(ticket.priority)}
  </span>

  {ticket.status !== "RESOLVED" &&
    ticket.status !== "CLOSED" &&
    ticket.status !== "ESCALATED" && (
      <button
        type="button"
        className="resolve-button"
        onClick={handleResolveTicket}
        disabled={resolving}
      >
        {resolving
          ? "Resolving..."
          : "Resolve Ticket"}
      </button>
    )}

</div>

      </div>

      <div className="ticket-detail-grid">

        {/* =========================
            TICKET INFORMATION
        ========================== */}

        <section className="detail-card">

          <div className="detail-card-header">
            <div>
              <span className="detail-card-eyebrow">
                CUSTOMER REQUEST
              </span>

              <h2>Ticket Description</h2>
            </div>
          </div>

          <div className="ticket-description">
            {ticket.description}
          </div>

          <div className="ticket-meta">

            <div>
              <span>Status</span>
              <strong>
                {getStatusLabel(ticket.status)}
              </strong>
            </div>

            <div>
              <span>Priority</span>
              <strong>
                {getPriorityLabel(ticket.priority)}
              </strong>
            </div>



            <div>
              <span>Created</span>
              <strong>
                {formatDate(ticket.created_at)}
              </strong>
            </div>

            <div>
              <span>Updated</span>
              <strong>
                {formatDate(ticket.updated_at)}
              </strong>
            </div>

          </div>

        </section>

              {/* =========================
            Customer and agent messages
        ========================== */}

        <section className="ticket-section conversation-section">
  <div className="section-header">
    <div>
      <h2>Conversation</h2>
      <p>Customer and agent messages</p>
    </div>

    <span className="message-count">
      {messages.length} message{messages.length !== 1 ? "s" : ""}
    </span>
  </div>

  <div className="conversation-list">
    {messages.length === 0 ? (
      <div className="empty-conversation">
        <p>No messages yet.</p>
        <span>Start the conversation below.</span>
      </div>
    ) : (
      messages.map((message) => (
        <div
          key={message.id}
          className={`conversation-message ${
            message.sender_type === "AGENT"
              ? "agent-message"
              : "customer-message"
          }`}
        >
          <div className="message-top">
            <strong>
              {message.sender_type === "AGENT"
                ? "Agent"
                : "Customer"}
            </strong>

            <span>
              {new Date(message.created_at).toLocaleString()}
            </span>
          </div>

          <p>{message.message}</p>

          <button
            className="delete-message-button"
            onClick={() => handleDeleteMessage(message.id)}
          >
            Delete
          </button>
        </div>
      ))
    )}
  </div>

  <div className="message-composer">
    <textarea
      value={newMessage}
      onChange={(event) => setNewMessage(event.target.value)}
      placeholder="Write a message to the customer..."
      rows={4}
    />

    <button
      onClick={handleSendMessage}
      disabled={sendingMessage || !newMessage.trim()}
    >
      {sendingMessage ? "Sending..." : "Send Message"}
    </button>
  </div>
</section>


  {/* =========================
           SUMMARIZE TEXT / CONVERSATION
        ========================== */}

<section className="conversation-summary-section">
  <div className="conversation-summary-header">
    <div>
      <h2>Conversation Summary</h2>

      <p>
        Summarize the customer conversation and identify
        the recommended next action.
      </p>
    </div>

    <button
      className="primary-button"
      onClick={handleSummarizeConversation}
      disabled={summarizing}
    >
      {summarizing
        ? "Summarizing..."
        : conversationSummary
          ? "Refresh Summary"
          : "Summarize Conversation"}
    </button>
  </div>

  {conversationSummary && (
    <div className="conversation-summary-card">

      <div className="summary-block">
        <div className="summary-label">
          Conversation Summary
        </div>

        <p className="summary-text">
          {conversationSummary}
        </p>
      </div>

      {recommendedAction && (
        <div className="next-action-block">
          <div className="summary-label">
            Recommended Next Action
          </div>

          <p className="next-action-text">
            {recommendedAction}
          </p>
        </div>
      )}

    </div>
  )}
</section>

{/* RECCOMENDED ACTION TAKEN */}

<section className="next-action-section">
  <div className="next-action-header">
    <div>
      <h2>Recommended Next Action</h2>

      <p>
        Get a focused recommendation for what the
        support agent should do next.
      </p>
    </div>

    <button
      className="primary-button"
      onClick={handleRecommendAction}
      disabled={recommendingAction}
    >
      {recommendingAction
        ? "Analyzing..."
        : recommendedAction
          ? "Refresh Recommendation"
          : "Recommend Action"}
    </button>
  </div>

  {recommendedAction && (
    <div className="next-action-card">
      <div className="next-action-icon">
        →
      </div>

      <div>
        <div className="next-action-label">
          Suggested Next Step
        </div>

        <p>
          {recommendedAction}
        </p>
      </div>
    </div>
  )}
</section>

        {/* =========================
            AI ANALYSIS
        ========================== */}

       {/* =========================
    AI ANALYSIS
========================== */}

<section className="detail-card">

  <div className="detail-card-header">

    <div>
      <span className="detail-card-eyebrow">
        AI COPILOT
      </span>

      <h2>AI Analysis</h2>
    </div>

    <button
      type="button"
      className="detail-analyze-button"
      onClick={handleAnalyze}
      disabled={analyzing}
    >
      {analyzing
        ? "Analyzing..."
        : analysis
          ? "Re-analyze"
          : "Analyze Ticket"}
    </button>

  </div>

  {!analysis ? (

    <div className="analysis-empty">

      <div>✨</div>

      <h3>
        No AI analysis yet
      </h3>

      <p>
        Analyze this ticket to determine
        category, sentiment, priority and
        generate a suggested reply.
      </p>

    </div>

  ) : (

    <div className="analysis-content">

      {/* =========================
          BASIC AI ANALYSIS
      ========================== */}

      <div className="analysis-grid">

        <div>
          <span>Category</span>

          <strong>
            {analysis.category || "—"}
          </strong>
        </div>

        <div>
          <span>Sentiment</span>

          <strong>
            {analysis.sentiment || "—"}
          </strong>
        </div>

        <div>
          <span>Priority</span>

          <strong>
            {analysis.priority || "—"}
          </strong>
        </div>

        <div>
          <span>Model</span>

          <strong>
            {analysis.model || "Groq"}
          </strong>
        </div>

      </div>


      {/* =========================
          SUMMARY
      ========================== */}

      <div className="analysis-block">

        <span>Summary</span>

        <p>
          {analysis.summary || "—"}
        </p>

      </div>


      {/* =========================
          RECOMMENDED ACTION
      ========================== */}

      {analysis.recommended_action && (
        <div className="analysis-item">

          <div className="analysis-label">
            Recommended Action
          </div>

          <div className="analysis-value">
            {analysis.recommended_action}
          </div>

        </div>
      )}


      {/* =========================
          ESCALATION
      ========================== */}

      <div
        className={`escalation-panel ${
          analysis.escalation_required
            ? "escalation-required"
            : "escalation-not-required"
        }`}
      >

        <div className="escalation-header">

          <div>

            <div className="analysis-label">
              Escalation
            </div>

            <strong>
              {analysis.escalation_required
                ? "Escalation Required"
                : "No Escalation Required"}
            </strong>

          </div>

          {analysis.escalation_required && (
            <span className="escalation-badge">
              ESCALATE
            </span>
          )}

        </div>


        {analysis.escalation_required && (
          <>

            {/* Department */}

            {analysis.escalation_department && (
              <div className="escalation-detail">

                <span>
                  Department
                </span>

                <strong>
                  {analysis.escalation_department}
                </strong>

              </div>
            )}


            {/* Reason */}

            {analysis.escalation_reason && (
              <div className="escalation-detail">

                <span>
                  Reason
                </span>

                <p>
                  {analysis.escalation_reason}
                </p>

              </div>
            )}


            {/* Escalate Button */}

            {ticket.status !== "ESCALATED" ? (

              <button
                type="button"
                className="escalate-button"
                onClick={handleEscalateTicket}
                disabled={escalating}
              >
                {escalating
                  ? "Escalating..."
                  : "Escalate Ticket"}
              </button>

            ) : (

              <div className="escalated-confirmation">
                ✓ Ticket has been escalated
              </div>

            )}

          </>
        )}

      </div>


      {/* =========================
          SUGGESTED REPLY
      ========================== */}

      <div className="analysis-block">

        <span>
          Suggested Reply
        </span>

        <div className="suggested-reply">
          {analysis.suggested_reply || "—"}
        </div>

      </div>


      {/* =========================
          KNOWLEDGE SOURCES
      ========================== */}

      {analysis.sources?.length > 0 && (

        <div className="analysis-block">

          <span>
            Knowledge Sources
          </span>

          <div className="detail-sources">

            {analysis.sources.map(
              (source, index) => (

                <div
                  className="detail-source"
                  key={
                    source.id || index
                  }
                >

                  <strong>
                    {source.filename}
                  </strong>

                  {source.page_number && (
                    <span>
                      Page{" "}
                      {source.page_number}
                    </span>
                  )}

                </div>

              )
            )}

          </div>

        </div>

      )}

    </div>

  )}

</section>


        <section className="reply-section">
  <div className="reply-section-header">
    <div>
      <h2>Suggested Reply</h2>
      <p>
        Generate a grounded customer-facing response using the ticket
        conversation and company knowledge.
      </p>
    </div>

    <button
      className="primary-button"
      onClick={handleGenerateReply}
      disabled={generatingReply}
    >
      {generatingReply
        ? "Generating..."
        : generatedReply
          ? "Regenerate Reply"
          : "Generate Reply"}
    </button>
                 <button
  className="primary-button"
  onClick={handleStreamReply}
  disabled={streamingReply}
>
  {streamingReply
    ? "Generating..."
    : "Generate Streaming Reply"}
</button>
  </div>

  {generatedReply && (
    <div className="reply-card">
      <div className="reply-toolbar">
        <span>AI-generated response</span>

        <div className="reply-actions">
          <button
            className="secondary-button"
            onClick={() => setEditingReply(!editingReply)}
          >
            {editingReply ? "Done Editing" : "Edit"}
          </button>

          <button
            className="secondary-button"
            onClick={handleCopyReply}
          >
            {copiedReply ? "Copied!" : "Copy"}
          </button>

          <button
            className="secondary-button"
            onClick={handleRegenerateReply}
            disabled={generatingReply}
          >
            Regenerate
          </button>
        </div>
      </div>

      {editingReply ? (
        <textarea
          className="reply-editor"
          value={generatedReply}
          onChange={(event) => setGeneratedReply(event.target.value)}
          rows={12}
        />
      ) : (
        <div className="reply-content">
          {generatedReply.split("\n").map((line, index) => (
            <p key={index}>
              {line || "\u00A0"}
            </p>
          ))}
        </div>
      )}
    </div>
  )}
</section>

      </div>



      {/* =========================
          ANALYSIS HISTORY
      ========================== */}

      {history.length > 0 && (
        <section className="detail-card history-card">

          <div className="detail-card-header">

            <div>
              <span className="detail-card-eyebrow">
                AI ACTIVITY
              </span>

              <h2>
                Analysis History
              </h2>
            </div>

            <span className="history-count">
              {history.length}{" "}
              {history.length === 1
                ? "analysis"
                : "analyses"}
            </span>

          </div>

          <div className="history-list">

            {history.map(item => (

              <div
                className="history-item"
                key={item.id}
              >

                <div className="history-item-header">

                  <strong>
                    {item.category || "Analysis"}
                  </strong>

                  <span>
                    {formatDate(
                      item.created_at
                    )}
                  </span>

                </div>

                <p>
                  {item.summary || "No summary"}
                </p>

              </div>

            ))}

          </div>

        </section>
      )}

    </div>
  );
}

export default TicketDetail;