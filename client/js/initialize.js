import { renderHeader, loginStatus } from "./components/header.js";
import renderAuthForms from "./components/authForms.js";
import renderDashboard from "./components/dashboard.js";

axios
  .get("/api/sessions/status")
  .then((response) => {
    if (!response || !response.data.isAuthenticated) {
      renderHeader();
      renderAuthForms();
    } else {
      renderHeader();
      renderDashboard();
      loginStatus();
    }
  })
  .catch((err) => {
    console.log("sorry an error occured", err);
    console.debug(err);
  });
