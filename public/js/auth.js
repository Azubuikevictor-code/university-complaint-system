async function loadRegistrationOptions() {
  const facultySelect = document.querySelector("#faculty");
  const departmentSelect = document.querySelector("#department");
  if (!facultySelect || !departmentSelect) return;

  try {
    const data = await apiRequest("/api/config/options");
    Object.keys(data.facultiesAndDepartments).forEach((faculty) => {
      facultySelect.add(new Option(faculty, faculty));
    });

    facultySelect.addEventListener("change", () => {
      departmentSelect.innerHTML =
        '<option value="">Select a department</option>';
      const departments =
        data.facultiesAndDepartments[facultySelect.value] || [];
      departments.forEach((department) =>
        departmentSelect.add(new Option(department, department)),
      );
    });
  } catch (error) {
    showAlert(document.querySelector("#registerAlert"), error.message);
  }
}

const registerForm = document.querySelector("#registerForm");
if (registerForm) {
  loadRegistrationOptions();
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = document.querySelector("#registerButton");
    const alert = document.querySelector("#registerAlert");
    const formData = Object.fromEntries(new FormData(registerForm));
    if (formData.password !== formData.confirmPassword) {
      showAlert(alert, "Passwords do not match");
      return;
    }
    button.disabled = true;
    button.textContent = "Creating account...";

    try {
      const data = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      showAlert(alert, data.message, "success");
      window.location.href =
        data.user.role === "admin"
          ? "/admin/dashboard.html"
          : "/student/dashboard.html";
    } catch (error) {
      showAlert(alert, error.message);
      button.disabled = false;
      button.innerHTML =
        '<i data-lucide="user-plus"></i><span>Create account</span>';
      if (typeof renderIcons === "function") renderIcons(button);
    }
  });
}

const loginForm = document.querySelector("#loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = document.querySelector("#loginButton");
    const alert = document.querySelector("#loginAlert");
    const credentials = Object.fromEntries(new FormData(loginForm));
    button.disabled = true;
    button.textContent = "Logging in...";

    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      window.location.href =
        data.user.role === "admin"
          ? "/admin/dashboard.html"
          : "/student/dashboard.html";
    } catch (error) {
      showAlert(alert, error.message);
      button.disabled = false;
      button.innerHTML = '<i data-lucide="log-in"></i><span>Log in</span>';
      if (typeof renderIcons === "function") renderIcons(button);
    }
  });
}
