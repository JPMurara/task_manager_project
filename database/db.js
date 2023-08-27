//Make connection with Task Manager database
const pg = require("pg");
const db = new pg.Pool({
    database: "task_manager",
});

//Export db to be use in other files
module.exports = db;
