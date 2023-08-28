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

    <section id="DashboardContainer">
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
    </section>
  `;

  page.replaceChildren(dashboardHeader);
  renderTasks();
}

function renderTasks() {
  axios.get("http://localhost:3000/api/openai").then((res) => {
    //   change the .tasks according with what was built in the BE
    const tasks = res.data.tasks;
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
