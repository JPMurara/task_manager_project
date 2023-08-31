import renderAuthForms from "./authForms.js";
import renderLogout from "./logout.js";
import renderDashboard from "./dashboard.js";

function renderHeader() {
    const header = document.getElementById("header-nav");

    const navUl = document.createElement("ul");

    navUl.classList.add("nav-list");

    // Create list items for each menu item
    const logo = document.createElement("li");
    const activities = document.createElement("li");
    const teams = document.createElement("li");
    const login = document.createElement("li");

    // Create a logo header
    const logoHeader = document.createElement("h1");
    logoHeader.textContent = "Colab Task Manager";
    logo.appendChild(logoHeader);

    // Set text content for menu items
    activities.textContent = "Dashboard";
    teams.textContent = "My Teams";

    login.classList.add("user-dropdown");
    login.innerHTML = `
    <div class="user-icon">
        <svg xmlns="http://www.w3.org/2000/svg" height="0.75em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#a9b5c1}</style><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/></svg>  
    </div>
    <div class="dropdown-content">
        <p>Username</p>
        <p>Email</p>
        <a href="#"><svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"/></svg></a>
    </div>`;
    // Append list items to the navigation list
    navUl.append(logo, activities, teams, login);

    // Append navigation list to the header
    header.replaceChildren(navUl);
    
    // Add event listeners to menu items
    // teams.addEventListener("click", renderTeams);
    //login.addEventListener("click", renderAuthForms);
    activities.addEventListener("click", renderDashboard);

    //Check login status and update UI
    loginStatus();
}

//Check login status and update UI
function loginStatus() {
    axios
        .get("/api/sessions/status")
        .then((response) => {
            const { name } = response.data;

            const logout = document.createElement("li");
            logout.textContent = "Logout";
            logout.addEventListener("click", renderLogout);

            const loginInfo = document.createElement("li");
            loginInfo.textContent = `Logged in as ${name}`;

            const navUl = document.querySelector(".nav-list");
            navUl.append(loginInfo, logout);
        })
        .catch((err) => {
            if (err.response && err.response.status === 401) {
                console.log("User is not logged in");
                loginInfo.textContent = "";
            } else {
                console.warn(
                    "An error occurred while checking login status:",
                    err
                );
            }
        });
}

export default renderHeader;
