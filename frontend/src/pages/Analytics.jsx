import { useEffect, useState } from "react";

import { getAnalytics } from "../services/analyticsService";

import "../styles/analytics.css";


function formatLabel(value) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}


function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    loadAnalytics();
  }, []);


  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");

      const data = await getAnalytics();

      setAnalytics(data);
    } catch (err) {
      console.error("Failed to load analytics:", err);

      setError(
        err.message || "Failed to load analytics."
      );
    } finally {
      setLoading(false);
    }
  }


  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          Loading analytics...
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-error">
          <h2>Unable to load analytics</h2>
          <p>{error}</p>

          <button
            className="analytics-retry-button"
            onClick={loadAnalytics}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }


  if (!analytics) {
    return null;
  }


  const overview = analytics.overview || {};

  const categories =
    analytics.tickets_by_category || {};

  const priorities =
    analytics.tickets_by_priority || {};

  const statuses =
    analytics.tickets_by_status || {};

  const sentiments =
    analytics.sentiment_distribution || {};

  const escalation =
    analytics.escalation || {};


  return (
    <div className="analytics-page">

      {/* HEADER */}

      <div className="analytics-header">
        <div>
          <p className="analytics-eyebrow">
            SUPPORT INTELLIGENCE
          </p>

          <h1>Analytics</h1>

          <p className="analytics-subtitle">
            Monitor ticket volume, customer sentiment,
            priorities, resolution status, and AI
            assistance.
          </p>
        </div>

        <button
          className="analytics-refresh-button"
          onClick={loadAnalytics}
        >
          Refresh
        </button>
      </div>


      {/* KPI CARDS */}

      <section className="analytics-kpi-grid">

        <div className="analytics-kpi-card">
          <span className="analytics-kpi-label">
            Total Tickets
          </span>

          <strong>
            {overview.total_tickets || 0}
          </strong>
        </div>


        <div className="analytics-kpi-card">
          <span className="analytics-kpi-label">
            Open
          </span>

          <strong>
            {overview.open_tickets || 0}
          </strong>
        </div>


        <div className="analytics-kpi-card">
          <span className="analytics-kpi-label">
            In Progress
          </span>

          <strong>
            {overview.in_progress_tickets || 0}
          </strong>
        </div>


        <div className="analytics-kpi-card">
          <span className="analytics-kpi-label">
            Resolved
          </span>

          <strong>
            {overview.resolved_tickets || 0}
          </strong>
        </div>


        <div className="analytics-kpi-card">
          <span className="analytics-kpi-label">
            Escalated
          </span>

          <strong>
            {overview.escalated_tickets || 0}
          </strong>
        </div>


        <div className="analytics-kpi-card">
          <span className="analytics-kpi-label">
            High Priority
          </span>

          <strong>
            {overview.high_priority_tickets || 0}
          </strong>
        </div>


        <div className="analytics-kpi-card">
          <span className="analytics-kpi-label">
            Urgent
          </span>

          <strong>
            {overview.urgent_tickets || 0}
          </strong>
        </div>


        <div className="analytics-kpi-card">
          <span className="analytics-kpi-label">
            AI Assisted
          </span>

          <strong>
            {overview.ai_assisted_tickets || 0}
          </strong>
        </div>

      </section>


      {/* MAIN ANALYTICS */}

      <div className="analytics-grid">

        {/* CATEGORY */}

        <section className="analytics-card">

          <div className="analytics-card-header">
            <div>
              <h2>Tickets by Category</h2>
              <p>
                Distribution of AI-classified ticket categories.
              </p>
            </div>
          </div>

          <div className="analytics-bars">

            {Object.entries(categories).map(
              ([category, count]) => {

                const total =
                  overview.total_tickets || 1;

                const percentage =
                  Math.round((count / total) * 100);

                return (
                  <div
                    className="analytics-bar-row"
                    key={category}
                  >
                    <div className="analytics-bar-info">
                      <span>
                        {category}
                      </span>

                      <strong>
                        {count}
                      </strong>
                    </div>

                    <div className="analytics-bar-track">
                      <div
                        className="analytics-bar-fill"
                        style={{
                          width: `${percentage}%`
                        }}
                      />
                    </div>
                  </div>
                );
              }
            )}

          </div>

        </section>


        {/* PRIORITY */}

        <section className="analytics-card">

          <div className="analytics-card-header">
            <div>
              <h2>Tickets by Priority</h2>
              <p>
                Current ticket priority distribution.
              </p>
            </div>
          </div>

          <div className="analytics-stat-list">

            {Object.entries(priorities).map(
              ([priority, count]) => (
                <div
                  className="analytics-stat-row"
                  key={priority}
                >
                  <span>
                    {formatLabel(priority)}
                  </span>

                  <strong>
                    {count}
                  </strong>
                </div>
              )
            )}

          </div>

        </section>


        {/* SENTIMENT */}

        <section className="analytics-card">

          <div className="analytics-card-header">
            <div>
              <h2>Customer Sentiment</h2>
              <p>
                AI-detected sentiment across tickets.
              </p>
            </div>
          </div>

          <div className="analytics-stat-list">

            {Object.entries(sentiments).map(
              ([sentiment, count]) => (
                <div
                  className="analytics-stat-row"
                  key={sentiment}
                >
                  <span>
                    {sentiment}
                  </span>

                  <strong>
                    {count}
                  </strong>
                </div>
              )
            )}

          </div>

        </section>


        {/* STATUS */}

        <section className="analytics-card">

          <div className="analytics-card-header">
            <div>
              <h2>Resolution Status</h2>
              <p>
                Current status of support tickets.
              </p>
            </div>
          </div>

          <div className="analytics-stat-list">

            {Object.entries(statuses).map(
              ([status, count]) => (
                <div
                  className="analytics-stat-row"
                  key={status}
                >
                  <span>
                    {formatLabel(status)}
                  </span>

                  <strong>
                    {count}
                  </strong>
                </div>
              )
            )}

          </div>

        </section>


        {/* ESCALATION */}

        <section className="analytics-card analytics-wide-card">

          <div className="analytics-card-header">
            <div>
              <h2>Escalation Overview</h2>

              <p>
                AI-detected escalation requirements.
              </p>
            </div>
          </div>


          <div className="escalation-grid">

            <div className="escalation-stat">
              <span>
                Escalations Required
              </span>

              <strong>
                {escalation.escalation_required || 0}
              </strong>
            </div>


            <div className="escalation-stat">
              <span>
                AI Analyses
              </span>

              <strong>
                {escalation.total_ai_analyses || 0}
              </strong>
            </div>


            <div className="escalation-stat">
              <span>
                Escalation Rate
              </span>

              <strong>
                {escalation.escalation_rate || 0}%
              </strong>
            </div>

          </div>

        </section>

      </div>

    </div>
  );
}


export default Analytics;