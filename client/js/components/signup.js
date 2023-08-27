function renderSignupForm() {
    const page = document.getElementById("page");

    const heading = document.createElement("h1");
    heading.textContent = "Sign Up";

    const form = document.createElement("form");
    form.innerHTML = `
            <span id="message"></span><br>

            <label for="name">Name:</label>
            <input type="text" name="name" id="name"><br>
           

            <label for="email">Email</label>
            <input type="email" name="email" id="email"></input><br>
            

            <label for="password">Password: </label>
            <input type="password" name="password" id="password"><br>
            

            <label for="confirm-password">Confirm Password: </label>
            <input type="password" name="confirm-password" id="confirm-password"><br>
            



            <button type="submit">Signup</button>
        `;

    //Form Submission
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        //Data Collection
        const formData = new FormData(form);

        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
            confirmPassword: formData.get("confirm-password"),
        };

        //COMMENT FOR TEST PURPOSE
        // if (!isStrongPassword(data.password)) {
        //     message.innerText = "Weak password";
        //     console.error("Weak password");
        //     return;
        // }

        //Clear previous error messages
        const message = document.getElementById("message");
        message.innerText = "";

        axios
            .post("/api/users/signup", data)
            .then((response) => {
                message.innerText = response.data.message;
                console.log(response);

                //Render a modal to confirm the account creation
            })
            .catch((error) => {
                // Handle errors from the server response
                if (error.response) {
                    const errorMessage = error.response.data.message;
                    if (error.response.status === 400) {
                        message.innerText = errorMessage;
                        console.log("Error", errorMessage);
                    } else {
                        message.innerText = errorMessage;

                        console.log("An error occurred: ", errorMessage);
                    }
                } else {
                    message.innerText = errorMessage;
                    console.log("An error occurred: ", error.message);
                }
            });
    });
    //Replace the content of the page
    page.replaceChildren(heading, form);
}

//Function to check letters, numbers and symbols
function isStrongPassword(password) {
    const regex =
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

//Export render signup form
export default renderSignupForm;
