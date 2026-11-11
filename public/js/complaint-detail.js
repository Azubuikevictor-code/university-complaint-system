async function loadStudentDetail() {
  const container = document.querySelector("#studentComplaintDetail");
  if (!container) return;
  const allowed = await requireRole("student");
  if (!allowed) return;

  const complaintId = new URLSearchParams(window.location.search).get("id");
  try {
    const data = await apiRequest(`/api/complaints/student/${complaintId}`);
    const complaint = data.complaint;
    container.innerHTML = `
      <p><strong>Reference:</strong> ${escapeHtml(complaint.referenceNumber)}</p>
      <p><strong>Category:</strong> ${escapeHtml(complaint.category)}</p>
      <p><strong>Status:</strong> ${statusBadge(complaint.status)}</p>
      <p><strong>Priority:</strong> ${escapeHtml(complaint.priority)}</p>
      <h2>${escapeHtml(complaint.subject)}</h2>
      <p>${escapeHtml(complaint.description)}</p>
      <h3>Administrative Responses</h3>
      ${complaint.responses?.length ? complaint.responses.map((item) => `<article class="card"><p>${escapeHtml(item.message)}</p><small>${escapeHtml(item.respondedBy?.fullName || "Administrator")}</small></article>`).join("") : '<p class="empty-state">No administrative response yet.</p>'}
      <h3>Status History</h3>
      ${complaint.statusHistory?.length ? "<ul>" + complaint.statusHistory.map((item) => `<li>${escapeHtml(item.previousStatus || "No previous status")} to ${escapeHtml(item.newStatus)} - ${new Date(item.changedAt).toLocaleString()}</li>`).join("") + "</ul>" : '<p class="empty-state">No status changes yet.</p>'}
    `;
  } catch (error) {
    showAlert(document.querySelector("#studentDetailAlert"), error.message);
  }
}

async function loadAdminDetail() {
  const container = document.querySelector("#adminComplaintDetail");
  if (!container) return;
  const allowed = await requireRole("admin");
  if (!allowed) return;

  const complaintId = new URLSearchParams(window.location.search).get("id");
  try {
    const data = await apiRequest(`/api/complaints/admin/${complaintId}`);
    const complaint = data.complaint;
    container.innerHTML = `
      <p><strong>Reference:</strong> ${escapeHtml(complaint.referenceNumber)}</p>
      <p><strong>Student:</strong> ${escapeHtml(complaint.student?.fullName)} (${escapeHtml(complaint.student?.matriculationNumber)})</p>
      <p><strong>Email:</strong> ${escapeHtml(complaint.student?.email)}</p>
      <p><strong>Category:</strong> ${escapeHtml(complaint.category)}</p>
      <h2>${escapeHtml(complaint.subject)}</h2>
      <p>${escapeHtml(complaint.description)}</p>
      <h3>Administrative Responses</h3>
      ${complaint.responses?.length ? complaint.responses.map((item) => `<article class="card"><p>${escapeHtml(item.message)}</p><small>${escapeHtml(item.respondedBy?.fullName || "Administrator")}</small></article>`).join("") : '<p class="empty-state">No response has been added.</p>'}
    `;

    document.querySelector("#updateStatus").value = complaint.status;
    document.querySelector("#updatePriority").value = complaint.priority;
    document.querySelector("#adminComplaintForm").dataset.complaintId =
      complaint._id;
  } catch (error) {
    showAlert(document.querySelector("#adminDetailAlert"), error.message);
  }
}

const adminForm = document.querySelector("#adminComplaintForm");
adminForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button[type='submit']");
  const values = Object.fromEntries(new FormData(event.currentTarget));
  button.disabled = true;
  button.textContent = "Saving...";

  try {
    const complaintId = event.currentTarget.dataset.complaintId;
    const data = await apiRequest(`/api/complaints/admin/${complaintId}`, {
      method: "PATCH",
      body: JSON.stringify(values),
    });
    showAlert(
      document.querySelector("#adminDetailAlert"),
      data.message,
      "success",
    );
    document.querySelector("#adminResponse").value = "";
    window.location.reload();
  } catch (error) {
    showAlert(document.querySelector("#adminDetailAlert"), error.message);
    button.disabled = false;
    button.textContent = "Save Update";
  }
});

loadStudentDetail();
loadAdminDetail();
renderIcons();
