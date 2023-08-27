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
    const { email, password } = req.body;

    //ERROR HANDLING
    if (!email || !password) {
        return res
            .status(400)
            .json({ message: "Email or password is missing" });
    }

    const sql = `SELECT * FROM users WHERE email = $1`;

    //Query the database with the sql and values
    return db
        .query(sql, [email])
        .then((dbRes) => {
            if (dbRes.rows.length === 0) {
                return res
                    .status(401)
                    .json({ message: "Invalid email or password" });
            }

            const user = dbRes.rows[0];
            const hashedPassword = user.hash_password;

            console.log("Raw Password:", password);
            console.log("Hashed Password from DB:", hashedPassword);

            if (isValidPassword(password, hashedPassword)) {
                req.session.userId = user.id;
                req.session.email = user.email;
                req.session.name = user.name;
                req.session.isAuthenticated = true;

                res.status(200).json({
                    message: "Login successful",
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                    },
                });
            }
        })
        .catch((error) => {
            console.error("database error encountered:", error);
            res.status(500).json({ message: "Internal server error" });
        });
});

//GET SESSION NAME FOR FRONT-END ex. "Logged in as Bruno"
router.get("/status", (req, res) => {
    if (!req.session.isAuthenticated) {
        console.log("Not logged in");

        return res.status(400).json({ message: "Not logged in" });
    }

    console.log("User is logged in");

    res.json({
        email: req.session.email,
        name: req.session.name,
    });
});

router.post("/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error("Error destroying session:", error);
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
