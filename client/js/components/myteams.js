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
        console.log(team)
        teamsAnchors += `<a href="#" onclick='renderTeam(${team.team_id})'>${team.team_name}</a>`;
      });
  
      sidebar.innerHTML = teamsAnchors;
    });
    page.append(sidebar);
}

function renderTeam(team_id) {
    const content = document.getElementById("main_content");
    content.innerHTML = `<div class="action-panel">
        <h2>Action Panel</h2>
        <button id="add-button">Add</button>
        <button id="delete-button">Delete</button>
        <button id="update-button">Update</button>
    </div>`;

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
                template = ``;
                template += `
                    <div class="action-panel">
                        <h2>${res.data.team_name ?? "-"}</h2>
                        <button id="add-button"><i class="fa-solid fa-user-plus"></i></button>
                        <button id="delete-button"><i class="fa-solid fa-trash-can"></i></button>
                        <button id="update-button"><i class="fa-solid fa-pen-to-square"></i></button>
                    </div>`;
                res.data.activities.array.forEach(activity => {
                    template += `
                        <div class="card">
                            <h2>${activity.activity_name}</h2>
                            <div class="count count1">45</div>
                            <div class="count count2">67</div>
                            <div class="count count3">89</div>
                        </div>`; 
                });
            }
        });
    card_container.innerHTML = `
    <div class="card">
        <h2>Activity Name</h2>
        <div class="count count1">45</div>
        <div class="count count2">67</div>
        <div class="count count3">89</div>
    </div>`;
    content.appendChild(card_container);
}

window.renderTeam = renderTeam;
export default renderTeams;