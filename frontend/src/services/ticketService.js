import { API_URL, getAuthHeaders } from './api'

export async function getTickets() {

  const response = await fetch(
    `${API_URL}/api/tickets/`,
    {
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch tickets");
  }

  return response.json();
}

export async function getTicket(ticketId) {
  const response = await fetch(
    `${API_URL}/api/tickets/${ticketId}`,
    {
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch ticket"
    );
  }

  return response.json();
}

export async function createTicket(ticket) {

  const response = await fetch(
    `${API_URL}/api/tickets/`,
    {
      method: "POST",

      headers: getAuthHeaders(),

      body: JSON.stringify(ticket)
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create ticket");
  }

  return response.json();
}


export async function updateTicket(
  ticketId,
  ticketData
) {

  const response = await fetch(
    `${API_URL}/api/tickets/${ticketId}`,
    {
      method: "PATCH",

      headers: getAuthHeaders(),

      body: JSON.stringify(ticketData)
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update ticket");
  }

  return response.json();
}


export async function deleteTicket(ticketId) {

  const response = await fetch(
    `${API_URL}/api/tickets/${ticketId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),

    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete ticket");
  }

  return response.json();
}



export async function getTicketMessages(ticketId) {
  const response = await fetch(
    `${API_URL}/api/tickets/${ticketId}/messages`,
    {
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch ticket messages");
  }

  return response.json();
}


export async function createTicketMessage(ticketId, messageData) {
  const response = await fetch(
    `${API_URL}/api/tickets/${ticketId}/messages`,
    {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(messageData)
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create ticket message");
  }

  return response.json();
}


export async function deleteTicketMessage(ticketId, messageId) {
  const response = await fetch(
    `${API_URL}/api/tickets/${ticketId}/messages/${messageId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete ticket message");
  }

  return response.json();
}


// EXCLATE TICKET FEATURE
export async function escalateTicket(ticketId) {
  const response = await fetch(
    `${API_URL}/api/tickets/${ticketId}/escalate`,
    {
      method: "PATCH",
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error("Failed to escalate ticket");
  }

  return response.json();
}

export async function resolveTicket(ticketId) {
  const response = await fetch(
    `${API_URL}/api/tickets/${ticketId}/resolve`,
    {
      method: "PATCH",
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error("Failed to resolve ticket");
  }

  return response.json();
}