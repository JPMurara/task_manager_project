//Make connection with Task Manager database
const pg = require("pg");
const fs = require("fs");

// imports the dotenv package to load enviormental variables from the .env
require("dotenv").config();

// creates an instance of the DB connection pool. Pool is a mechanism used to manage and efficiently reuse DB connections. It keeps the DB connection and is not necessary to open/close connection at each DB interaction
const db = new pg.Pool({
    // user: "postgres",
    host: "localhost",
    database: "task_manager",
    password: process.env.DB_PASSWORD,
});

// !!!! Before running the code, make sure to enter in the terminal: CREATE DATABASE task_manager IF NOT EXISTS; !!!!
//
async function createTables() {
    try {
        // reads the content of the schema.sql and stores it in the sql variable. The file content is interpreted as text encoded in UTF-8
        const sql = fs.readFileSync(__dirname + "/schema.sql", "utf8");
        // established db connection and wait for it to happen before moving one
        const client = await db.connect();
        // executes the querry and wait for it to happen before moing on
        await client.query(sql);
        // released the db connection back to the connection pool to make it available for other operations
        client.release();
    } catch (err) {
        console.error("Error creating tables:", err);
    }
}

//Export db to be use in other files
module.exports = { db, createTables };
