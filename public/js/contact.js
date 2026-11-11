const contactForm = document.querySelector("#contactForm");

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = document.querySelector("#contactButton");
  const alert = document.querySelector("#contactAlert");
  const values = Object.fromEntries(new FormData(contactForm));
  button.disabled = true;
  button.innerHTML =
    '<i data-lucide="loader-circle"></i><span>Sending...</span>';
  if (typeof renderIcons === "function") renderIcons(button);

  try {
    const data = await apiRequest("/api/contact", {
      method: "POST",
      body: JSON.stringify(values),
    });
    showAlert(alert, data.message, "success");
    contactForm.reset();
    button.innerHTML = '<i data-lucide="check"></i><span>Message sent</span>';
    if (typeof renderIcons === "function") renderIcons(button);
  } catch (error) {
    showAlert(alert, error.message);
    button.disabled = false;
    button.innerHTML = '<i data-lucide="send"></i><span>Send message</span>';
    if (typeof renderIcons === "function") renderIcons(button);
  }
});
