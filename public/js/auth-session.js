async function requireRole(expectedRole) {
  try {
    const data = await apiRequest("/api/auth/me");
    if (data.user.role !== expectedRole) {
      window.location.href =
        data.user.role === "admin"
          ? "/admin/dashboard.html"
          : "/student/dashboard.html";
      return false;
    }
    return true;
  } catch (error) {
    window.location.href = `/login.html`;
    return false;
  }
}

document.querySelectorAll("[data-logout]").forEach((link) => {
  link.addEventListener("click", async (event) => {
    event.preventDefault();
    try {
      await apiRequest("/api/auth/logout", { method: "POST", body: "{}" });
    } finally {
      window.location.href = "/login.html";
    }
  });
});
