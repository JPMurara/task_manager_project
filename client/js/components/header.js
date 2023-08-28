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
    const message = openai.querySelector("#message");
    const form = openai.querySelector("form");

    let messages = [
        {
            role: "assistant",
            content:
                "anything that you will be prompted will be used to generate a to-do list. answer with up to 5 tasks using keywords or short sentences of up to 3 words only. Output your answer in JSON",
        },
    ];

    console.log(form);

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

  //Check login status and update UI
  loginStatus();

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            activity: formData.get("message"),
        };

        // const messageText = message.value;

        // console.log(messageText);

        // const newMessage = {
        //     role: "user",
        //     content: `${messageText}`,
        // };

        // messages.push(newMessage);

        // message.value = "";

        axios
            .post("http://localhost:3000/api/openai/activity", data)
            .then((res) => {
                renderHeader();
            });

        // fetch("http://localhost:3000/api/openai", data {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //         messages,
        //         message,
        //     }),
        // }).then((res) => res.json(message));
        // .then((completion) => {
        //     completion.completion.tasks.forEach((task) => {
        //         console.log(task);
        //     });

        //     const messageElement = document.createElement("div");
        //     messageElement.classList.add("message");
        //     messageElement.classList.add("message_received");
        //     messageElement.innerHTML = `<div class="message_text">${completion.completion.tasks}</div>`;

        //     chatLog.appendChild(messageElement);
        //     chatLog.scrollTop = chatLog.scrollHeight;
        // })
        // .catch((err) => console.log(err));
    });

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
        console.warn("An error occurred while checking login status:", err);
      }
    });
}

export default renderHeader;
