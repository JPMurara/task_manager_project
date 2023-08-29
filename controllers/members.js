//Start express
const express = require("express");

//Connect with database
const db = require("../database/db.js");

//Create router for easy access
const router = express.Router();

router.get("/get/:user_id", (req, res) => {
    //user_id initializing
    const user_id = req.params.user_id;

    //SQL query to get member using user_id along with all the teams in database
    const sql = `
        SELECT 
            u.name , 
            u.email,
            t.team_id AS teamId, 
            t.team_name AS teamName
        FROM users u
        JOIN members m ON u.user_id = m.user_id
        JOIN teams t ON m.team_id = t.team_id
        WHERE m.user_id = $1
        `;
    
    //Query the database with sql and values
    db.query(sql, [user_id])
        .then((result) => {
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Member not found' });
            }
            const member = {
                email: result.rows[0].email,
                name: result.rows[0].name,
                teams: result.rows.map(row => ({
                    team_name: row.teamname,
                    team_id: row.teamid
                }))
              };
        
            res.status(200).json(member);
        })
        .catch((err) => {
            console.error("database error encountered: ", err);
            res.status(500).json({ message: err });
        })

})

router.post("/", (req, res) => {
    //Deconstruct the form 
    const {team_id, user_id, is_leader} = req.body;

    //SQL query to insert team into the database
    const sql = `
            INSERT INTO members (team_id, user_id, is_leader)
            VALUES ($1, $2, $3)
            RETURNING member_id`;
    
    //ERROR HANDLING: checking if team_id was provided
    if(!team_id || team_id == 0)
        return res.status(400).json({
            message : "Failed to locate Team"
        });

    //ERROR HANDLING: checking if user_id was provided
    if(!user_id || user_id == 0)
        return res.status(400).json({
            message : "Failed to locate User"
        });
    
    //Query the database with sql and values
    db.query(sql, [team_id, user_id, is_leader])
        .then(() => {
            res.status(200).json({message: "Member added successfully"});
        })
        .catch((err) => {
            console.log(err.constraint);
            if (err.constraint === "unique_user_team_combination") {
                return res
                    .status(409)
                    .json({ message: `User already exists in the team!` });
            }
            console.error("database error encountered: ", err);
            res.status(500).json({ message: err });
        })
    
})

router.put("/update/:member_id", (req, res) => {
    //member_id initializing
    const member_id = req.params.member_id;

    //Deconstruct the form
    const {is_leader} = req.body;

    //SQL query to update the member in database
    const sql = `
            UPDATE members
            SET is_leader = $1
            WHERE member_id = $2`;

    //ERROR HANDLING: checking if member_id was provided
    if(!member_id || member_id == 0)
        return res.status(400).json({
            message : "Failed to locate member!"
        });

    //Query the database with sql and values
    db.query(sql, [is_leader, member_id])
        .then(() => {
            res.status(200).json({message: "Member updated successfully"});
        })
        .catch((err) => {
            console.log(err.constraint);
            if (err.constraint === "unique_user_team_combination") {
                return res
                    .status(409)
                    .json({ message: `Member already exists!` });
            }
            console.error("database error encountered: ", err);
            res.status(500).json({ message: err });
        })
})

router.delete("/remove/:member_id", (req, res) => {
    //member_id initializing
    const member_id = req.params.member_id;

    //SQL query to delete the team from database
    const sql = `
            DELETE FROM members
            WHERE member_id = $1`;

    //ERROR HANDLING: checking if member_id was provided
    if(!member_id || member_id == 0)
        return res.status(400).json({
            message : "Failed to locate team!"
        });

    //Query the database with sql and values
    db.query(sql, [member_id])
        .then(() => {
            res.status(200).json({message: "Member removed successfully"});
        })
        .catch((err) => {
            console.error("database error encountered: ", err);
            res.status(500).json({ message: err });
        })
})

module.exports = router;