import { renderHeader } from "./header.js";

function renderDashboard() {
  //Always show the last activity when user click on Dashboard
  renderLastActivity();

  const page = document.getElementById("page");

  //Spinner
  const spinner = document.createElement("div");
  spinner.classList.add("spinner");
  spinner.id = "spinner";

  //Spinner Container
  const loaderContainer = document.createElement("div");
  loaderContainer.classList.add("loader-container");
  loaderContainer.id = "loader-container";
  // loaderContainer.style.display = "none";

  loaderContainer.appendChild(spinner);

  const content = document.createElement("div");
  content.classList.add("content");
  content.id = "main_content";

  const activityContainer = document.createElement("div");
  activityContainer.id = "activityCont";
  // modal to display messages
  const errorContainer = document.createElement("div");
  errorContainer.classList.add("errorContainer");
  errorContainer.innerHTML = `

    <dialog class="dialog" id="formsContainerDialog">
      <p class="errorMessage"></p>
    </dialog>
  `;

  const formsContainer = document.createElement("div");
  formsContainer.classList.add("formsContainer");

  //ACTIVITIES INPUT TO GET TASKS - AI ASSIST
  const openai = document.createElement("div");
  openai.classList.add("openai");
  openai.innerHTML = `
    <form action="" id="formAI">
        <input  type="text" name="message" id="message" placeholder="Add an activity (AI Assist)..." required>
        <button type="submit">AI Assist</button>
    </form>
    `;

  // User manually add activity
  const userAddActivityForm = document.createElement("div");
  userAddActivityForm.classList.add("userAddActivityForm");
  userAddActivityForm.innerHTML = `
    <form action="" id="userActivityForm">
      <input type="text" name="userActivity" id="userActivity" placeholder="Add your own activity..." required>
      <button>Add</button>
    </form>
    `;

  formsContainer.append(openai, userAddActivityForm);
  content.append(
    formsContainer,
    errorContainer,
    activityContainer,
    loaderContainer
  );
  page.replaceChildren(content);
  renderSidebarActivities();
  getActivity();
  postUserActivity();
}

function renderActivity(activity_id) {
  const nullContainer = document.querySelector(".null-container");
  if (nullContainer) {
    nullContainer.remove();
  }
  console.log(activity_id);
  const content = document.getElementById("activityCont");
  content.innerHTML = "";

  axios
    .get("/api/activity/get/" + activity_id)
    .then((res) => {
      if (res.data != null) {
        // Create a div with class "action-panel"
        const actionPanelDiv = document.createElement("div");
        actionPanelDiv.classList.add("action-panel");

        // Create an h2 element with content
        const h2Element = document.createElement("h2");
        h2Element.textContent = res.data.activity_name ?? "-";

        // Create three buttons with icons
        const addButton = document.createElement("button");
        addButton.id = "add-button";
        const addIcon = document.createElement("i");
        addIcon.classList.add("fa-solid", "fa-user-plus");
        addButton.appendChild(addIcon);

        const deleteButton = document.createElement("button");
        deleteButton.id = "delete-button";
        const deleteIcon = document.createElement("i");
        deleteIcon.classList.add("fa-solid", "fa-trash-can");
        deleteButton.appendChild(deleteIcon);
        deleteButton.addEventListener("click", () => {
          deleteActivity(res.data.activity_id);
        });

        const updateButton = document.createElement("button");
        updateButton.id = "update-button";
        const updateIcon = document.createElement("i");
        updateIcon.classList.add("fa-solid", "fa-pen-to-square");
        updateButton.appendChild(updateIcon);
        updateButton.addEventListener("click", () => {
          editActivity(res.data);
        });

        //Create a div for the buttons
        const activityButtons = document.createElement("div");
        activityButtons.classList.add("activityButtons");
        activityButtons.append(addButton, deleteButton, updateButton);

        // Append the elements to the actionPanelDiv
        actionPanelDiv.appendChild(h2Element);
        actionPanelDiv.appendChild(activityButtons);

        content.appendChild(actionPanelDiv);

        //create row
        const row = document.createElement("row");
        row.classList.add("row");

        // Test this code and remove the old one after testing!
        // Create an array of task status to create columns inside the loop
        const columnNames = ["To-do", "Doing", "Done"];
        // Iterate through the column names and create the columns
        columnNames.forEach((columnName) => {
          const column = document.createElement("div");
          const header = document.createElement("h2");
          const icon = document.createElement("i");
          icon.setAttribute("class", "btnAddTask fas fa-plus-circle");
          icon.style.float = "right";
          //   header.innerHTML = `${columnName} <i class="fas fa-plus-circle" style="float: right;"></i>`;
          header.innerHTML = `${columnName}`;
          header.append(icon);
          column.appendChild(header);
          const separator = document.createElement("div");
          separator.classList.add("separator");
          column.appendChild(separator);
          column.classList.add("column");
          const list = document.createElement("ul");
          list.classList.add("tasklistContainer");
          list.classList.add(`${columnName.toLowerCase()}List`);
          column.appendChild(list);
          row.appendChild(column);
          icon.addEventListener("click", () => addTask(activity_id));
        });

        content.append(row);

        //Render list for tasks
        const todoList = document.querySelector(".to-doList");
        const doingList = document.querySelector(".doingList");
        const doneList = document.querySelector(".doneList");

        res.data.tasks.forEach((task) => {
          // Create <li> element
          const listItem = document.createElement("li");
          listItem.classList.add("member-item");

          // Create <span> element for task name
          const taskName = document.createElement("span");
          taskName.classList.add("member-name");
          taskName.textContent = task.task_name;

          // Create <button> element for remove
          const editButton = document.createElement("button");
          editButton.classList.add("edit-button");

          // Create <i> element for edit icon
          const editTaskIcon = document.createElement("i");
          editTaskIcon.classList.add("fa-solid", "fa-pen-to-square");

          // Append the trash icon to the remove button
          editButton.appendChild(editTaskIcon);

          editButton.addEventListener("click", () => {
            editTask(task, activity_id);
          });

          // Create <button> element for remove
          const deleteTaskButton = document.createElement("button");
          deleteTaskButton.classList.add("remove-button");

          // Create <i> element for edit icon
          const deleteTaskIcon = document.createElement("i");
          deleteTaskIcon.classList.add("fa-solid", "fa-trash-can");

          // Append the trash icon to the remove button
          deleteTaskButton.appendChild(deleteTaskIcon);

          deleteTaskButton.addEventListener("click", () => {
            deleteTask(task.task_id, activity_id);
          });

          // Append the member name and remove button to the list item
          listItem.appendChild(taskName);
          listItem.appendChild(editButton);
          listItem.appendChild(deleteTaskButton);

          // Append the list item to the appropriate list based on task status
          if (task.tasks_status === "pending") {
            todoList.appendChild(listItem);
          } else if (task.tasks_status === "in_progress") {
            doingList.appendChild(listItem);
          } else if (task.tasks_status === "completed") {
            doneList.appendChild(listItem);
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function addTask(activity_id) {
  // retrieves the value of the "activityId" data attribute from the HTML element that triggered an event
  //   variable from old event listener. delete if loop is working
  //   const activity_id = e.currentTarget.dataset.activityId;
  const dialog = document.createElement("dialog");
  // need to get the user id to insert into the DB
  const form = document.createElement("form");
  form.id = "addTask";
  form.innerHTML = `
        <label for="add_task_name">Name:</label>
        <input type="text" id="add_task_name" name="task_name">

        <label for="add_task_description">Description:</label>
        <textarea id="add_task_description" name="task_description"></textarea>

        <label for="add_task_status">Status:</label>
        <select id="add_task_status" name="task_status">
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
        </select>

        <label for="add_task_priority">Priority:</label>
        <select id="add_task_priority" name="task_priority">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
        </select>

        <label for="add_assigned_to">Assigned To:</label>
        <input type="number" id="add_assigned_to" name="assigned_to">

        <label for="add_due_date">Due Date:</label>
        <input type="date" id="add_due_date" name="due_date">

        <input type="submit" id="saveTask" value="Save">
    `;

  const closeTaskIcon = document.createElement("i");
  closeTaskIcon.classList.add("fa-solid", "fa-rectangle-xmark");

  // Add classes to elements for styling
  dialog.classList.add("task-dialog");
  closeTaskIcon.classList.add("close-button");
  form.classList.add("dialog-form");

  // Append form and button to dialog, then dialog to the document
  dialog.append(form);
  dialog.append(closeTaskIcon);
  document.body.appendChild(dialog);

  // Display the dialog when function is called
  dialog.showModal();

  // Close the dialog box when the button close is clicked
  closeTaskIcon.addEventListener("click", function () {
    dialog.close();
  });
  //WHEN CLICK SAVE, GET THE INFO AND insert ON DB

  document.getElementById("saveTask").addEventListener("click", (e) => {
    e.preventDefault();
    const errorDialog = document.querySelector("#formsContainerDialog");
    const errorMessage = document.querySelector(".errorMessage");

    const taskData = {
      task_name: document.getElementById("add_task_name").value,
      task_description: document.getElementById("add_task_description").value,
      tasks_status: document.getElementById("add_task_status").value,
      task_priority: document.getElementById("add_task_priority").value,
      assigned_to: parseInt(document.getElementById("add_assigned_to").value),
      due_date: new Date(document.getElementById("add_due_date").value),
      updated_at: new Date().toISOString().slice(0, 19).replace("T", " "), // Format: 'YYYY-MM-DD HH:MM:SS'
    };
    axios
      .post("/api/activity/task/add_new/" + activity_id, taskData)
      .then((res) => {
        dialog.close();
        console.log(res.data);
        document.body.removeChild(dialog);
        renderActivity(activity_id);
      })
      .catch((error) => {
        // displays the error in the modal
        errorDialog.showModal();
        errorMessage.innerText = error.response.data.message;
        setTimeout(() => {
          errorDialog.close();
        }, "3000");
      });
  });
}

function renderSidebarActivities() {
  const page = document.getElementById("page");
  const sidebar = document.createElement("div");
  sidebar.classList.add("sidebar");
  sidebar.innerHTML = " ";
  //Get all activities from DB and render here
  axios.get("/api/activity/getAll").then((res) => {
    res.data.forEach((activity) => {
      //Declared the renderActivity() and deleteActivity() as global scope on the bottom of the page
      const activityContainer = document.createElement("div");
      activityContainer.classList.add("activityContainer");
      activityContainer.innerHTML = `
      <a href="#" onclick='renderActivity(${activity.activity_id})'>${activity.activity_name}</a>
      `;
      sidebar.appendChild(activityContainer);
    });
    page.append(sidebar);
  });
}

// delete an activity
function deleteActivity(activity_id) {
  const errorDialog = document.querySelector("#formsContainerDialog");
  const errorMessage = document.querySelector(".errorMessage");
  const mainContent = document.querySelector("#main_content");

  axios
    .delete("/api/activity/delete/" + activity_id)
    .then((res) => {
      renderDashboard();
    })
    .catch((error) => {
      // displays the error in the modal
      errorMessage.innerText = error.response;
      errorDialog.showModal();
      setTimeout(() => {
        errorDialog.close();
      }, "3000");
    });
}

// delete an task
function deleteTask(task_id, activity_id) {
  axios
    .delete("/api/activity/task/delete/" + task_id)
    .then((res) => {
      renderActivity(activity_id);
    })
    .catch((error) => {
      // displays the error in the modal
      errorDialog.showModal();
      errorMessage.innerText = error.response.data.message;
      setTimeout(() => {
        errorDialog.close();
      }, "3000");
    });
}

// post new activities inserted with AI assist
function getActivity() {
  const form = document.querySelector("form");
  const errorDialog = document.querySelector("#formsContainerDialog");
  const errorMessage = document.querySelector(".errorMessage");
  const messageInput = document.querySelector("#message");
  form.addEventListener("submit", (e) => {
    displayLoading();
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      activity: formData.get("message"),
    };

    //POST ACTIVITY NAME
    axios
      .post("/api/activity", data)
      .then((res) => {
        hideLoading();

        //Render the new tasks on dashboard after posting it
        if (res.data && res.data.activity_id) {
          renderActivity(res.data.activity_id);
        }
        //Refresh sidebar activities
        renderSidebarActivities();
        messageInput.value = "";
      })
      .catch((error) => {
        // displays the error in the modal (if activity already exists)
        errorDialog.showModal();
        errorMessage.innerText = error.response.data.message;
        setTimeout(() => {
          errorDialog.close();
        }, "3000");
        userActivity.value = "";
      });
  });
}

// post new activities inserted by the user
function postUserActivity() {
  const form = document.querySelector("#userActivityForm");
  const errorDialog = document.querySelector("#formsContainerDialog");
  const errorMessage = document.querySelector(".errorMessage");
  const userActivity = document.querySelector("#userActivity");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      activity: formData.get("userActivity"),
    };
    axios
      .post("/api/activity/userAdd", data)
      .then((res) => {
        // refresh the dashboard
        renderDashboard();
      })
      .catch((error) => {
        // displays the error in the modal (if activity already exists)
        errorDialog.showModal();
        errorMessage.innerText = error.response.data.message;
        setTimeout(() => {
          errorDialog.close();
        }, "3000");
        userActivity.value = "";
      });
  });
}

//IF NO ACTIVITY TELL THE USER TO SHOW A MESSAGE
function renderLastActivity() {
  axios
    .get("/api/activity/getLast")
    .then((res) => {
      renderActivity(res.data.activity_id);

      const nullContainer = document.querySelector(".null-container");
      if (nullContainer) {
        nullContainer.remove();
      }
    })
    .catch((error) => {
      // No activity exists. Handle this case accordingly.
      // For example, show a message to the user indicating no activities are present.
      const content = document.getElementById("main_content");

      const nullContainer = document.createElement("div");
      nullContainer.classList.add("null-container");

      const heading = document.createElement("h3");
      heading.textContent = error.response.data.message;

      const img = document.createElement("img");
      img.src = "../../styles/img/work.png";

      nullContainer.appendChild(heading);
      nullContainer.appendChild(img);
      content.append(nullContainer);
      console.error("Error fetching the last activity:", error);
    });
}

function editTask(task, activity_id) {
  const errorDialog = document.querySelector("#formsContainerDialog");
  const errorMessage = document.querySelector(".errorMessage");

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
        <input type="number" id="edit_assigned_to" name="assigned_to" value="${
          task.assigned_to || ""
        }">

        <label for="edit_due_date">Due Date:</label>
        <input type="date" id="edit_due_date" name="due_date" value="${
          task.due_date || "0001 - 01 - 01"
        }">

        <input type="submit" id="saveTask" value="Save">
    `;

  const closeTaskIcon = document.createElement("i");
  closeTaskIcon.classList.add("fa-solid", "fa-rectangle-xmark");

  // Add classes to elements for styling
  dialog.classList.add("task-dialog");
  closeTaskIcon.classList.add("close-button");
  form.classList.add("dialog-form");

  // Append form and button to dialog, then dialog to the document
  dialog.append(form);
  dialog.append(closeTaskIcon);
  document.body.appendChild(dialog);

  // Display the dialog when function is called
  dialog.showModal();

  // Close the dialog box when the button close is clicked
  closeTaskIcon.addEventListener("click", function () {
    dialog.close();
  });

  //WHEN CLICK SAVE, GET THE INFO AND PUT ON DB
  document.getElementById("saveTask").addEventListener("click", (e) => {
    e.preventDefault();
    const taskData = {
      task_name: document.getElementById("edit_task_name").value,
      task_description: document.getElementById("edit_task_description").value,
      tasks_status: document.getElementById("edit_task_status").value,
      task_priority: document.getElementById("edit_task_priority").value,
      assigned_to: parseInt(document.getElementById("edit_assigned_to").value),
      due_date: new Date(document.getElementById("edit_due_date").value),
      updated_at: new Date().toISOString().slice(0, 19).replace("T", " "), // Format: 'YYYY-MM-DD HH:MM:SS'
    };

    axios
      .put("/api/activity/task/update/" + task.task_id, taskData)
      .then((response) => {
        dialog.close();
        console.log(response.data);
        document.body.removeChild(dialog);
        renderActivity(activity_id);
      })
      .catch((error) => {
        errorDialog.showModal();
        errorMessage.innerText = error.response.data.message;
        setTimeout(() => {
          errorDialog.close();
        }, "3000");
        console.error(error);
      });
  });
}

function editActivity(activity) {
  const errorDialog = document.querySelector("#formsContainerDialog");
  const errorMessage = document.querySelector(".errorMessage");
  const mainContent = document.querySelector("#main_content");
  // Create elements
  const dialog = document.createElement("dialog");

  const form = document.createElement("form");
  form.id = "editActivityForm";
  form.innerHTML = `
        <label for="edit_activity_name">Name:</label>
        <input type="text" id="edit_activity_name" name="activity_name" value="${
          activity.activity_name || ""
        }">

        <label for="team_id">Team:</label>
        <select id="team_id" name="team_id">
            <option value="">Select a team</option>
        </select>

        <input type="submit" id="saveActivity" value="Save">
    `;

  const teamSelect = document.getElementById("team_id");

  // Fetch users from the server using your getAllUsers method or API endpoint
  axios
    .get("/api/teams/getAll")
    .then((res) => {
      console.log(res);
      // Iterate through the users and create <option> elements
      res.data.forEach((team) => {
        const option = document.createElement("option");
        option.value = team.user_id; // Set the value to the user_id
        option.text = team.team_name; // Set the text to the user's name
        teamSelect.appendChild(option); // Append the option to the select list
      });
    })
    .catch((error) => {
      console.error("Error fetching teams:", error);
    });

  const closeActivityIcon = document.createElement("i");
  closeActivityIcon.classList.add("fa-solid", "fa-rectangle-xmark");

  // Add classes to elements for styling
  dialog.classList.add("task-dialog");
  closeActivityIcon.classList.add("close-button");
  form.classList.add("dialog-form");

  // Append form and button to dialog, then dialog to the document
  dialog.append(form);
  dialog.append(closeActivityIcon);
  document.body.appendChild(dialog);

  // Display the dialog when function is called
  dialog.showModal();

  // Close the dialog box when the button close is clicked
  closeActivityIcon.addEventListener("click", function () {
    dialog.close();
  });

  //WHEN CLICK SAVE, GET THE INFO AND PUT ON DB

  document.getElementById("saveActivity").addEventListener("click", (e) => {
    e.preventDefault();
    const activityData = {
      activity_name: document.getElementById("edit_activity_name").value,
      team_id: parseInt(document.getElementById("team_id").value),
    };

    axios
      .put("/api/activity/update/" + activity.activity_id, activityData)
      .then((response) => {
        dialog.close();
        console.log(response.data);
        document.body.removeChild(dialog);
        renderActivity(activity.activity_id);
      })
      .catch((error) => {
        errorDialog.showModal();
        errorMessage.innerText = error.response.data.message;
        setTimeout(() => {
          errorDialog.close();
        }, "3000");
        console.error(error);
      });
  });
}

function displayLoading() {
  const loader = document.getElementById("loader-container");
  // const page = document.getElementById("page");
  // page.replaceChildren(loader);
  loader.style.visibility = "visible";
}
function hideLoading() {
  const loader = document.getElementById("loader-container");
  loader.style.visibility = "hidden";
}

window.renderActivity = renderActivity;
window.deleteActivity = deleteActivity;
window.editTask = editTask;
window.addTask = addTask;

export default renderDashboard;
