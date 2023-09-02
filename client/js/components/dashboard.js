function renderActivity(activity_id) {
  const content = document.getElementById("main_content");

  axios.get("/api/activity/get/" + activity_id).then((res) => {
    console.log(res);

    // create a header for the activity
    const activity_header = document.createElement("div");
    activity_header.classList.add("activity_header");
    const activity_title = document.createElement("h1");
    activity_title.textContent = res.data.activity_name;
    activity_header.append(activity_title);
    content.appendChild(activity_header);

    //create row
    const row = document.createElement("row");
    row.classList.add("row");

    //create to-do column
    const todoColumn = document.createElement("div");
    const todoHeader = document.createElement("h2");
    todoHeader.innerHTML = `To-do <a href="/"><i class="fas fa-plus-circle" style="float: right;"></i></a>`;
    todoColumn.appendChild(todoHeader);
    const todoseparator = document.createElement("div");
    todoseparator.classList.add("separator");
    todoColumn.appendChild(todoseparator);
    todoColumn.classList.add("column");
    const todoList = document.createElement("ul");
    todoList.classList.add("startList");
    todoColumn.appendChild(todoList);

    //Render list for tasks
    res.data.tasks.forEach((task) => {
      const list = document.createElement("li");
      list.textContent = task.task_name;
      // <i class="fa-solid fa-pen-to-square iconEdit"></i>

      // Append the new task to the container
      todoList.appendChild(list);
    });

    //create doing column
    const doingColumn = document.createElement("div");
    const doingHeader = document.createElement("h2");
    doingHeader.innerHTML = `Doing <a href="/"><i class="fas fa-plus-circle" style="float: right;"></i></a>`;
    doingColumn.appendChild(doingHeader);
    const doingseparator = document.createElement("div");
    doingseparator.classList.add("separator");
    doingColumn.appendChild(doingseparator);
    doingColumn.classList.add("column");

    //create done column
    const doneColumn = document.createElement("div");
    const doneHeader = document.createElement("h2");
    doneHeader.innerHTML = `Done <a href="/"><i class="fas fa-plus-circle" style="float: right;"></i></a>`;
    doneColumn.appendChild(doneHeader);
    const doneseparator = document.createElement("div");
    doneseparator.classList.add("separator");
    doneColumn.appendChild(doneseparator);
    doneColumn.classList.add("column");

    row.append(todoColumn, doingColumn, doneColumn);

    content.append(row);
  });
}

function renderDashboard() {
  const page = document.getElementById("page");

  const content = document.createElement("div");
  content.classList.add("content");
  content.id = "main_content";

  //IF NO ACTIVITY RENDER THIS OTHERWISE RENDER THE NAME ACTIVITY
  const openai = document.createElement("div");
  openai.classList.add("openai");
  openai.innerHTML = `
        <form action="" id="formAI">
            <input type="text" name="message" id="message" placeholder="Enter the kind of activity..">
            <button type="submit">Send</button>
        </form>
        `;

  content.appendChild(openai);
  page.replaceChildren(content);
  renderSidebarActivities();
  getActivity();
}

function renderSidebarActivities() {
  const page = document.getElementById("page");

  const sidebar = document.createElement("div");
  sidebar.classList.add("sidebar");

  //Get activities from DB and render here
  axios.get("/api/activity/getAll").then((res) => {
    let activitiesAnchors = ``;
    res.data.forEach((activity) => {
      //Declared the renderActivity() as global scope on the bottom of the page

      activitiesAnchors += `<a href="#" onclick='renderActivity(${activity.activity_id})'>${activity.activity_name}</a>`;
    });

    sidebar.innerHTML = activitiesAnchors;
  });
  page.append(sidebar);
}

function getActivity() {
  const form = document.querySelector("form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      activity: formData.get("message"),
    };
    //POST ACTIVITY NAME
    axios.post("/api/activity", data);
  });
}

window.renderActivity = renderActivity;

export default renderDashboard;
