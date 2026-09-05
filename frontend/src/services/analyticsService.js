import { API_URL, getAuthHeaders } from "./api";

export async function getAnalytics() {
  const response = await fetch(
    `${API_URL}/api/analytics`,
    {
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch analytics");
  }

  return response.json();
}