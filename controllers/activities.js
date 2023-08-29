//Start express
const express = require("express");

require("dotenv").config();

//Connect with database
const db = require("../database/db.js");

require("dotenv").config();

//Connect to OpenAI

const OpenAI = require("openai");

const openai = new OpenAI({
  organization: process.env.ORGANIZATION,
  apiKey: process.env.APIKEY,
});

//Create router for easy access
const router = express.Router();

router.post("/activity", async (req, res) => {
  const { activity } = req.body;

  // console.log("activity ", activity);

  const sql = `
    INSERT INTO activities (activity_name)
    VALUES ($1)
    RETURNING activity_id;
    `;

  const activityPromise = db
    .query(sql, [activity])
    .then((result) => {
      console.log(result);
      return result.rows[0].activity_id;
    })
    .catch((error) => {
      console.error("database error encountered: ", error);
      res.status(500).json({ message: "internal server error" });
    });

  try {
    // Now make a call to OpenAI with the activity as a message
    const messages = [
      {
        role: "system",
        content:
          "anything that you will be prompted will be used to generate a to-do list. answer with up to 5 tasks using keywords or short sentences of up to 3 words only. Output your answer in JSON",
      },
      {
        role: "user",
        content: activity,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    console.log("completion", completion);

    const tasksAI = JSON.parse(completion.choices[0].message.content);

    console.log("tasksAI: ", tasksAI);

    const data = tasksAI.tasks;

    console.log("data: ", data);

    //SQL query to insert user into the database
    const tasksSql = `
            INSERT INTO tasks (activity_id, task_name)
            VALUES ($1,$2), ($1,$3), ($1,$4), ($1,$5), ($1,$6)
            RETURNING task_name;
        `;
    const activity_id = await activityPromise;

    db.query(tasksSql, [activity_id].concat(data)).then(() => {
      res.status(200).json({
        message: "Activity created successfully",
        tasks: data,
      });
    });
  } catch (error) {
    console.error("Error fetching tasks or communicating with OpenAI: ", error);
    res.status(500).json({ message: "internal server error" });
  }
});

router.get("/activity/tasks", async (req, res) => {
  const sql = `SELECT task_name FROM tasks ORDER BY id DESC LIMIT 5`;

  try {
    const result = await db.query(sql);
    console.log("results", result);
    const tasks = result.rows;
    console.log("tasks:", tasks);
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks from the database:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Export signup route
module.exports = router;
