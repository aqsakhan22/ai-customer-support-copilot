
import { useState } from "react";

// import "../styles/ticket-card.css";


function TicketCard({
  ticket,
  onDelete,
  onStatusChange,
  onAnalyze,
  analyzing,
  aiResult,
  analysisHistory
}) {
console.log('aiResult',aiResult)
  const [showHistory, setShowHistory] =
    useState(false);


  const [showReply, setShowReply] =
    useState(true);


  // =========================================
  // HELPERS
  // =========================================

  function getPriorityClass(priority) {

    if (!priority) {
      return "priority-medium";
    }

    return (
      `priority-${priority
        .toLowerCase()}`
    );
  }


  function getStatusClass(status) {

    if (!status) {
      return "status-open";
    }

    return (
      `status-${status
        .toLowerCase()
        .replace("_", "-")}`
    );
  }


  function formatDate(date) {

    if (!date) {
      return "Unknown";
    }

    return new Date(date)
      .toLocaleString();
  }


  // =========================================
  // CURRENT AI ANALYSIS
  // =========================================

  const analysis =
    aiResult?.analysis;


  const sources =
    aiResult?.sources || [];


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
            Ticket #{ticket.id}
          </span>

          <h3>
            {ticket.subject}
          </h3>

        </div>


        <button
          className="delete-ticket-button"
          onClick={() =>
            onDelete(ticket.id)
          }
          title="Delete ticket"
        >
          🗑
        </button>

      </div>


      {/* =====================================
          BADGES
      ===================================== */}

      <div className="ticket-meta">

        <span
          className={`ticket-badge ${getStatusClass(
            ticket.status
          )}`}
        >
          {ticket.status}
        </span>


        <span
          className={`ticket-badge ${getPriorityClass(
            ticket.priority
          )}`}
        >
          {ticket.priority}
        </span>


        <span className="ticket-date">
          {formatDate(ticket.created_at)}
        </span>

      </div>


      {/* =====================================
          DESCRIPTION
      ===================================== */}

      <div className="ticket-description">

        <h4>
          Customer Description
        </h4>

        <p>
          {ticket.description}
        </p>

      </div>


      {/* =====================================
          STATUS
      ===================================== */}

      <div className="ticket-actions">

        <div className="status-control">

          <label htmlFor={`status-${ticket.id}`}>
            Status
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

            <option value="RESOLVED">
              Resolved
            </option>

            <option value="CLOSED">
              Closed
            </option>

          </select>

        </div>


        {/* AI BUTTON */}

        <button
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
              🤖 Analyze with AI
            </>
          )}

        </button>

      </div>


      {/* =====================================
          AI ANALYSIS
      ===================================== */}

     


      {/* =====================================
          ANALYSIS HISTORY
      ===================================== */}

      {analysisHistory &&
        analysisHistory.length > 0 && (

        <section className="analysis-history">

          <button
            className="history-toggle"
            onClick={() =>
              setShowHistory(
                !showHistory
              )
            }
          >

            <span>
              🕘 Analysis History
            </span>

            <span>
              {showHistory
                ? "▲"
                : "▼"}
            </span>

          </button>


          {showHistory && (

            <div className="history-list">

              {analysisHistory.map(
                (item) => (

                  <div
                    className="history-item"
                    key={item.id}
                  >

                    <div className="history-header">

                      <strong>
                        Analysis #{item.id}
                      </strong>

                      <span>
                        {formatDate(
                          item.created_at
                        )}
                      </span>

                    </div>


                    <div className="history-details">

                      <span>
                        Category:{" "}
                        <strong>
                          {item.category}
                        </strong>
                      </span>

                      <span>
                        Sentiment:{" "}
                        <strong>
                          {item.sentiment}
                        </strong>
                      </span>

                      <span>
                        Priority:{" "}
                        <strong>
                          {item.priority}
                        </strong>
                      </span>

                    </div>


                    {item.summary && (

                      <p>
                        {item.summary}
                      </p>

                    )}


                    {/* HISTORY SOURCES */}

                    {item.sources &&
                      item.sources.length > 0 && (

                      <div className="history-sources">

                        <span>
                          Sources:
                        </span>

                        {item.sources.map(
                          (source, index) => (

                            <span
                              className="source-tag small"
                              key={`${source}-${index}`}
                            >
                              📄 {source}
                            </span>

                          )
                        )}

                      </div>

                    )}

                  </div>

                )
              )}

            </div>

          )}

        </section>

      )}

    </article>

  );
}


export default TicketCard;

