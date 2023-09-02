import renderHeader from "./components/header.js";
import renderAuthForms from "./components/authForms.js";
import renderDashboard from "./components/dashboard.js";

axios
  .get("/api/sessions/status")
  .then((response) => {
    console.log("response", response);
    if (!response || !response.data.isAuthenticated) {
      renderHeader();
      renderAuthForms();
    } else {
      renderHeader();
      renderDashboard();
    }
  })
  .catch((err) => {
    console.log("sorry an error occured", err);
    console.debug(err);
  });
