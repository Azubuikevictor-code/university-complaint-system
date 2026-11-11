async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    credentials: "same-origin",
    ...options,
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: "The server returned an invalid response",
  }));

  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

function showAlert(container, message, type = "error") {
  if (!container) return;
  container.className = `alert alert-${type}`;
  container.textContent = message;
  container.hidden = false;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function statusBadge(status) {
  return `<span class="status status-${String(status).toLowerCase().replaceAll(" ", "-")}">${escapeHtml(status)}</span>`;
}
