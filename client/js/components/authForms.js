import renderDashboard from "./dashboard.js";
import { loginStatus } from "./header.js";

function renderAuthForms() {
  const page = document.getElementById("page");

  //Div to store login and signup forms
  const formsContainer = document.createElement("div");
  formsContainer.id = "formsContainer";

  //SIGN UP FORM
  const signupForm = document.createElement("form");
  signupForm.className = "form";
  signupForm.innerHTML = `
            <h2>Sign up</h2>
  
            <dialog class="dialog">
              <p class="errorMessage"></p>
            </dialog>

            <input type="text" name="name" id="name" placeholder="name" required><br>
           
            <input type="email" name="signupEmail" id="signupEmail" placeholder="email" required></input><br>
            
            <input type="password" name="signupPassword" id="signupPassword" placeholder="password" required><br>
            
            <input type="password" name="confirmPassword" id="confirmPassword" placeholder="confirm our password" required><br>
            
            <button type="submit" class="submitBtn">Register</button>
        `;

  //LOGIN FORM
  const loginForm = document.createElement("form");
  loginForm.className = "form";
  loginForm.innerHTML = `
        <h2>Login</h2>
        
        <dialog class="dialog">
          <p class="errorMessage"></p>
        </dialog>

        <input type="email" name="loginEmail" id="loginEmail" placeholder="email" required></input><br>
        
        <input type="password" name="loginPassword" id="loginPassword" placeholder="password" required><br>
        
        <button type="submit" class="submitBtn">Login</button>
    `;

  //Replace the content of the page
  formsContainer.appendChild(signupForm);
  formsContainer.appendChild(loginForm);
  page.replaceChildren(formsContainer);

  // Attach event listeners
  signupEventListener(signupForm);
  loginEventListener(loginForm);
}

// SignUp form Submission
function signupEventListener(form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const password = form.querySelector("#signupPassword");
    const confirmPassword = form.querySelector("#confirmPassword");
    const message = document.getElementById("signupFormMessage");
    const errorDialog = form.querySelector(".dialog");
    const errorMessage = form.querySelector(".errorMessage");
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
            loginStatus();
          })
          .catch((error) => {
            // Handle errors from the server response
            errorDialog.showModal();
            errorMessage.innerText = error.response.data.message;
            setTimeout(() => {
              errorDialog.close();
            }, "3000");
            password.value = "";
            confirmPassword.value = "";
          });
      } else {
        const message =
          "Password has to contain at least:\n1 uppercase and 1 lowercase\n1 numer\n1 special character (@,$,!,%,*,?,&)\n4 characters in lenght";
        errorDialog.showModal();
        errorMessage.innerText = message;

        setTimeout(() => {
          errorDialog.close();
        }, "8000");
        password.value = "";
        confirmPassword.value = "";
      }
    } else {
      const message = "Password do not match. Try again";
      errorDialog.showModal();
      errorMessage.innerText = message;
      setTimeout(() => {
        errorDialog.close();
      }, "3000");
      password.value = "";
      confirmPassword.value = "";
    }
  });
}

// Login form Submission
function loginEventListener(form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const loginEmail = form.querySelector("#loginEmail");
    const loginPassword = form.querySelector("#loginPassword");
    const errorDialog = form.querySelector(".dialog");
    const errorMessage = form.querySelector(".errorMessage");

    // const formData = new FormData(form);
    const data = Object.fromEntries(new FormData(form));
    // const data = {
    //   email: formData.get("email"),
    //   password: formData.get("password"),
    // };
    axios
      .post("/api/sessions", data)
      .then((response) => {
        loginStatus();
        renderDashboard();
      })
      .catch((error) => {
        // Handle errors from the server response
        errorDialog.showModal();
        errorMessage.innerText = error.response.data.message;
        setTimeout(() => {
          errorDialog.close();
        }, "3000");
        // const message = document.getElementById("loginFormMessage");
        // message.innerText = error.response.data.message;
        loginEmail.value = "";
        loginPassword.value = "";
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
