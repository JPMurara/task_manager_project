import renderAuthForms from "./authForms.js";
import renderLogout from "./logout.js";
import renderDashboard from "./dashboard.js";

export function renderHeader() {
  const header = document.getElementById("header-nav");

  const navUl = document.createElement("ul");

  navUl.classList.add("nav-list");

  // Create list items for each menu item
  const logo = document.createElement("li");
  logo.classList.add("logo");
  // const activities = document.createElement("li");
  // const teams = document.createElement("li");
  // const login = document.createElement("li");

  // Create a logo header
  const logoHeader = document.createElement("h1");
  logoHeader.textContent = "Colab Task Manager";
  logo.appendChild(logoHeader);

  // Set text content for menu items
  // activities.textContent = "Dashboard";
  // teams.textContent = "My Teams";

  // login.classList.add("user-dropdown");
  // login.innerHTML = `
  //   <div class="user-icon">
  //       <i class="fa-regular fa-user"></i>
  //   </div>
  //   <div class="dropdown-content">
  //       <a><i class="fa-solid fa-right-from-bracket"></i></a>
  //   </div>`;
  // Append list items to the navigation list
  // navUl.append(logo, activities, teams, login);
  navUl.append(logo);

  // Append navigation list to the header
  header.replaceChildren(navUl);

  // Add event listeners to menu items
  // teams.addEventListener("click", renderTeams);
  // login.addEventListener("click", renderAuthForms);
  // activities.addEventListener("click", renderDashboard);
}

//Check login status and update UI
export function loginStatus() {
  axios
    .get("/api/sessions/status")
    .then((response) => {
      const { name } = response.data;

      const activities = document.createElement("li");
      const teams = document.createElement("li");
      const login = document.createElement("li");

      const logo = document.querySelector(".logo");
      const navUl = document.querySelector(".nav-list");
      const header = document.querySelector("#header-nav");

      // Set text content for menu items
      activities.textContent = "Dashboard";
      teams.textContent = "My Teams";

      login.classList.add("user-dropdown");
      login.innerHTML = `
    <div class="user-icon">
        <i class="fa-regular fa-user"></i>
    </div>
    <div class="dropdown-content">
        <li id="loginInfo">Logged in as ${name}</li>
        <li id="logout">Log out</li>
    </div>`;

      // login.innerHTML = `
      //   <div class="user-icon">
      //       <i class="fa-regular fa-user"></i>
      //   </div>
      //   <div class="dropdown-content">
      //       <a><i class="fa-solid fa-right-from-bracket"></i></a>
      //   </div>`;

      // Append list items to the navigation list
      navUl.append(activities, teams, login);
      header.replaceChildren(navUl);
      // Add event listeners to menu items
      // teams.addEventListener("click", renderTeams);
      // login.addEventListener("click", renderAuthForms);
      activities.addEventListener("click", renderDashboard);

      const logoutLi = document.querySelector("#logout");
      logoutLi.addEventListener("click", renderLogout);

      // const loginInfo = document.querySelector("#loginInfo");
      // loginInfo.textContent = `Logged in as ${name}`;

      // const navUl = document.querySelector(".nav-list");
      // navUl.append(loginInfo, logout);
    })
    .catch((err) => {
      if (err.response && err.response.status === 401) {
        console.log("User is not logged in");
        // loginInfo.textContent = "";
      } else {
        console.log("An error occurred while checking login status:", err);
        // console.warn("An error occurred while checking login status:", err);
      }
    });
}
