import { useEffect, useMemo, useState } from "react";
import { getTickets } from "../services/ticketService";
import "../styles/dashboard.css";

function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const data = await getTickets();

      setTickets(data || []);
    } catch (error) {
      console.error(
        "Failed to load dashboard:",
        error
      );

      setError(
        error.message ||
        "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }


const statistics = useMemo(() => {
  const total = tickets.length;

  const open = tickets.filter(
    ticket => ticket.status === "OPEN"
  ).length;

  const inProgress = tickets.filter(
    ticket => ticket.status === "IN_PROGRESS"
  ).length;

  const waiting = tickets.filter(
    ticket => ticket.status === "WAITING_FOR_CUSTOMER"
  ).length;

  const resolved = tickets.filter(
    ticket =>
      ticket.status === "RESOLVED" ||
      ticket.status === "CLOSED"
  ).length;

  const escalated = tickets.filter(
    ticket => ticket.status === "ESCALATED"
  ).length;

  const highPriority = tickets.filter(
    ticket =>
      ticket.priority === "HIGH" ||
      ticket.priority === "URGENT"
  ).length;

  const urgent = tickets.filter(
    ticket => ticket.priority === "URGENT"
  ).length;

  const aiAnalyzed = tickets.filter(
    ticket => ticket.ai_category || ticket.ai_summary
  ).length;

  return {
    total,
    open,
    inProgress,
    waiting,
    resolved,
    escalated,
    highPriority,
    urgent,
    aiAnalyzed
  };
}, [tickets]);


  const recentTickets = useMemo(() => {
    return [...tickets]
      .sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      )
      .slice(0, 5);
  }, [tickets]);

 function getStatusLabel(status) {
  switch (status) {
    case "OPEN":
      return "Open";

    case "IN_PROGRESS":
      return "In Progress";

    case "WAITING_FOR_CUSTOMER":
      return "Waiting for Customer";

    case "ESCALATED":
      return "Escalated";

    case "RESOLVED":
      return "Resolved";

    case "CLOSED":
      return "Closed";

    default:
      return status || "Unknown";
  }
}

  function getPriorityLabel(priority) {
    switch (priority) {
      case "LOW":
        return "Low";

      case "MEDIUM":
        return "Medium";

      case "HIGH":
        return "High";

      case "URGENT":
        return "Urgent";

      default:
        return priority || "Unknown";
    }
  }

  function formatDate(date) {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      undefined,
      {
        month: "short",
        day: "numeric",
        year: "numeric"
      }
    );
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <span className="dashboard-spinner"></span>
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* =========================
          HEADER
      ========================== */}

      <div className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            SUPPORT OVERVIEW
          </span>

          <h1>Dashboard</h1>

          <p>
            Monitor your customer support
            activity and ticket workload.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-refresh"
          onClick={loadDashboard}
        >
          <span>↻</span>
          Refresh
        </button>
      </div>

      {/* =========================
          ERROR
      ========================== */}

      {error && (
        <div
          className="dashboard-error"
          role="alert"
        >
          <span>!</span>
          {error}
        </div>
      )}

      {/* =========================
          STATISTICS
      ========================== */}

      <div className="dashboard-stats">
        

        <div className="dashboard-stat-card">
          <div className="stat-icon">
            🎫
          </div>

          <div className="stat-content">
            <span>Total Tickets</span>
            <strong>
              {statistics.total}
            </strong>
            <small>
              All support tickets
            </small>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon">
            📂
          </div>

          <div className="stat-content">
            <span>Open Tickets</span>
            <strong>
              {statistics.open}
            </strong>
            <small>
              Awaiting resolution
            </small>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon">
            ⚙️
          </div>

          <div className="stat-content">
            <span>In Progress</span>
            <strong>
              {statistics.inProgress}
            </strong>
            <small>
              Currently being handled
            </small>
          </div>

          
        </div>
        <div className="dashboard-stat-card">
  <div className="stat-icon">
    ⏳
  </div>

  <div className="stat-content">
    <span>Waiting for Customer</span>
    <strong>
      {statistics.waiting}
    </strong>
    <small>
      Awaiting customer response
    </small>
  </div>
</div>

<div className="dashboard-stat-card">
  <div className="stat-icon">
    🚨
  </div>

  <div className="stat-content">
    <span>Escalated</span>
    <strong>
      {statistics.escalated}
    </strong>
    <small>
      Require escalation
    </small>
  </div>
</div>

        <div className="dashboard-stat-card">
          <div className="stat-icon">
            ✓
          </div>

          <div className="stat-content">
            <span>Resolved</span>
            <strong>
              {statistics.resolved}
            </strong>
            <small>
              Successfully resolved
            </small>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon">
            🔥
          </div>

          <div className="stat-content">
            <span>High Priority</span>
            <strong>
              {statistics.highPriority}
            </strong>
            <small>
              High or urgent tickets
            </small>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon">
            🚨
          </div>

          <div className="stat-content">
            <span>Urgent</span>
            <strong>
              {statistics.urgent}
            </strong>
            <small>
              Require immediate attention
            </small>
          </div>
        </div>

      </div>

      {/* =========================
          RECENT TICKETS
      ========================== */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">
          <div>
            <span className="dashboard-section-eyebrow">
              ACTIVITY
            </span>

            <h2>Recent Tickets</h2>

            <p>
              Your latest customer support
              tickets.
            </p>
          </div>
        </div>

        {recentTickets.length === 0 ? (
          <div className="dashboard-empty">
            <div className="dashboard-empty-icon">
              🎫
            </div>

            <h3>No tickets yet</h3>

            <p>
              Create your first ticket to
              start using SupportAI.
            </p>
          </div>
        ) : (
          <div className="recent-ticket-list">

            {recentTickets.map(ticket => (
              <div
                className="recent-ticket"
                key={ticket.id}
              >

                <div className="recent-ticket-main">

                  <div className="recent-ticket-id">
                    #{ticket.id}
                  </div>

                  <div>
                    <h3>
                      {ticket.subject}
                    </h3>

                    <p>
                      {ticket.description}
                    </p>
                  </div>

                </div>

                <div className="recent-ticket-meta">

                  <span
                    className={`dashboard-status status-${(
                      ticket.status ||
                      ""
                    ).toLowerCase()}`}
                  >
                    {getStatusLabel(
                      ticket.status
                    )}
                  </span>

                  <span
                    className={`dashboard-priority priority-${(
                      ticket.priority ||
                      ""
                    ).toLowerCase()}`}
                  >
                    {getPriorityLabel(
                      ticket.priority
                    )}
                  </span>

                  <span className="recent-ticket-date">
                    {formatDate(
                      ticket.created_at
                    )}
                  </span>

                </div>

              </div>
            ))}

          </div>
        )}

      </section>

    </div>
  );
}

export default Dashboard;