import renderHeader from "./header.js";

function renderDashboard() {
    const page = document.getElementById("page");

    //IF NO ACTIVITY RENDER THIS OTHERWISE RENDER THE NAME ACTIVITY
    const openai = document.createElement("section");
    openai.id = "openaiInput";
    openai.innerHTML = `
      <form action="" id="formAI">
      <input type="text" name="message" id="message" />
      <button type="submit">Send</button>
      </form>
  `;

    const sidebar = document.createElement("section");
    sidebar.id = "sidebar";

    const cards = document.createElement("section");
    cards.id = "cards";
    cards.innerHTML = `
        <div id="todoContainer">
            <div class="titleContainer">
                <p class="status">To Do</p>
                <i class="fa-solid fa-plus iconAdd"></i>
                <i class="fa-solid fa-pen-to-square iconEdit"></i>
            </div>

            <div id="todoTasksContainer">
            </div>
        </div>

        <div id="inprogressContainer">
            <div class="titleContainer">
                <p class="status">In Progress</p>
                <i class="fa-solid fa-plus iconAdd"></i>
                <i class="fa-solid fa-pen-to-square iconEdit"></i>
            </div>

            <div id="inprogressTasksContainer">
            </div>
        </div>

        <div id="completedContainer">
            <div class="titleContainer">
                <p class="status">Completed</p>
                <i class="fa-solid fa-plus iconAdd"></i>
                <i class="fa-solid fa-pen-to-square iconEdit"></i>
            </div>

            <div id="completedTaskContainer">
            </div>
        </div>
  `;

    page.replaceChildren(openai, cards, sidebar);
    getActivity();
    sidebarActivity();
}

function getActivity() {
    const form = document.querySelector("form");

    const formSection = document.querySelector("#openaiInput");

    //Only show the name if activity exists
    const activityName = document.createElement("h2");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            activity: formData.get("message"),
        };

        if (data) {
            form.style.display = "none";
            activityName.textContent = data.activity;
            activityName.style.display = "block";
            formSection.appendChild(activityName);
        }
        renderTasks(data);
    });
}

function renderTasks(data) {
    axios.post("/api/activity", data).then((res) => {
        console.log(res.data.tasks);

        const tasks = res.data.tasks;

        const todoTasksContainer =
            document.getElementById("todoTasksContainer");

        tasks.forEach((task) => {
            // Create the new task HTML
            const taskHTML = `
                <div class="taskEl">
                    <p class="taskName">${task}</p>
                    <i class="fa-solid fa-pen-to-square iconEdit"></i>
                </div>
            `;
            // Append the new task to the container
            todoTasksContainer.innerHTML += taskHTML;
        });
    });
}

function sidebarActivity() {
    //Get activities from DB and render here
    axios.get("/api/activity/getAll").then((res) => {
        const sidebar = document.getElementById("sidebar");

        res.data.forEach((name) => {
            const activityHTML = `
          <p class="sidebarActivity">${name.activity_name}</p>
      `;
            sidebar.innerHTML += activityHTML;
        });
    });
}

export default renderDashboard;
