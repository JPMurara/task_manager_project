import renderHeader from "./header.js";

function renderDashboard() {
  const page = document.getElementById("page");

  const dashboardHeader = document.createElement("header");
  dashboardHeader.id = "dashboardHeader";
  dashboardHeader.innerHTML = `
    <header id="dashboardHeader">
    <h1>Dashboard</h1>
    <p>Project Name PLACEHOLDER</p>
    </header>
  `;

  renderTasks();

  // dashboard section
  const dashboard = document.createElement("section");
  dashboard.id = "dashboardContainer";

  page.replaceChildren(dashboardHeader, dashboard);
}

function renderTasks() {
  axios.get("http://localhost:3000/api/openai").then((res) => {
    //   change the .tasks according with what was built in the BE
    const tasks = res.data.tasks;
    const page = document.getElementById("page");
    const dashboardContainer = document.createElement("section");
    dashboardContainer.id = "dashboardContainer";
    dashboardContainer.innerHTML = `
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

    if (tasks) {
      const todoTasksContainer = document.getElementById("todoTasksContainer");
      tasks.forEach((el) => {
        todoTasksContainer.innerHTML = `
            <div class="taskEl">
            <p class="taskName">PLACEHOLDER FOR TASK NAME</p>
            <i class="fa-solid fa-pen-to-square iconEdit"></i>
            </div>
        `;
      });
    }
  });
}

export default renderDashboard;
