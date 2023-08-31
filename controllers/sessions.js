//Start express
const express = require("express");
//Connect with database
const db = require("../database/db.js");
//bcrypt for encrypt password
const bcrypt = require("bcrypt");
//Create router for easy access
const router = express.Router();

router.post("/", (req, res) => {
  //Deconstruct the form
  const { loginEmail, loginPassword } = req.body;
  //ERROR HANDLING
  if (!loginEmail || !loginPassword) {
    return res.status(400).json({ message: "Email or password is missing" });
  }
  const sql = `SELECT * FROM users WHERE email=$1`;
  //Query the database to check if the user already exists
  db.query(sql, [loginEmail])
    .then((dbRes) => {
      if (!dbRes.rows[0]) {
        return res.status(401).json({
          success: false,
          message: "User not registered yet.",
        });
      }
      //   checks if the password matches with DB password
      const hashedPassword = dbRes.rows[0].hash_password;
      const validPassword = isValidPassword(loginPassword, hashedPassword);
      if (validPassword) {
        // creates the sessionUser object
        req.session.sessionUser = {
          userId: dbRes.rows[0].user_id,
          name: dbRes.rows[0].name,
          email: dbRes.rows[0].email,
          isAuthenticated: true,
        };
        // sends the sessionUser to the front-end
        res.status(200).json({
          success: true,
          message: "Login successful",
          sessionUser: req.session.sessionUser,
        });
      } else {
        // if passwords dont match
        res.status(401).json({
          success: false,
          message: "Email or Password is wrong, try again!",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    });
});

//GET SESSION NAME FOR FRONT-END ex. "Logged in as Bruno"
router.get("/status", (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.status(400).json({ message: "Not logged in" });
  }
  res.json({
    email: req.session.email,
    name: req.session.name,
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      res.status(500).json({ message: "Internal server error" });
    } else {
      res.status(200).json({ message: "Logged out successfully" });
    }
  });
});

function isValidPassword(password, passwordHash) {
  return bcrypt.compareSync(password, passwordHash);
}

module.exports = router;
