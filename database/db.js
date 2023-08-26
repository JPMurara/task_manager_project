//Make connection with Scavenger Hunt database
const pg = require("pg");
const db = new pg.Pool({
    database: "scavenger_hunt",
});

//Export db to be use in other files
module.exports = db;
