//Start express
const express = require("express");

//Connect with database
const db = require("../database/db.js");

//Create router for easy access
const router = express.Router();

router.get("/getAll", (req, res) => {
    //SQL query to insert team into the database
    const sql = `
            SELECT
                t.team_id,
                t.team_name,
                COUNT(DISTINCT m.user_id) AS num_users,
                COUNT(DISTINCT a.activity_id) AS num_activities
            FROM teams t
            LEFT JOIN members m ON t.team_id = m.team_id
            LEFT JOIN activities a ON t.team_id = a.team_id
            GROUP BY t.team_id, t.team_name
            `;

    //Query the database with sql and values
    db.query(sql)
        .then((result) => {
            res.status(200).json(result.rows);
        })
        .catch((err) => {
            console.error('Database error encountered:', error);
            res.status(500).json({ message: 'An error occurred while fetching teams' });
        })
})

router.get("/get/:team_id", (req, res) => {
    //team_id initializing
    const team_id = req.params.team_id;

    //SQL query to get team using team_id along with team members the team in database
    const sql = `
        SELECT 
            t.team_id,
            t.team_name,
            m.is_leader,
            u.name AS user_name,
            u.email AS user_email
        FROM teams t
        LEFT JOIN members m ON t.team_id = m.team_id
        LEFT JOIN users u ON m.user_id = u.user_id
        WHERE t.team_id = $1
        `;
    
    //Query the database with sql and values
    db.query(sql, [team_id])
        .then((result) => {
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Team not found' });
            }
            const team = {
                team_id: result.rows[0].team_id,
                team_name: result.rows[0].team_name,
                members: result.rows.map(row => ({
                    is_leader: row.is_leader,
                    user_name: row.user_name,
                    user_email: row.user_email
                }))
            };
        
            res.status(200).json(team);
        })
        .catch((err) => {
            console.error("database error encountered: ", err);
            res.status(500).json({ message: err });
        })

})

router.post("/", (req, res) => {
    //Deconstruct the form 
    const {name} = req.body;

    //SQL query to insert team into the database
    const sql = `
            INSERT INTO teams (team_name)
            VALUES ($1)
            RETURNING team_id, team_name`;
    
    //ERROR HANDLING: checking if name was provided
    if(!name || name == "" || name == null)
        return res.status(400).json({
            message : "Team name is missing"
        });
    
    //Query the database with sql and values
    db.query(sql, [name])
        .then(() => {
            res.status(200).json({message: "Team created successfully"});
        })
        .catch((err) => {
            console.log(err.constraint);
            if (err.constraint === "unique_team_name") {
                return res
                    .status(409)
                    .json({ message: `${name} already exists!` });
            }
            console.error("database error encountered: ", err);
            res.status(500).json({ message: err });
        })
    
})

router.put("/update/:team_id", (req, res) => {
    //team_id initializing
    const team_id = req.params.team_id;

    //Deconstruct the form
    const {name} = req.body;

    //SQL query to update the team in database
    const sql = `
            UPDATE teams
            SET team_name = $1
            WHERE team_id = $2`;

    //ERROR HANDLING: checking if name was provided
    if(!name || name == "" || name == null)
        return res.status(400).json({
            message : "Team name is missing"
        });

    //ERROR HANDLING: checking if team_id was provided
    if(!team_id || team_id == 0)
        return res.status(400).json({
            message : "Failed to locate team!"
        });

    //Query the database with sql and values
    db.query(sql, [name, team_id])
        .then(() => {
            res.status(200).json({message: "Team updated successfully"});
        })
        .catch((err) => {
            console.log(err.constraint);
            if (err.constraint === "unique_team_name") {
                return res
                    .status(409)
                    .json({ message: `${name} already exists!` });
            }
            console.error("database error encountered: ", err);
            res.status(500).json({ message: err });
        })
})

router.delete("/delete/:team_id", (req, res) => {
    //team_id initializing
    const team_id = req.params.team_id;

    //SQL query to delete the team from database
    const sql = `
            DELETE FROM teams
            WHERE team_id = $1`;

    //ERROR HANDLING: checking if team_id was provided
    if(!team_id || team_id == 0)
        return res.status(400).json({
            message : "Failed to locate team!"
        });

    //Query the database with sql and values
    db.query(sql, [team_id])
        .then(() => {
            res.status(200).json({message: "Team deleted successfully"});
        })
        .catch((err) => {
            console.error("database error encountered: ", err);
            res.status(500).json({ message: err });
        })
})

module.exports = router;