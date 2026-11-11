async function loadSupportEmail() {
  try {
    const response = await fetch("/api/config/options", { credentials: "same-origin" });
    const data = await response.json();
    const email = data.supportEmail?.trim();

    document.querySelectorAll("[data-support-email]").forEach((element) => {
      element.textContent = email || "Contact support";
      element.href = email ? `mailto:${email}` : "/contact.html";
    });

    document.querySelectorAll("[data-support-link]").forEach((element) => {
      if (email) element.setAttribute("href", `mailto:${email}`);
    });
  } catch (error) {
    document.querySelectorAll("[data-support-email]").forEach((element) => {
      element.textContent = "Contact support";
      element.href = "/contact.html";
    });
  }
}

loadSupportEmail();
