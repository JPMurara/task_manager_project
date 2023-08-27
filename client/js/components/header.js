import renderSignupForm from "./signup.js";

function renderHeader() {
    const header = document.getElementById("header-nav");

    const navUl = document.createElement("ul");

    navUl.classList.add("nav-list");

    // Create list items for each menu item
    const logo = document.createElement("li");
    const activities = document.createElement("li");
    const teams = document.createElement("li");
    const login = document.createElement("li");

    //When user is logged in, show message
    const loginInfo = document.createElement("li");

    // Create a logo header
    const logoHeader = document.createElement("h1");
    logoHeader.textContent = "Colab Task Manager";
    logo.appendChild(logoHeader);

    // Set text content for menu items
    activities.textContent = "My Activities";
    teams.textContent = "My Teams";
    login.textContent = "Login";

    // Append list items to the navigation list
    navUl.append(logo, activities, teams, login);

    // Append navigation list to the header
    header.replaceChildren(navUl);

    // Add event listeners to menu items
    // activities.addEventListener("click", renderActivities);
    // teams.addEventListener("click", renderTeams);
    login.addEventListener("click", renderSignupForm);
}

export default renderHeader;
