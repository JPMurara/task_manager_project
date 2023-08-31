//Start express
const express = require("express");

//Connect with database
const db = require("../database/db.js");

//bcrypt for password encryption
const bcrypt = require("bcrypt");

//Create router for easy access
const router = express.Router();

// handler for register new user
router.post("/signup", (req, res) => {
  //Deconstruct the form
  const { name, signupEmail, signupPassword, confirmPassword } = req.body;
  if (!name || !signupEmail || !signupPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Name, email, password, or confirm password is missing",
    });
  }
  // check if passwords match
  if (signupPassword === confirmPassword) {
    const checkedPassword = isStrongPassword(signupPassword);
    // check if password is strong
    if (checkedPassword) {
      //Hash password with bcrypt
      const hashPassword = generateHash(signupPassword);
      const newUser = { name, signupEmail, hashPassword: hashPassword };
      // checks if user already exists
      const sql = `SELECT * FROM users where email=$1`;
      db.query(sql, [newUser.signupEmail]).then((dbRes) => {
        if (dbRes.rows.length > 0) {
          res.status(400).json({
            success: false,
            message: "User alredy registered. Please go to Login area",
          });
        } else {
          //SQL query to insert user into the database
          const sql = `
                INSERT INTO users (name, email, hash_password)
                VALUES ($1, $2, $3);
            `;
          //Query the database with the sql and values
          db.query(sql, [
            newUser.name,
            newUser.signupEmail,
            newUser.hashPassword,
          ])
            .then(() => {
              res.status(200).json({
                success: true,
                message: "You are registered! Please login now",
              });
            })
            .catch((error) => {
              res.status(400).json({
                success: false,
                message: "Bad request",
              });
            });
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Password not strong enough. Try again",
      });
    }
  } else {
    res.status(400).json({
      success: false,
      message: "Password do not match. Try again",
    });
  }
});

//Function to generate a hashed password
function generateHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}
// Function to check if the password is strong:
// contains at least one lowercase char: ^(?=.*[a-z])
// contains at least one uppercase char: ^(?=.*[A-Z])
// contains at least one digit: (?=.*\d)
// contains at least one special char from the set(@$!%*?&): (?=.*[@$!%*?&])
// this sequence of char ([A-Za-z\d@$!%*?&]{4,}) must be matched to fulfill above requirements and contains at least 4 char
// uses the test method to check if the password matches the pattern, returns T/F
function isStrongPassword(password) {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,}$/;
  return regex.test(password);
}

//Export signup route
module.exports = router;
