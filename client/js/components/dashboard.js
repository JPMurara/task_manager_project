import { renderHeader } from "./header.js";

function renderDashboard() {
  //Always show the last activity when user click on Dashboard
  renderLastActivity();

  const page = document.getElementById("page");

  const content = document.createElement("div");
  content.classList.add("content");
  content.id = "main_content";

  //ACTIVITIES INPUT TO GET TASKS
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

function renderActivity(activity_id) {
  const content = document.getElementById("main_content");

  //Clear the old content, to only show the new one
  // Remove the existing activity_header, if any
  const existingHeader = document.querySelector(".activity_header");
  if (existingHeader) {
    content.removeChild(existingHeader);
  }

  // Remove the existing task rows, if any
  const existingRow = document.querySelector(".row");
  if (existingRow) {
    content.removeChild(existingRow);
  }

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

      list.innerHTML = `${
        task.task_name
      } <a href="#" onclick='editTask(${JSON.stringify(
        task
      )})'><i class="fa-solid fa-pen-to-square iconEdit"></i></a>`;
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
    axios.post("/api/activity", data).then((res) => {
      console.log(res.data);
      //Render the new tasks on dashboard after posting it
      if (res.data && res.data.activity_id) {
        renderActivity(res.data.activity_id);
      }

      //Refresh sidebar activities
      renderSidebarActivities();
    });
  });
}

//IF NO ACTIVITY TELL THE USER TO SHOW A MESSAGE
function renderLastActivity() {
  axios
    .get("/api/activity/getLast")
    .then((res) => {
      if (res.data) {
        renderActivity(res.data.activity_id);
      } else {
        // No activity exists. Handle this case accordingly.
        // For example, show a message to the user indicating no activities are present.
        const content = document.getElementById("main_content");
        const message = document.createElement("h3");
        message.classList.add("no-activity-message");
        message.textContent = "No activities found. Please create one!";
        content.appendChild(message);
      }
    })
    .catch((error) => {
      console.error("Error fetching the last activity:", error);
      // Handle any other errors that may arise.
    });
}

function editTask(task) {
  // Create elements
  const dialog = document.createElement("dialog");

  const form = document.createElement("form");
  form.id = "editTaskForm";
  form.innerHTML = `
        <label for="edit_task_name">Name:</label>
        <input type="text" id="edit_task_name" name="task_name" value="${
          task.task_name || ""
        }">

        <label for="edit_task_description">Description:</label>
        <textarea id="edit_task_description" name="task_description">${
          task.task_description || ""
        }</textarea>

        <label for="edit_task_status">Status:</label>
        <select id="edit_task_status" name="task_status">
            <option value="pending" ${
              task.tasks_status === "pending" ? "selected" : ""
            }>Pending</option>
            <option value="in_progress" ${
              task.tasks_status === "in_progress" ? "selected" : ""
            }>In Progress</option>
            <option value="completed" ${
              task.tasks_status === "completed" ? "selected" : ""
            }>Completed</option>
        </select>

        <label for="edit_task_priority">Priority:</label>
        <select id="edit_task_priority" name="task_priority">
            <option value="low" ${
              task.task_priority === "low" ? "selected" : ""
            }>Low</option>
            <option value="medium" ${
              task.task_priority === "medium" ? "selected" : ""
            }>Medium</option>
            <option value="high" ${
              task.task_priority === "high" ? "selected" : ""
            }>High</option>
        </select>

        <label for="edit_assigned_to">Assigned To:</label>
        <input type="text" id="edit_assigned_to" name="assigned_to" value="${
          task.assigned_to || ""
        }">

        <label for="edit_due_date">Due Date:</label>
        <input type="date" id="edit_due_date" name="due_date" value="${
          task.due_date || ""
        }">

        <input type="submit" id="saveEditTask" value="Save">
    `;

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";

  // Add classes to elements for styling
  dialog.classList.add("dialog");
  closeBtn.classList.add("close-button");
  form.classList.add("dialog-form");

  // Append form and button to dialog, then dialog to the document
  dialog.append(form);
  dialog.append(closeBtn);
  document.body.appendChild(dialog);

  // Display the dialog when function is called
  dialog.showModal();

  // Close the dialog box when the button close is clicked
  closeBtn.addEventListener("click", function () {
    dialog.close();
    document.body.removeChild(dialog); // Optional: remove dialog from DOM after closing
  });

  //WHEN CLICK SAVE, GET THE INFO AND PUT ON DB

  document.getElementById("saveEditTask").addEventListener("click", () => {
    const taskData = {
      task_name: document.getElementById("edit_task_name").value,
      task_description: document.getElementById("edit_task_description").value,
      task_status: document.getElementById("edit_task_status").value,
      task_priority: document.getElementById("edit_task_priority").value,
      assigned_to: document.getElementById("edit_assigned_to").value,
      due_date: document.getElementById("edit_due_date").value,
      updated_at: new Date().toISOString().slice(0, 19).replace("T", " "), // Format: 'YYYY-MM-DD HH:MM:SS'
    };

    axios
      .put("/api/activities/task/update/" + task.task_id, taskData)
      .then((response) => {
        dialog.close();
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  });
}

window.renderActivity = renderActivity;
window.editTask = editTask;

export default renderDashboard;
