import renderHeader from "./header.js";

function renderAuthForms() {
  const page = document.getElementById("page");

  const heading = document.createElement("h1");
  heading.textContent = "Welcome!";

  //Div to store login and signup forms
  const formsContainer = document.createElement("div");
  formsContainer.id = "formsContainer";

  //SIGN UP FORM
  const signupForm = document.createElement("form");
  signupForm.id = "signupForm";
  signupForm.innerHTML = `
            <h2>Sign Up</h2>
            <span id="message"></span><br>

            <label for="name">Name:</label>
            <input type="text" name="name" id="name" required><br>
           
            <label for="email">Email</label>
            <input type="email" name="email" id="email" required></input><br>
            
            <label for="password">Password: </label>
            <input type="password" name="password" id="password" required><br>
            
            <label for="confirm-password">Confirm Password: </label>
            <input type="password" name="confirm-password" id="confirm-password" required><br>
            
            <button type="submit">Signup</button>
        `;

  //LOGIN FORM
  const loginForm = document.createElement("form");
  loginForm.id = "loginForm";
  loginForm.innerHTML = `
        <h2>Login</h2>
        <span id="message"></span><br>

        <label for="email">Email</label>
        <input type="email" name="email" id="email" required></input><br>
        

        <label for="password">Password: </label>
        <input type="password" name="password" id="password" required><br>
        
        <button type="submit">Login</button>
    `;

  //Replace the content of the page
  formsContainer.appendChild(signupForm);
  formsContainer.appendChild(loginForm);
  page.replaceChildren(heading, formsContainer);

  // Attach event listeners
  signupEventListener(signupForm);
  loginEventListener(loginForm);
}

function signupEventListener(form) {
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
}

function loginEventListener(form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    console.log(data);
    console.log(JSON.stringify(data));

    axios
      .post("/api/sessions", data)
      .then((response) => {
        console.log(response.data.message);
        console.log(response);
        //RENDER DASHBOARD
        renderHeader();
      })
      .catch((error) => {
        // Handle errors from the server response
        const message = document.getElementById("message");
        const errorMessage = error.response.data.message;
        if (error.response) {
          if (error.response.status === 400) {
            message.innerText = errorMessage;
            console.log("Error", errorMessage);
          } else {
            message.innerText = errorMessage;
            console.log("An error occurred: ", errorMessage);
          }
        } else {
          message.innerText = errorMessage;
          console.log("An error occurred: ", errorMessage);
        }
      });
  });
}

//Function to check letters, numbers and symbols
function isStrongPassword(password) {
  const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

//Export render signup form
export default renderAuthForms;
