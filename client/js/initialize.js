import renderHeader from "./components/header.js";
import renderAuthForms from "./components/authForms.js";
import renderDashboard from "./components/dashboard.js";

axios
  .get("/api/sessions/status")
  .then((response) => {
    const { isAuthenticated } = response.data;
    if (!isAuthenticated) {
      renderHeader();
      renderAuthForms();
    } else {
      renderHeader();
      renderDashboard();
    }
  })
  .catch((err) => {
    console.log("user no authenticated", err);
    renderHeader();
    renderAuthForms();
  });
