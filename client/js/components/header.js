import renderAuthForms from "./authForms.js";
import renderLogout from "./logout.js";
import renderDashboard from "./dashboard.js";
import renderTeams from "./myteams.js";

export function renderHeader() {
    const header = document.getElementById("header-nav");

    // create navbar list
    const navUl = document.createElement("ul");

    navUl.classList.add("nav-list");

    // Create list items for each menu item
    const logo = document.createElement("li");
    logo.classList.add("logo");

    // Create a logo header
    const logoHeader = document.createElement("img");
    logoHeader.src = "../../styles/img/logo-no-background.png";
    logo.appendChild(logoHeader);

    navUl.append(logo);

    // Append navigation list to the header
    header.replaceChildren(navUl);
}

//Check login status and update UI
export function loginStatus() {
    axios
        .get("/api/sessions/status")
        .then((response) => {
            // user name
            const { name } = response.data;

            // create elements
            const activities = document.createElement("li");
            const teams = document.createElement("li");
            const login = document.createElement("li");

            // select elements from the html
            const navUl = document.querySelector(".nav-list");
            const header = document.querySelector("#header-nav");

            // Set text content for menu items
            activities.textContent = "Dashboard";
            teams.textContent = "My Teams";

            // element to render user name when logged in and logout button
            login.classList.add("user-dropdown");
            login.innerHTML = `
    <div class="user-icon">
        <i class="fa-regular fa-user"></i>
    </div>
    <div class="dropdown-content">
        <li id="loginInfo">Logged in as ${name}</li>
        <li id="logout">Log out</li>
    </div>`;

            // Append list items to the navigation list
            navUl.append(activities, teams, login);
            header.replaceChildren(navUl);

            // Add event listeners to menu items
            teams.addEventListener("click", renderTeams);
            activities.addEventListener("click", renderDashboard);

            const logoutLi = document.querySelector("#logout");
            logoutLi.addEventListener("click", renderLogout);
        })
        .catch((err) => {
            if (err.response && err.response.status === 401) {
                console.log("User is not logged in");
            } else {
                console.log(
                    "An error occurred while checking login status:",
                    err
                );
            }
        });

    //Burger Icon
    // const navUl = document.querySelector(".nav-list");

    // const divBurger = document.createElement("div");
    // divBurger.classList.add("burger");
    // divBurger.addEventListener("click", toggleMenu());

    // const div1 = document.createElement("div");
    // const div2 = document.createElement("div");
    // const div3 = document.createElement("div");

    // divBurger.append(div1, div2, div3);

    // navUl.append(divBurger);
}

function toggleMenu() {
    const navUl = document.querySelector(".nav-list");
    navUl.classList.toggle("active");
}
