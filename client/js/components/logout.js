import renderHeader from "./header.js";

function renderLogout() {
    axios
        .post("/api/sessions/logout")
        .then(() => {
            console.log("logging out");
            //BACK TO HOME PAGE AND REFRESH HEADER
            renderHeader();
        })
        .catch((error) => {
            console.error("Error logging out:", error.message);
        });
}

export default renderLogout;
