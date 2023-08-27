//Start express
const express = require("express");

//Connect with database
const db = require("../database/db.js");

//bcrypt for password encryption
const bcrypt = require("bcrypt");

//Create router for easy access
const router = express.Router();

router.post("/signup", (req, res) => {
    //Deconstruct the form
    const { name, email, password, confirmPassword } = req.body;

    //Hash password with bcrypt
    const hash_password = generateHash(password);

    //SQL query to insert user into the database
    const sql = `
         INSERT INTO users (name, email, hash_password)
         VALUES ($1, $2, $3)
         RETURNING user_id, name, email;
     `;

    //ERROR HANDLING
    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({
            message: "Name, email, password, or confirmPassword is missing",
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    //Include isStrongPassword function here
    if (password.length < 4) {
        return res.status(400).json({
            message: "Password must be at least 4 characters long",
        });
    }

    //Query the database with the sql and values
    db.query(sql, [name, email, hash_password])
        .then(() => {
            res.status(200).json({ message: "User created successfully" });
        })
        .catch((error) => {
            console.log(error.constraint);
            if (error.constraint === "users_email_key") {
                return res
                    .status(409)
                    .json({ message: "email already exists" });
            }
            console.error("database error encountered: ", error);
            res.status(500).json({ message: "internal server error" });
        });
});

//Function to generate a hashed password
function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

//Export signup route
module.exports = router;
