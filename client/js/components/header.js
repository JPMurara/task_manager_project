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

    //TEST OPENAI
    const openai = document.createElement("li");
    openai.innerHTML = `
        <form action="" id="formAI">
        <input type="text" name="message" id="message" />
        <button type="submit">Send</button>
        </form>
    `;

    // Create a logo header
    const logoHeader = document.createElement("h1");
    logoHeader.textContent = "Colab Task Manager";
    logo.appendChild(logoHeader);

    // Set text content for menu items
    activities.textContent = "My Activities";
    teams.textContent = "My Teams";
    login.textContent = "Login";

    // Append list items to the navigation list
    navUl.append(logo, activities, teams, login, openai);

    // Append navigation list to the header
    header.replaceChildren(navUl);

    // Add event listeners to menu items
    // activities.addEventListener("click", renderActivities);
    // teams.addEventListener("click", renderTeams);
    login.addEventListener("click", renderAuthForms);

    activities.addEventListener("click", renderDashboard);

    //Get activity name and save it on database
    getActivity();

    //Check login status and update UI
    loginStatus();
}

function getActivity() {
    const form = document.querySelector("form");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            activity: formData.get("message"),
        };

        renderTasks(data);
    });
}

function renderTasks(data) {
    axios.post("/api/activity", data).then((res) => {
        console.log(res.data.tasks);

        const tasks = res.data.tasks;

        tasks.forEach((task) => {
            const taskElement = document.createElement("div");
            taskElement.classList.add("message");
            taskElement.classList.add("message_received");
            taskElement.innerHTML = `<div class="message_text">${task}</div>`;

            document.body.appendChild(taskElement);
        });
    });
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
