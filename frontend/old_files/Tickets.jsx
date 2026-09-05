
import { useEffect, useState } from "react";

import TicketCard from "../components/TicketCard";

import {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket
} from "../services/ticketService";

import {
  analyzeTicket,
  getAnalysisHistory
} from "../services/aiService";

import "../styles/tickets.css";


function Tickets() {

  // =========================================
  // STATE
  // =========================================

  const [tickets, setTickets] = useState([]);

  const [subject, setSubject] = useState("");

  const [description, setDescription] =
    useState("");

  const [priority, setPriority] =
    useState("MEDIUM");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [analyzingTicketId, setAnalyzingTicketId] =
    useState(null);

  const [aiResults, setAiResults] =
    useState({});

  const [analysisHistories, setAnalysisHistories] =
    useState({});


  // =========================================
  // LOAD ANALYSIS HISTORY
  // =========================================

  async function loadAnalysisHistory(ticketId) {

    try {

      const data =
        await getAnalysisHistory(ticketId);

      setAnalysisHistories(previous => ({
        ...previous,
        [ticketId]: data
      }));

    } catch (error) {

      console.error(
        `Failed to load analysis history for ticket ${ticketId}:`,
        error
      );

    }
  }


  // =========================================
  // LOAD TICKETS
  // =========================================

  async function loadTickets() {

    try {

      setError("");

      const data = await getTickets();

      setTickets(data);


      // Load analysis history
      // for all tickets

      await Promise.all(
        data.map(ticket =>
          loadAnalysisHistory(ticket.id)
        )
      );

    } catch (error) {

      console.error(
        "Failed to load tickets:",
        error
      );

      setError(
        error.message ||
        "Failed to load tickets."
      );

    }
  }


  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {

    loadTickets();

  }, []);


  // =========================================
  // CREATE TICKET
  // =========================================

  async function handleCreateTicket(event) {

    event.preventDefault();

    setError("");
    setMessage("");


    if (
      !subject.trim() ||
      !description.trim()
    ) {

      setError(
        "Subject and description are required."
      );

      return;
    }


    try {

      setLoading(true);


      await createTicket({

        subject:
          subject.trim(),

        description:
          description.trim(),

        priority

      });


      // Clear form

      setSubject("");

      setDescription("");

      setPriority("MEDIUM");


      setMessage(
        "Ticket created successfully."
      );


      await loadTickets();

    } catch (error) {

      console.error(
        "Failed to create ticket:",
        error
      );

      setError(
        error.message ||
        "Failed to create ticket."
      );

    } finally {

      setLoading(false);

    }
  }


  // =========================================
  // DELETE TICKET
  // =========================================

  async function handleDelete(ticketId) {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this ticket?"
      );


    if (!confirmed) {
      return;
    }


    try {

      setError("");
      setMessage("");


      await deleteTicket(ticketId);


      // Remove ticket from UI immediately

      setTickets(previous =>
        previous.filter(
          ticket => ticket.id !== ticketId
        )
      );


      // Remove AI data

      setAiResults(previous => {

        const updated = {
          ...previous
        };

        delete updated[ticketId];

        return updated;
      });


      setAnalysisHistories(previous => {

        const updated = {
          ...previous
        };

        delete updated[ticketId];

        return updated;
      });


      setMessage(
        "Ticket deleted successfully."
      );

    } catch (error) {

      console.error(
        "Failed to delete ticket:",
        error
      );

      setError(
        error.message ||
        "Failed to delete ticket."
      );
    }
  }


  // =========================================
  // UPDATE STATUS
  // =========================================

  async function handleStatusChange(
    ticketId,
    status
  ) {

    try {

      setError("");
      setMessage("");


      const updatedTicket =
        await updateTicket(
          ticketId,
          {
            status
          }
        );


      // Update UI without full reload

      setTickets(previous =>
        previous.map(ticket =>
          ticket.id === ticketId
            ? updatedTicket
            : ticket
        )
      );


      setMessage(
        "Ticket status updated."
      );

    } catch (error) {

      console.error(
        "Failed to update ticket:",
        error
      );

      setError(
        error.message ||
        "Failed to update ticket."
      );
    }
  }


  // =========================================
  // ANALYZE TICKET
  // =========================================

  async function handleAnalyze(ticketId) {

    try {

      setError("");
      setMessage("");


      setAnalyzingTicketId(
        ticketId
      );


      console.log(
        `Analyzing ticket ${ticketId}...`
      );


      const result =
        await analyzeTicket(
          ticketId
        );


      console.log(
        "AI analysis result:",
        result
      );


      // IMPORTANT:
      // Store entire response.
      //
      // This keeps:
      // result.analysis
      // result.sources

      setAiResults(previous => ({
        ...previous,
        [ticketId]: result
      }));


      // Reload history

      await loadAnalysisHistory(
        ticketId
      );


      setMessage(
        "AI analysis completed successfully."
      );

    } catch (error) {

      console.error(
        "AI analysis failed:",
        error
      );

      setError(
        error.message ||
        "AI analysis failed."
      );

    } finally {

      setAnalyzingTicketId(
        null
      );
    }
  }


  // =========================================
  // LOGOUT
  // =========================================

  function handleLogout() {

    localStorage.removeItem(
      "access_token"
    );

    window.location.reload();

  }


  // =========================================
  // UI
  // =========================================

  return (

    <div className="tickets-page">


      {/* =====================================
          HEADER
      ===================================== */}

      <header className="tickets-header">

        <div>

          <span className="page-eyebrow">
            AI CUSTOMER SUPPORT
          </span>

          <h1>
            Customer Tickets
          </h1>

          <p>
            Manage support tickets and analyze
            customer issues with AI.
          </p>

        </div>


        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </header>


      {/* =====================================
          ERROR
      ===================================== */}

      {error && (

        <div className="alert alert-error">

          <span>
            ⚠️
          </span>

          <span>
            {error}
          </span>

        </div>

      )}


      {/* =====================================
          SUCCESS
      ===================================== */}

      {message && (

        <div className="alert alert-success">

          <span>
            ✓
          </span>

          <span>
            {message}
          </span>

        </div>

      )}


      {/* =====================================
          CREATE TICKET
      ===================================== */}

      <section className="create-ticket-card">

        <div className="section-heading">

          <div>

            <span className="section-icon">
              +
            </span>

            <div>

              <h2>
                Create New Ticket
              </h2>

              <p>
                Submit a new customer support issue.
              </p>

            </div>

          </div>

        </div>


        <form
          className="ticket-form"
          onSubmit={handleCreateTicket}
        >


          {/* SUBJECT */}

          <div className="form-group">

            <label htmlFor="subject">
              Subject
            </label>

            <input
              id="subject"
              type="text"
              value={subject}
              onChange={event =>
                setSubject(
                  event.target.value
                )
              }
              placeholder="e.g. Charged twice for subscription"
              required
            />

          </div>


          {/* DESCRIPTION */}

          <div className="form-group">

            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={event =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Describe the customer's issue..."
              rows="5"
              required
            />

          </div>


          {/* PRIORITY */}

          <div className="form-group">

            <label htmlFor="priority">
              Priority
            </label>

            <select
              id="priority"
              value={priority}
              onChange={event =>
                setPriority(
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


          <button
            type="submit"
            className="create-ticket-button"
            disabled={loading}
          >

            {loading
              ? "Creating..."
              : "Create Ticket"
            }

          </button>

        </form>

      </section>


      {/* =====================================
          TICKETS
      ===================================== */}

      <section className="tickets-section">

        <div className="tickets-section-header">

          <div>

            <h2>
              Tickets
            </h2>

            <p>
              {tickets.length}{" "}
              {tickets.length === 1
                ? "ticket"
                : "tickets"}{" "}
              in your workspace
            </p>

          </div>


          <button
            className="refresh-button"
            onClick={loadTickets}
          >
            ↻ Refresh
          </button>

        </div>


        {/* EMPTY STATE */}

        {tickets.length === 0 ? (

          <div className="empty-tickets">

            <div className="empty-icon">
              🎫
            </div>

            <h3>
              No tickets yet
            </h3>

            <p>
              Create your first support ticket
              using the form above.
            </p>

          </div>

        ) : (

          <div className="ticket-list">

            {tickets.map(ticket => (

              <TicketCard

                key={ticket.id}

                ticket={ticket}

                onDelete={
                  handleDelete
                }

                onStatusChange={
                  handleStatusChange
                }

                onAnalyze={
                  handleAnalyze
                }

                analyzing={
                  analyzingTicketId ===
                  ticket.id
                }

                aiResult={
                  aiResults[
                    ticket.id
                  ]
                }

                analysisHistory={
                  analysisHistories[
                    ticket.id
                  ] || []
                }

              />

            ))}

          </div>

        )}

      </section>

    </div>

  );
}


export default Tickets;

