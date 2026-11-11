async function loadAdminDashboard() {
  const stats = document.querySelector("#adminStats");
  if (!stats) return;
  const allowed = await requireRole("admin");
  if (!allowed) return;

  try {
    const data = await apiRequest("/api/complaints/admin/dashboard");
    stats.innerHTML = `
      <article class="card stat-card"><strong>${data.statistics.students}</strong>Students</article>
      <article class="card stat-card"><strong>${data.statistics.complaints}</strong>Total complaints</article>
      <article class="card stat-card"><strong>${data.statistics.underReview}</strong>Under review</article>
      <article class="card stat-card"><strong>${data.statistics.inProgress}</strong>In progress</article>
      <article class="card stat-card"><strong>${data.statistics.resolved}</strong>Resolved</article>
      <article class="card stat-card"><strong>${data.statistics.rejected}</strong>Rejected</article>
    `;
    document.querySelector("#recentAdminComplaints").innerHTML = data
      .recentComplaints.length
      ? data.recentComplaints
          .map(
            (complaint) =>
              `<tr><td>${escapeHtml(complaint.referenceNumber)}</td><td>${escapeHtml(complaint.student?.fullName || "Unknown")}</td><td>${statusBadge(complaint.status)}</td><td>${new Date(complaint.createdAt).toLocaleDateString()}</td></tr>`,
          )
          .join("")
      : '<tr><td colspan="4" class="empty-state">No complaints have been submitted.</td></tr>';
  } catch (error) {
    showAlert(document.querySelector("#adminAlert"), error.message);
  }
}

async function loadAdminComplaints() {
  const tableBody = document.querySelector("#adminComplaints");
  if (!tableBody) return;
  const allowed = await requireRole("admin");
  if (!allowed) return;

  const load = async () => {
    const values = Object.fromEntries(
      new FormData(document.querySelector("#adminFilters")),
    );
    const query = new URLSearchParams(
      Object.entries(values).filter(([, value]) => value),
    );
    try {
      const data = await apiRequest(`/api/complaints/admin?${query}`);
      tableBody.innerHTML = data.complaints.length
        ? data.complaints
            .map(
              (complaint) =>
                `<tr><td>${escapeHtml(complaint.referenceNumber)}</td><td>${escapeHtml(complaint.student?.fullName || "Unknown")}</td><td>${escapeHtml(complaint.subject)}</td><td>${statusBadge(complaint.status)}</td><td>${escapeHtml(complaint.priority)}</td><td><a href="/admin/complaint.html?id=${complaint._id}">Open</a></td></tr>`,
            )
            .join("")
        : '<tr><td colspan="6" class="empty-state">No complaints match the current filters.</td></tr>';
    } catch (error) {
      showAlert(document.querySelector("#adminAlert"), error.message);
    }
  };

  document
    .querySelector("#adminFilters")
    ?.addEventListener("submit", (event) => {
      event.preventDefault();
      load();
    });
  load();
}

async function loadStudents() {
  const tableBody = document.querySelector("#registeredStudents");
  if (!tableBody) return;
  const allowed = await requireRole("admin");
  if (!allowed) return;
  try {
    const data = await apiRequest("/api/complaints/admin/students");
    tableBody.innerHTML = data.students.length
      ? data.students
          .map(
            (student) =>
              `<tr><td>${escapeHtml(student.fullName)}</td><td>${escapeHtml(student.matriculationNumber)}</td><td>${escapeHtml(student.email)}</td><td>${escapeHtml(student.department)}</td></tr>`,
          )
          .join("")
      : '<tr><td colspan="4" class="empty-state">No students are registered.</td></tr>';
  } catch (error) {
    showAlert(document.querySelector("#adminAlert"), error.message);
  }
}

loadAdminDashboard();
loadAdminComplaints();
loadStudents();
renderIcons();
