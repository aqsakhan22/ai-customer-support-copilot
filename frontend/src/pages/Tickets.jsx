
import { useEffect, useState,useMemo } from "react";

import TicketCard from "../components/TicketCard";
import { useNavigate } from "react-router-dom";

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


const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("ALL");
const [priorityFilter, setPriorityFilter] = useState("ALL");

// NAVIGATE

const navigate = useNavigate();

  // // =========================================
  // // LOAD ANALYSIS HISTORY
  // // =========================================

  // async function loadAnalysisHistory(ticketId) {

  //   try {

  //     const data =
  //       await getAnalysisHistory(ticketId);

  //     setAnalysisHistories(previous => ({
  //       ...previous,
  //       [ticketId]: data
  //     }));

  //   } catch (error) {

  //     console.error(
  //       `Failed to load analysis history for ticket ${ticketId}:`,
  //       error
  //     );

  //   }
  // }


  // =========================================
  // LOAD TICKETS
  // =========================================

 async function loadTickets() {

    try {

        const data = await getTickets();

        setTickets(data);


        // ==========================================
        // Load analysis history for each ticket
        // ==========================================

        for (const ticket of data) {

            try {

                const history =
                    await getAnalysisHistory(
                        ticket.id
                    );


                const safeHistory =
                    Array.isArray(history)
                        ? history
                        : [];


                setAnalysisHistories(
                    previous => ({
                        ...previous,

                        [ticket.id]:
                            safeHistory
                    })
                );


                // ======================================
                // Set latest analysis
                // ======================================

                if (
                    safeHistory.length > 0
                ) {

                    const latest =
                        safeHistory[0];


                    setAiResults(
                        previous => ({
                            ...previous,

                            [ticket.id]: {

                                analysis: {

                                    category:
                                        latest.category,

                                    sentiment:
                                        latest.sentiment,

                                    priority:
                                        latest.priority,

                                    summary:
                                        latest.summary,

                                    suggested_reply:
                                        latest.suggested_reply
                                },

                                sources:
                                    Array.isArray(
                                        latest.sources
                                    )
                                        ? latest.sources
                                        : []
                            }
                        })
                    );

                }

            } catch (historyError) {

                console.error(
                    `Failed to load analysis history for ticket ${ticket.id}:`,
                    historyError
                );


                // Important:
                // Don't crash the entire Tickets page
                setAnalysisHistories(
                    previous => ({
                        ...previous,

                        [ticket.id]: []
                    })
                );

            }

        }

    } catch (error) {

        console.error(
            "Failed to load tickets:",
            error
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
  // ANALYZE TICKET
  // =========================================
async function handleAnalyze(ticketId) {

    try {

        setAnalyzingTicketId(ticketId);


        // ==========================================
        // Run AI analysis
        // ==========================================

        const result =
            await analyzeTicket(ticketId);


        // ==========================================
        // Save latest analysis
        // ==========================================

        setAiResults(previous => ({

            ...previous,

            [ticketId]: {

                analysis:
                    result?.analysis || null,

                sources:
                    Array.isArray(
                        result?.sources
                    )
                        ? result.sources
                        : []

            }

        }));


        // ==========================================
        // Load analysis history
        // ==========================================

        const history =
            await getAnalysisHistory(
                ticketId
            );


        setAnalysisHistories(previous => ({

            ...previous,

            [ticketId]:
                Array.isArray(history)
                    ? history
                    : []

        }));


    } catch (error) {

        console.error(
            "AI analysis failed:",
            error
        );

        alert(
            error.message ||
            "AI analysis failed."
        );

    } finally {

        setAnalyzingTicketId(null);

    }

}

const ticketStats = useMemo(() => {
  return {
    total: tickets.length,

    open: tickets.filter(
      ticket => ticket.status === "OPEN"
    ).length,

    inProgress: tickets.filter(
      ticket => ticket.status === "IN_PROGRESS"
    ).length,

    waiting: tickets.filter(
      ticket =>
        ticket.status ===
        "WAITING_FOR_CUSTOMER"
    ).length,

    escalated: tickets.filter(
      ticket => ticket.status === "ESCALATED"
    ).length,

    resolved: tickets.filter(
      ticket =>
        ticket.status === "RESOLVED" ||
        ticket.status === "CLOSED"
    ).length
  };
}, [tickets]);

const filteredTickets = useMemo(() => {
  const search = searchTerm.trim().toLowerCase();

  return tickets.filter(ticket => {
    const matchesSearch =
      !search ||
      ticket.subject?.toLowerCase().includes(search) ||
      ticket.description?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "ALL" ||
      ticket.status === statusFilter;

    const matchesPriority =
      priorityFilter === "ALL" ||
      ticket.priority === priorityFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority
    );
  });
}, [
  tickets,
  searchTerm,
  statusFilter,
  priorityFilter
]);

// =========================================
// UPDATE PRIORITY
// =========================================

async function handlePriorityChange(
  ticketId,
  priority
) {
  try {
    setError("");
    setMessage("");

    const updatedTicket =
      await updateTicket(
        ticketId,
        {
          priority
        }
      );

    setTickets(previous =>
      previous.map(ticket =>
        ticket.id === ticketId
          ? updatedTicket
          : ticket
      )
    );

    setMessage(
      "Ticket priority updated."
    );

  } catch (error) {
    console.error(
      "Failed to update ticket priority:",
      error
    );

    setError(
      error.message ||
      "Failed to update ticket priority."
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
  // UI
  // =========================================

  return (

    <div className="tickets-page">


      {/* =====================================
          HEADER
      ===================================== */}

      <div className="tickets-header">

    <div>

        <span className="page-eyebrow">
            CUSTOMER SUPPORT
        </span>

        <h1>
            Customer Tickets
        </h1>

        <p>
            Manage customer requests and use AI
            to assist your support workflow.
        </p>

    </div>

</div>


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
         Add the statistics cards
      ===================================== */}
<div className="ticket-statistics">

  <div className="ticket-stat-card">
    <div className="stat-icon">
      🎫
    </div>

    <div>
      <span>Total Tickets</span>
      <strong>{ticketStats.total}</strong>
    </div>
  </div>

  <div className="ticket-stat-card">
    <div className="stat-icon">
      🟢
    </div>

    <div>
      <span>Open</span>
      <strong>{ticketStats.open}</strong>
    </div>
  </div>

  <div className="ticket-stat-card">
    <div className="stat-icon">
      🔵
    </div>

    <div>
      <span>In Progress</span>
      <strong>{ticketStats.inProgress}</strong>
    </div>
  </div>

  <div className="ticket-stat-card">
    <div className="stat-icon">
      ✓
    </div>

    <div>
      <span>Resolved</span>
      <strong>{ticketStats.resolved}</strong>
    </div>
  </div>

</div>
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


    
   
<div className="tickets-toolbar">

  <div className="ticket-search">
    <span>⌕</span>

    <input
      type="text"
      placeholder="Search tickets..."
      value={searchTerm}
      onChange={event =>
        setSearchTerm(event.target.value)
      }
    />
  </div>

  <select
  value={statusFilter}
  onChange={event =>
    setStatusFilter(event.target.value)
  }
>
  <option value="ALL">
    All Statuses
  </option>

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

  <select
    value={priorityFilter}
    onChange={event =>
      setPriorityFilter(event.target.value)
    }
  >
    <option value="ALL">
      All Priorities
    </option>

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

  {(searchTerm ||
    statusFilter !== "ALL" ||
    priorityFilter !== "ALL") && (

    <button
      type="button"
      className="clear-filters-button"
      onClick={() => {
        setSearchTerm("");
        setStatusFilter("ALL");
        setPriorityFilter("ALL");
      }}
    >
      Clear
    </button>

  )}

</div>

<div className="tickets-results-info">
  Showing {filteredTickets.length} of {tickets.length} tickets
</div>
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

  filteredTickets.length === 0 ? (

    <div className="empty-tickets">

      <div className="empty-icon">
        🔍
      </div>

      <h3>
        No matching tickets
      </h3>

      <p>
        Try changing your search or filters.
      </p>

    </div>

  ) : (

    <div className="ticket-list">

      {filteredTickets.map(ticket => (
        <TicketCard
  key={ticket.id}
  ticket={ticket}
  onOpen={() =>
    navigate(`/tickets/${ticket.id}`)
  }
  onDelete={handleDelete}
  onStatusChange={handleStatusChange}
  onPriorityChange={handlePriorityChange}
  onAnalyze={handleAnalyze}
  analyzing={
    analyzingTicketId === ticket.id
  }
  aiResult={
    aiResults[ticket.id]
  }
  analysisHistory={
    analysisHistories[ticket.id] || []
  }
/>

        // <TicketCard
        //   key={ticket.id}
        //   ticket={ticket}
        //   onDelete={handleDelete}
        //   onStatusChange={handleStatusChange}
        //   onAnalyze={handleAnalyze}
        //   analyzing={
        //     analyzingTicketId === ticket.id
        //   }
        //   aiResult={
        //     aiResults[ticket.id]
        //   }
        //   analysisHistory={
        //     analysisHistories[ticket.id] || []
        //   }
        // />

      ))}

    </div>

  )

)}

      </section>

    </div>

  );
}


export default Tickets;

