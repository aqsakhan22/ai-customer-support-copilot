import { useState } from "react";

import "../styles/ticketCard.css";

function TicketCard({
  ticket,
  onOpen,
  onDelete,
  onStatusChange,
  onPriorityChange,
  onAnalyze,
  analyzing,
  aiResult,
  analysisHistory = []
}) {
  const [showHistory, setShowHistory] = useState(false);

  // =========================================
  // AI DATA
  // =========================================

  const analysis = aiResult?.analysis || null;

  const sources = Array.isArray(aiResult?.sources)
    ? aiResult.sources
    : [];

  // =========================================
  // HELPERS
  // =========================================

  function getPriorityClass(priority) {
    if (!priority) {
      return "priority-medium";
    }

    return `priority-${priority.toLowerCase()}`;
  }

  function getStatusClass(status) {
    if (!status) {
      return "status-open";
    }

    return `status-${status.toLowerCase()}`;
  }

  // =========================================
  // UI
  // =========================================

  return (
    <article className="ticket-card">

      {/* =====================================
          TICKET HEADER
      ===================================== */}

      <div className="ticket-card-header">

        <div className="ticket-title-area">

          <span className="ticket-id">
            #{ticket.id}
          </span>

          <div className="ticket-title-content">
            <span className="ticket-label">
              SUPPORT TICKET
            </span>

            <h3>
              {ticket.subject}
            </h3>
          </div>

        </div>

        <div className="ticket-badges">

          <span
            className={`ticket-status ${getStatusClass(
              ticket.status
            )}`}
          >
            <span className="badge-dot"></span>
            {ticket.status || "OPEN"}
          </span>

          <span
            className={`ticket-priority ${getPriorityClass(
              ticket.priority || "MEDIUM"
            )}`}
          >
            {ticket.priority || "MEDIUM"}
          </span>

        </div>

      </div>


      {/* =====================================
          DESCRIPTION
      ===================================== */}

      <div className="ticket-description">

        <div className="description-header">
          <span className="description-icon">💬</span>

          <span>
            Customer Request
          </span>
        </div>

        <p>
          {ticket.description}
        </p>

      </div>


      {/* =====================================
          ACTIONS
      ===================================== */}

    <div className="ticket-actions">

  {/* STATUS */}

  <div className="status-control">

    <label htmlFor={`status-${ticket.id}`}>
      Update Status
    </label>

    <select
  id={`status-${ticket.id}`}
  value={ticket.status}
  onChange={event =>
    onStatusChange(
      ticket.id,
      event.target.value
    )
  }
>
  <option value="OPEN">
    Open
  </option>

  <option value="IN_PROGRESS">
    In Progress
  </option>

  <option value="WAITING_FOR_CUSTOMER">
    Waiting for Customer
  </option>

  <option value="ESCALATED">
    Escalated
  </option>

  <option value="RESOLVED">
    Resolved
  </option>

  <option value="CLOSED">
    Closed
  </option>
</select>

  </div>


  {/* PRIORITY */}

  <div className="status-control">

    <label htmlFor={`priority-${ticket.id}`}>
      Update Priority
    </label>

    <select
      id={`priority-${ticket.id}`}
      value={ticket.priority || "MEDIUM"}
      onChange={event =>
        onPriorityChange(
          ticket.id,
          event.target.value
        )
      }
    >
      <option value="LOW">
        Low
      </option>

      <option value="MEDIUM">
        Medium
      </option>

      <option value="HIGH">
        High
      </option>

      <option value="URGENT">
        Urgent
      </option>
    </select>

  </div>


  {/* ACTION BUTTONS */}

  <div className="ticket-action-buttons">

    <button
      type="button"
      className="analyze-button"
      onClick={() =>
        onAnalyze(ticket.id)
      }
      disabled={analyzing}
    >
      {analyzing ? (
        <>
          <span className="spinner"></span>
          Analyzing...
        </>
      ) : (
        <>
          <span>✨</span>
          Analyze with AI
        </>
      )}
    </button>

    <button
      type="button"
      className="delete-button"
      onClick={() =>
        onDelete(ticket.id)
      }
    >
      <span>🗑</span>
      Delete
    </button>

    <button
  type="button"
  className="open-ticket-button"
  onClick={() => onOpen(ticket.id)}
>
  <span>↗</span>
  Open Ticket
</button>

  </div>

</div>


      {/* =====================================
          AI ANALYSIS
      ===================================== */}

      {analysis && (

        <div className="ai-analysis">

          <div className="ai-analysis-header">

            <div className="ai-heading-left">

              <div className="ai-icon">
                ✦
              </div>

              <div>
                <span className="ai-label">
                  AI ANALYSIS
                </span>

                <h3>
                  Support Copilot
                </h3>

                <p>
                  AI-generated insights based on your
                  support knowledge base.
                </p>
              </div>

            </div>

            <span className="ai-powered-badge">
              AI Powered
            </span>

          </div>


          {/* =================================
              AI METRICS
          ================================= */}

          <div className="ai-metrics">

            <div className="ai-metric">

              <div className="metric-icon">
                🏷
              </div>

              <div>
                <span>
                  Category
                </span>

                <strong>
                  {analysis.category || "N/A"}
                </strong>
              </div>

            </div>


            <div className="ai-metric">

              <div className="metric-icon">
                ◉
              </div>

              <div>
                <span>
                  Sentiment
                </span>

                <strong>
                  {analysis.sentiment || "N/A"}
                </strong>
              </div>

            </div>


            <div className="ai-metric">

              <div className="metric-icon">
                !
              </div>

              <div>
                <span>
                  Priority
                </span>

                <strong>
                  {analysis.priority || "N/A"}
                </strong>
              </div>

            </div>

          </div>


          {/* =================================
              SUMMARY
          ================================= */}

          {analysis.summary && (

            <div className="ai-section">

              <div className="ai-section-heading">
                <span>📝</span>
                <h4>
                  Summary
                </h4>
              </div>

              <div className="ai-summary">
                <p>
                  {analysis.summary}
                </p>
              </div>

            </div>

          )}


          {/* =================================
              SUGGESTED REPLY
          ================================= */}

          {analysis.suggested_reply && (

            <div className="ai-section">

              <div className="ai-section-heading">
                <span>✉️</span>
                <h4>
                  Suggested Reply
                </h4>
              </div>

              <div className="suggested-reply">
                {analysis.suggested_reply}
              </div>

              <button
                type="button"
                className="copy-button"
                onClick={() =>
                  navigator.clipboard.writeText(
                    analysis.suggested_reply
                  )
                }
              >
                <span>⧉</span>
                Copy Reply
              </button>

            </div>

          )}


          {/* =================================
              KNOWLEDGE BASE SOURCES
          ================================= */}

          {sources.length > 0 && (

            <div className="ai-sources">

              <div className="sources-header">

                <div>
                  <span className="sources-icon">
                    📚
                  </span>

                  <div>
                    <h4>
                      Knowledge Base Sources
                    </h4>

                    <p>
                      Information used by the AI analysis
                    </p>
                  </div>
                </div>

                <span className="source-count">
                  {sources.length}
                  {" "}
                  {sources.length === 1
                    ? "source"
                    : "sources"}
                </span>

              </div>


              <div className="source-list">

                {sources.map(
                  (source, index) => {

                    if (
                      typeof source === "string"
                    ) {
                      return (
                        <div
                          className="source-card"
                          key={index}
                        >
                          <div className="source-file-icon">
                            📄
                          </div>

                          <div className="source-content">
                            <strong>
                              {source}
                            </strong>
                          </div>
                        </div>
                      );
                    }


                    return (
                      <div
                        className="source-card"
                        key={
                          source?.id ||
                          index
                        }
                      >

                        <div className="source-file-icon">
                          📄
                        </div>

                        <div className="source-content">

                          <div className="source-top">

                            <strong>
                              {source?.filename ||
                                "Unknown file"}
                            </strong>

                            {source?.page_number && (
                              <span className="source-page">
                                Page {source.page_number}
                              </span>
                            )}

                          </div>

                          {source?.content && (
                            <p>
                              {source.content}
                            </p>
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
              NO SOURCES
          ================================= */}

          {sources.length === 0 && (

            <div className="no-sources">

              <span className="no-sources-icon">
                ℹ️
              </span>

              <div>
                <strong>
                  No Knowledge Base sources
                </strong>

                <p>
                  No relevant knowledge base information
                  was used for this analysis.
                </p>
              </div>

            </div>

          )}

        </div>

      )}


      {/* =====================================
          ANALYSIS HISTORY
      ===================================== */}

      {Array.isArray(analysisHistory) &&
        analysisHistory.length > 0 && (

          <div className="analysis-history">

            <button
              type="button"
              className="history-toggle"
              onClick={() =>
                setShowHistory(
                  previous => !previous
                )
              }
            >

              <div className="history-toggle-left">

                <span className="history-icon">
                  ↻
                </span>

                <span>
                  AI Analysis History
                </span>

                <span className="history-count">
                  {analysisHistory.length}
                </span>

              </div>

              <span className="history-arrow">
                {showHistory ? "▲" : "▼"}
              </span>

            </button>


            {showHistory && (

              <div className="history-list">

                {analysisHistory.map(
                  (item, index) => {

                    const historySources =
                      Array.isArray(item?.sources)
                        ? item.sources
                        : [];

                    return (

                      <div
                        className="history-item"
                        key={
                          item?.id ||
                          `history-${index}`
                        }
                      >

                        {/* HISTORY HEADER */}

                        <div className="history-header">

                          <div className="history-title">

                            <strong>
                              Analysis #{index + 1}
                            </strong>

                            <span className="history-model">
                              {item?.model || "groq"}
                            </span>

                          </div>

                          {item?.created_at && (
                            <span className="history-date">
                              {new Date(
                                item.created_at
                              ).toLocaleString()}
                            </span>
                          )}

                        </div>


                        {/* METRICS */}

                        <div className="history-grid">

                          <div className="history-metric">
                            <small>
                              Category
                            </small>

                            <strong>
                              {item?.category || "N/A"}
                            </strong>
                          </div>

                          <div className="history-metric">
                            <small>
                              Sentiment
                            </small>

                            <strong>
                              {item?.sentiment || "N/A"}
                            </strong>
                          </div>

                          <div className="history-metric">
                            <small>
                              Priority
                            </small>

                            <strong>
                              {item?.priority || "N/A"}
                            </strong>
                          </div>

                        </div>


                        {/* SUMMARY */}

                        {item?.summary && (

                          <div className="history-section">

                            <h5>
                              Summary
                            </h5>

                            <p>
                              {item.summary}
                            </p>

                          </div>

                        )}


                        {/* SUGGESTED REPLY */}

                        {item?.suggested_reply && (

                          <div className="history-section">

                            <h5>
                              Suggested Reply
                            </h5>

                            <div className="history-reply">
                              {item.suggested_reply}
                            </div>

                          </div>

                        )}


                        {/* SOURCES */}

                        {historySources.length > 0 && (

                          <div className="history-sources">

                            <div className="history-sources-title">

                              <div>
                                <span>
                                  📚
                                </span>

                                <strong>
                                  Knowledge Base Sources
                                </strong>
                              </div>

                              <span className="history-source-count">
                                {historySources.length}
                              </span>

                            </div>


                            <div className="history-source-list">

                              {historySources.map(
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
                                        className="history-source"
                                        key={
                                          `source-${sourceIndex}`
                                        }
                                      >

                                        <span className="history-file-icon">
                                          📄
                                        </span>

                                        <strong>
                                          {source}
                                        </strong>

                                      </div>
                                    );
                                  }


                                  return (
                                    <div
                                      className="history-source"
                                      key={
                                        source?.id ||
                                        `source-${sourceIndex}`
                                      }
                                    >

                                      <span className="history-file-icon">
                                        📄
                                      </span>

                                      <div>

                                        <strong>
                                          {source?.filename ||
                                            "Unknown file"}
                                        </strong>

                                        {source?.page_number && (
                                          <small>
                                            Page{" "}
                                            {source.page_number}
                                          </small>
                                        )}

                                      </div>

                                    </div>
                                  );

                                }
                              )}

                            </div>

                          </div>

                        )}


                        {/* NO SOURCES */}

                        {historySources.length === 0 && (

                          <div className="history-no-sources">
                            ℹ️ No Knowledge Base sources
                            were used.
                          </div>

                        )}

                      </div>

                    );
                  }
                )}

              </div>

            )}

          </div>

        )}

    </article>
  );
}

export default TicketCard;