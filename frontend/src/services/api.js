// export const API_URL = "http://127.0.0.1:8000";
export const API_URL = import.meta.env.VITE_API_URL;

export function getAuthHeaders() {

  const token = localStorage.getItem(
    "access_token"
  );

  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}
export async function checkBackend() {
  const response = await fetch(`${API_URL}/api/health`);

  if (!response.ok) {
    throw new Error("Backend request failed");
  }

  return response.json();
}