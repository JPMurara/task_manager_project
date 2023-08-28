//Make connection with Task Manager database
const pg = require("pg");

// imports the dotenv package to load enviormental variables from the .env
require("dotenv").config();

// creates an instance of the DB connection pool. Pool is a mechanism used to manage and efficiently reuse DB connections. It keeps the DB connection and is not necessary to open/close connection at each DB interaction
const db = new pg.Pool({
  database: "task_manager",
  password: process.env.DB_PASSWORD,
});

//Export db to be use in other files
module.exports = db;
