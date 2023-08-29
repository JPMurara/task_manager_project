import renderDashboard from "./dashboard.js";
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
            <span id="signupFormMessage"></span><br>

            <label for="name">Name:</label>
            <input type="text" name="name" id="name" required><br>
           
            <label for="email">Email</label>
            <input type="email" name="signupEmail" id="signupEmail" required></input><br>
            
            <label for="password">Password: </label>
            <input type="password" name="signupPassword" id="signupPassword" required><br>
            
            <label for="confirmPassword">Confirm Password: </label>
            <input type="password" name="confirmPassword" id="confirmPassword" required><br>
            
            <button type="submit">Signup</button>
        `;

  //LOGIN FORM
  const loginForm = document.createElement("form");
  loginForm.id = "loginForm";
  loginForm.innerHTML = `
        <h2>Login</h2>
        <span id="loginFormMessage"></span><br>

        <label for="email">Email</label>
        <input type="email" name="loginEmail" id="loginEmail" required></input><br>
        

        <label for="password">Password: </label>
        <input type="password" name="loginPassword" id="loginPassword" required><br>
        
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
    const password = form.querySelector("#signupPassword");
    const confirmPassword = form.querySelector("#confirmPassword");
    const message = document.getElementById("signupFormMessage");
    //Clear previous error messages
    message.innerText = "";
    //Data Collection
    const data = Object.fromEntries(new FormData(form));
    // checks if passwords match
    if (password.value === confirmPassword.value) {
      // checks if password is strong
      const checkedPassword = isStrongPassword(password.value);
      if (checkedPassword) {
        axios
          .post("/api/users/signup", data)
          .then((response) => {
            message.innerText = response.data.message;
            //Render a modal to confirm the account creation
            renderDashboard();
          })
          .catch((error) => {
            // Handle errors from the server response
            message.innerText = error.response.data.message;
          });
      } else {
        message.innerText =
          "Password not strong enough. Try again.\nPassword has to contain at least:\nONE uppercase and ONE lowercase\nONE numer\nONE special character (@,$,!,%,*,?,&)\nFOUR characters in lenght";
      }
    } else {
      message.innerText = "Password do not match. Try again.";
    }
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

    axios
      .post("/api/sessions", data)
      .then((response) => {
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
          } else {
            message.innerText = errorMessage;
          }
        } else {
          message.innerText = errorMessage;
        }
      });
  });
}

//Function to if password matches the criteria of a strong password
function isStrongPassword(password) {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,}$/;
  return regex.test(password);
}

//Export render signup form
export default renderAuthForms;
