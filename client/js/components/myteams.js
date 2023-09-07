import { renderHeader } from "./header.js";

function renderTeams() {
    const page = document.getElementById("page");

    const content = document.createElement("div");
    content.classList.add("content");
    content.id = "main_content";
    page.replaceChildren(content);
    renderSidebarTeams();
}

function renderSidebarTeams() {
    const page = document.getElementById("page");
  
    const sidebar = document.createElement("div");
    sidebar.classList.add("sidebar");
  
    //Get activities from DB and render here
    axios.get("/api/team/members/get/1").then((res) => {
      let teamsAnchors = ``;
      res.data.teams.forEach((team) => {
        //Declared the renderActivity() as global scope on the bottom of the page
        teamsAnchors += `<a href="#" onclick='renderTeam(${team.team_id})'>${team.team_name}</a>`;
      });
  
      sidebar.innerHTML = teamsAnchors;
    });
    page.append(sidebar);
}

function renderTeam(team_id) {
  const content = document.getElementById("main_content");
  //creating a container to hold the cards
  let card_container = document.getElementById("stats");

  if(card_container == null){
      card_container = document.createElement("div");
      card_container.classList.add("card-container");
      card_container.id = "stats";
  }
  axios.get("/api/teams/get/"+team_id)
    .then((res) => {
      if(res.data != null){
        let template = ``;
        content.innerHTML = `
          <div class="action-panel">
              <h2>${res.data.team_name ?? "-"}</h2>
              <button id="add-button"><i class="fa-solid fa-user-plus"></i></button>
              <button id="delete-button"><i class="fa-solid fa-trash-can"></i></button>
              <button id="update-button"><i class="fa-solid fa-pen-to-square"></i></button>
          </div>
          <div class="members-container">
              <h2>Members</h2>
              <ul id="member-list">
              </ul>
          </div>`;
        document.getElementById("add-button").addEventListener("click", () => {
            addTeamMember(team_id)
        });
        res.data.activities.forEach(activity => {
            template += `
                <div class="card">
                    <h2>${activity.activity_name}</h2>
                    <div class="count">Pending : ${activity.num_pending_tasks}</div>
                    <div class="count">In Progress : ${activity.num_in_progress_tasks}</div>
                    <div class="count">Completed : ${activity.num_completed_tasks}</div>
                </div>`; 
        });
        const memberList = document.getElementById("member-list");
        res.data.members.forEach(member => {
          const listItem = document.createElement("li");
          listItem.classList.add("member-item");
              
          // Member name
          const memberName = document.createElement("span");
          memberName.classList.add("member-name");
          memberName.textContent = member.user_name;
              
          // Remove button
          const removeButton = document.createElement("button");
          removeButton.classList.add("remove-button");
          removeButton.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
          removeButton.addEventListener("click", () => {
              axios.delete("/api/team/members/remove/"+member.member_id)
                  .then((res) => {
                      renderTeam(team_id);
                  })
          });
          listItem.appendChild(memberName);
          listItem.appendChild(removeButton);
          memberList.appendChild(listItem);
        })
      card_container.innerHTML = template;
      content.appendChild(card_container);
    }
  });
    
    
}

function addTeamMember(team_id) {
    // Create elements
    const dialog = document.createElement("dialog");
  
    const form = document.createElement("form");
    form.id = "addTeamMemberForm";

    form.innerHTML = `
          <label for="edit_task_name">Select User</label>
            <select id="user_id" name="user_id">
            <option value="" >Please select a user to add</option>
            </select>
          <input type="submit" id="saveUser" value="Save">
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
    const userSelect = document.getElementById('user_id');
  
    // Fetch users from the server using your getAllUsers method or API endpoint
    axios.get('/api/users/getAll')
      .then(res => {
        // Iterate through the users and create <option> elements
        res.data.forEach(user => {
          const option = document.createElement('option');
          option.value = user.user_id; // Set the value to the user_id
          option.text = user.name; // Set the text to the user's name
          userSelect.appendChild(option); // Append the option to the select list
        });
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
    //WHEN CLICK SAVE, GET THE INFO AND PUT ON DB
  
    document.getElementById("saveUser").addEventListener("click", () => {
      const newMember = {
        team_id: team_id,
        user_id: document.getElementById("user_id").value,
        is_leader: false
    };
  
      axios
        .post("/api/team/members", newMember)
        .then((response) => {
          dialog.close();
          renderTeam(team_id);
        })
        .catch((error) => {
          console.error(error);
        });
    });
  }
window.renderTeam = renderTeam;
export default renderTeams;