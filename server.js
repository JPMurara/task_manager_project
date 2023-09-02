//Start Express
const express = require("express");
const app = express();
const port = 3000;

//Session
require("dotenv").config();
const expressSession = require("express-session");
const pgSession = require("connect-pg-simple")(expressSession);

//Connect to database file
const db = require("./database/db.js");

//CROSS
const cors = require("cors");
app.use(cors());

//Connect to controllers
const usersRoute = require("./controllers/users.js");
const sessionsRoute = require("./controllers/sessions.js");
const activitiesRoute = require("./controllers/activities.js");
const teamsRoute = require("./controllers/teams.js");
const membersRoute = require("./controllers/members.js");

app.use(
  expressSession({
    store: new pgSession({
      pool: db,
      createTableIfMissing: true,
    }),
    secret: process.env.EXPRESS_SESSION_SECRET_KEY,
  })
);

//Middleware, middle of user getting the response
app.use((req, res, next) => {
  console.log(` \u001b[30m${new Date()} \u001b[33m${req.method} ${req.path}`);

  //Go to the next middleware
  next();
});

//CLIENT STATIC HTML first page user will see
app.use(express.static("client"));

//API MIDDLEWARE, everything after this point is json
app.use(express.json());

//Connect to the API routes
app.use("/api/users", usersRoute);
app.use("/api/sessions", sessionsRoute);
app.use("/api/activity", activitiesRoute);
app.use("/api/teams", teamsRoute);
app.use("/api/team/members", membersRoute);

//Error middleware
app.use((err, req, res, next) => {
  console.log("An error occur");
  console.log(err);

  res.status(500).json({ message: "error", success: false });

  next();
});

//Run on port 3000
app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
