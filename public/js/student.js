async function loadStudentDashboard() {
  const pageHasStats = document.querySelector("#studentStats");
  if (!pageHasStats) return;
  const allowed = await requireRole("student");
  if (!allowed) return;

  try {
    const data = await apiRequest("/api/complaints/student/dashboard");
    pageHasStats.innerHTML = `
      <article class="card stat-card"><strong>${data.statistics.total}</strong>Total complaints</article>
      <article class="card stat-card"><strong>${data.statistics.active}</strong>Active complaints</article>
      <article class="card stat-card"><strong>${data.statistics.resolved}</strong>Resolved</article>
    `;

    document.querySelector("#recentComplaints").innerHTML = data
      .recentComplaints.length
      ? data.recentComplaints
          .map(
            (complaint) =>
              `<tr><td>${escapeHtml(complaint.referenceNumber)}</td><td>${escapeHtml(complaint.subject)}</td><td>${statusBadge(complaint.status)}</td><td>${new Date(complaint.createdAt).toLocaleDateString()}</td></tr>`,
          )
          .join("")
      : '<tr><td colspan="4" class="empty-state">No complaints submitted yet.</td></tr>';
  } catch (error) {
    showAlert(document.querySelector("#studentAlert"), error.message);
  }
}

async function loadComplaintOptions() {
  const categorySelect = document.querySelector("#category");
  if (!categorySelect) return;
  const allowed = await requireRole("student");
  if (!allowed) return;

  try {
    const data = await apiRequest("/api/config/options");
    data.complaintCategories.forEach((category) =>
      categorySelect.add(new Option(category, category)),
    );
  } catch (error) {
    showAlert(document.querySelector("#complaintAlert"), error.message);
  }
}

async function submitComplaint(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = document.querySelector("#submitComplaintButton");
  button.disabled = true;
  button.textContent = "Submitting...";
  try {
    const formData = Object.fromEntries(new FormData(form));
    const data = await apiRequest("/api/complaints", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    showAlert(
      document.querySelector("#complaintAlert"),
      `${data.message} Reference: ${data.complaint.referenceNumber}`,
      "success",
    );
    form.reset();
  } catch (error) {
    showAlert(document.querySelector("#complaintAlert"), error.message);
  } finally {
    button.disabled = false;
    button.textContent = "Submit Complaint";
  }
}

async function loadStudentComplaints() {
  const tableBody = document.querySelector("#studentComplaints");
  if (!tableBody) return;
  const allowed = await requireRole("student");
  if (!allowed) return;

  const load = async () => {
    const search = document.querySelector("#complaintSearch")?.value || "";
    const status = document.querySelector("#complaintStatus")?.value || "";
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (status) query.set("status", status);

    try {
      const data = await apiRequest(`/api/complaints/student?${query}`);
      tableBody.innerHTML = data.complaints.length
        ? data.complaints
            .map(
              (complaint) =>
                `<tr><td>${escapeHtml(complaint.referenceNumber)}</td><td><a href="/student/complaint.html?id=${complaint._id}">${escapeHtml(complaint.subject)}</a></td><td>${escapeHtml(complaint.category)}</td><td>${statusBadge(complaint.status)}</td><td>${new Date(complaint.createdAt).toLocaleDateString()}</td></tr>`,
            )
            .join("")
        : '<tr><td colspan="5" class="empty-state">No complaints match the current view.</td></tr>';
    } catch (error) {
      showAlert(document.querySelector("#studentAlert"), error.message);
    }
  };

  document
    .querySelector("#complaintSearchForm")
    ?.addEventListener("submit", (event) => {
      event.preventDefault();
      load();
    });
  load();
}

loadStudentDashboard();
loadComplaintOptions();
loadStudentComplaints();
document
  .querySelector("#submitComplaintForm")
  ?.addEventListener("submit", submitComplaint);
renderIcons();
