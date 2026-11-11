document
  .querySelectorAll('input[type="password"], input[data-password-input]')
  .forEach((input) => {
    const wrapper = input.closest(".password-field");
    const button = wrapper?.querySelector("[data-password-toggle]");
    if (!button) return;

    button.addEventListener("click", () => {
      const showPassword = input.type === "password";
      input.type = showPassword ? "text" : "password";
      button.setAttribute(
        "aria-label",
        showPassword ? "Hide password" : "Show password",
      );
      button.setAttribute("aria-pressed", String(showPassword));
      button.innerHTML = `<i data-lucide="${showPassword ? "eye-off" : "eye"}"></i>`;
      if (typeof renderIcons === "function") renderIcons(button);
    });
  });
