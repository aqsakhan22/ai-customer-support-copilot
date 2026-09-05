const API_URL = "http://127.0.0.1:8000";

function getAuthHeaders() {

  const token = localStorage.getItem(
    "access_token"
  );

  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}
// ==================================================
// Helper: get token
// ==================================================

function getToken() {

    return localStorage.getItem(
        "access_token"
    );
}


// ==================================================
// Analyze ticket
// ==================================================

export async function analyzeTicket(
    ticketId
) {

    const token = getToken();

    const response = await fetch(
        `${API_URL}/api/tickets/${ticketId}/analyze`,
        {
            method: "POST",

            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.detail ||
            "AI analysis failed"
        );
    }


    return data;
}


// ==================================================
// Get analysis history
// ==================================================

export async function getAnalysisHistory(
    ticketId
) {

    const token = getToken();


    const response = await fetch(
        `${API_URL}/api/tickets/${ticketId}/analyses`,
        {
            method: "GET",

            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.detail ||
            "Failed to load analysis history"
        );
    }


    return data;
}


// ==================================================
// AI Chat
// ==================================================

export async function chatWithKnowledgeBase(question) {

    const token =
        localStorage.getItem("access_token");


    const response = await fetch(
        "http://127.0.0.1:8000/api/ai/chat",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",

                "Authorization":
                    `Bearer ${token}`
            },

            body: JSON.stringify({
                question
            })
        }
    );


    let data = {};

    try {

        data = await response.json();

    } catch (error) {

        throw new Error(
            "Server returned an invalid response."
        );

    }


    if (!response.ok) {

        throw new Error(
            data?.detail ||
            "Unable to get AI response."
        );

    }


    return data;
}


export async function generateTicketReply(ticketId) {
  const response = await fetch(
    `${API_URL}/api/tickets/${ticketId}/generate-reply`,
    {
      method: "POST",
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate reply");
  }

  return response.json();
}

// ==================================================
// AI summarizeTicket
// ==================================================

export async function summarizeTicket(ticketId) {
  const response = await fetch(
    `${API_URL}/api/tickets/${ticketId}/summarize`,
    {
      method: "POST",
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error("Failed to summarize conversation");
  }

  return response.json();
}

// RECCOMMENDED ACTION TAKEN
export async function recommendTicketAction(ticketId) {
  const response = await fetch(
    `${API_URL}/api/tickets/${ticketId}/recommend-action`,
    {
      method: "POST",
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error("Failed to recommend next action");
  }

  return response.json();
}


// AI stream Ticket Reply 
export async function streamTicketReply(ticketId, onChunk) {
  const response = await fetch(
    `${API_URL}/api/tickets/${ticketId}/stream-reply`,
    {
      method: "POST",
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error("Failed to stream reply");
  }

  if (!response.body) {
    throw new Error("Streaming is not supported by this browser");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let done = false;

  while (!done) {
    const result = await reader.read();

    done = result.done;

    if (result.value) {
      const chunk = decoder.decode(
        result.value,
        { stream: !done }
      );

      onChunk(chunk);
    }
  }
}