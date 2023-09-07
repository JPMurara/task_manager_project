//Start express
const express = require("express");

require("dotenv").config();

//Connect with database
const { db } = require("../database/db.js");

require("dotenv").config();

//Connect to OpenAI

const OpenAI = require("openai");

const openai = new OpenAI({
  organization: process.env.ORGANIZATION,
  apiKey: process.env.APIKEY,
});

//Create router for easy access
const router = express.Router();

//Provides the user with all the activities and stats for each acitivity
router.get("/getAll", (req, res) => {
  //SQL query to insert team into the database
  const sql = `
        SELECT
          a.activity_id,
          a.activity_name,
          COUNT(CASE WHEN t.tasks_status = 'pending' THEN 1 ELSE NULL END) AS pending_count,
          COUNT(CASE WHEN t.tasks_status = 'in_progress' THEN 1 ELSE NULL END) AS in_progress_count,
          COUNT(CASE WHEN t.tasks_status = 'completed' THEN 1 ELSE NULL END) AS completed_count
        FROM activities a
        LEFT JOIN tasks t ON a.activity_id = t.activity_id
        GROUP BY a.activity_id, a.activity_name
        `;
  //Query the database with sql and values
  db.query(sql)
    .then((result) => {
      res.status(200).json(result.rows);
    })
    .catch((err) => {
      console.error("Database error encountered:", error);
      res.status(500).json({
        message: "An error occurred while fetching teams",
      });
    });
});

//gets an activity using activity_id along with the tasks it has
router.get("/get/:activity_id", (req, res) => {
  //activity_id initializing
  const activity_id = req.params.activity_id;

  //SQL query to get activity using activity_id along with the tasks it has from database
  const sql = `
          SELECT
            a.activity_id,
            a.activity_name,
            a.team_id,
            t.id AS task_id,
            t.task_name,
            t.task_description,
            t.tasks_status,
            t.task_priority,
            t.assigned_to,
            t.due_date
          FROM activities a
          LEFT JOIN tasks t ON a.activity_id = t.activity_id
          WHERE a.activity_id = $1
          `;

  //Query the database with sql and values
  db.query(sql, [activity_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Activity not found" });
      }
      const activity = {
        activity_id: result.rows[0].activity_id,
        activity_name: result.rows[0].activity_name,
        team_id: result.rows[0].team_id,
        tasks: result.rows.map((row) => ({
          task_id: row.task_id,
          task_name: row.task_name,
          task_description: row.task_description,
          tasks_status: row.tasks_status,
          task_priority: row.task_priority,
          assigned_to: row.assigned_to,
          due_date: row.due_date,
        })),
      };

      res.status(200).json(activity);
    })
    .catch((err) => {
      console.error("database error encountered: ", err);
      res.status(500).json({ message: err });
    });
});

router.get("/getLast", (req, res) => {
  // SQL query to fetch the most recent activity
  const sql = `
        SELECT
            a.activity_id,
            a.activity_name,
            COUNT(CASE WHEN t.tasks_status = 'pending' THEN 1 ELSE NULL END) AS pending_count,
            COUNT(CASE WHEN t.tasks_status = 'in_progress' THEN 1 ELSE NULL END) AS in_progress_count,
            COUNT(CASE WHEN t.tasks_status = 'completed' THEN 1 ELSE NULL END) AS completed_count
        FROM activities a
        LEFT JOIN tasks t ON a.activity_id = t.activity_id
        GROUP BY a.activity_id, a.activity_name
        ORDER BY a.created_at DESC
        LIMIT 1;
    `;

  // Query the database with sql
  db.query(sql)
    .then((result) => {
      if (result.rows.length > 0) {
        res.status(200).json(result.rows[0]);
      } else {
        res.status(404).json({ message: "No activity found" });
      }
    })
    .catch((error) => {
      console.error("Database error encountered:", error);
      res.status(500).json({
        message: "An error occurred while fetching the last activity",
      });
    });
});

router.get("/tasks", async (req, res) => {
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

// route to handle new activities inserted by the user without AI assis
router.post("/userAdd", (req, res) => {
  const { activity } = req.body;
  // checks if activity already exists before inserting
  const sql = `SELECT * FROM activities WHERE activity_name=$1`;
  db.query(sql, [activity]).then((dbRes) => {
    if (dbRes.rows.length > 0) {
      res.status(400).json({
        success: false,
        message: "Activity alredy exists. Add a new activity",
      });
    } else {
      const sql = `INSERT INTO activities (activity_name) VALUES ($1)`;
      db.query(sql, [activity])
        .then((result) => {
          console.log("result is:", result);
          res.status(200).json({
            success: true,
            message: "Activity inserted into the table",
          });
        })
        .catch((error) => {
          console.error("database error encountered: ", error);
          res.status(500).json({ message: "internal server error" });
        });
    }
  });
});

router.post("/", async (req, res) => {
  const { activity } = req.body;

  console.log("activity ", activity);

  const sql = `
    INSERT INTO activities (activity_name)
    VALUES ($1)
    RETURNING activity_id;
    `;
  const activityPromise = db
    .query(sql, [activity])
    .then((result) => {
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
          "You're an assistant that helps generate specific to-do lists. When given a category or theme, provide a concise list of five related tasks or items. Each task should be 1-4 words and start with a capital letter. Format the response as a JSON object with a tasks key, containing an array of tasks. For example: {tasks: ['Task 1', 'Task 2', 'Task 3', 'Task 4', 'Task 5']}.",
      },
      {
        role: "user",
        content: `Generate tasks related to the activity but don't just restate the activity: "${activity}"`,
      },
      {
        role: "assistant",
        content: "{tasks: ['Task 1', 'Task 2', 'Task 3', 'Task 4', 'Task 5']}",
      },
    ];

    let attempts = 0; // Initialize an attempt counter
    const MAX_ATTEMPTS = 3; // Maximum times you want to try fetching from the API
    let JSONContent;
    let data;

    do {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
      });
      console.log("completion", completion);

      console.log(completion.choices[0].message.content);

      JSONContent = JSON.parse(completion.choices[0].message.content);

      console.log("JSONContent: ", JSONContent);

      data = JSONContent.tasks;

      console.log("data: ", data);

      attempts++;
    } while (!isValidTasksList(JSONContent) && attempts < MAX_ATTEMPTS);

    //SQL query to insert user into the database
    const tasksSql = `
            INSERT INTO tasks (activity_id, task_name, tasks_status)
            VALUES ($1,$2,'pending'), ($1,$3,'pending'), ($1,$4,'pending'), ($1,$5,'pending'), ($1,$6,'pending')
            RETURNING task_name;
        `;
    const activity_id = await activityPromise;
    console.log("activity id:", activity_id);

    db.query(tasksSql, [activity_id].concat(data)).then(() => {
      res.status(200).json({
        message: "Activity created successfully",
        tasks: data,
        activity_id: activity_id,
      });
    });
  } catch (error) {
    console.error("Error fetching tasks or communicating with OpenAI: ", error);
    res.status(500).json({ message: "internal server error" });
  }
});

function isValidTasksList(data) {
  console.log(data);
  // Check if 'tasks' key exists and is an array
  if (!data.hasOwnProperty("tasks") || !Array.isArray(data.tasks)) {
    return false;
  }

  const tasks = data.tasks;

  // Check if there are exactly 5 tasks
  if (tasks.length !== 5) {
    return false;
  }

  // Check if each task meets the criteria
  for (const task of tasks) {
    if (
      // Check if task starts with a capital letter
      task.charAt(0) !== task.charAt(0).toUpperCase() ||
      // Check if task length is between 1 and 4 words
      task.split(" ").length > 4
    ) {
      return false;
    }
  }

  return true;
}

//adds a new custom task to the task table using activity_id
router.post("/task/add_new/:activity_id", (req, res) => {
  //activity_id initializing
  const activity_id = req.params.activity_id;

  //Deconstruct the form
  const {
    task_name,
    task_description,
    tasks_status,
    task_priority,
    assigned_to,
    due_date,
    created_by,
  } = req.body;
  //SQL query to insert task into the database
  const sql = `
        INSERT INTO tasks (
          activity_id, 
          task_name, 
          task_description, 
          tasks_status, 
          task_priority, 
          assigned_to, 
          due_date, 
          created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, task_name, created_at
        `;

  //ERROR HANDLING: checking if name was provided
  if (!task_name || task_name == "" || task_name == null)
    return res.status(400).json({
      message: "Task name is missing",
    });

  //ERROR HANDLING: checking if name was provided
  if (!activity_id || activity_id == 0)
    return res.status(400).json({
      message: "Failed to locate Activity",
    });

  //Query the database with sql and values
  db.query(sql, [
    activity_id,
    task_name,
    task_description,
    tasks_status,
    task_priority,
    assigned_to,
    due_date,
    created_by,
  ])
    .then(() => {
      res.status(200).json({ message: "Task created successfully" });
    })
    .catch((err) => {
      console.log(err.constraint);
      if (err.constraint === "unique_task_name_per_activity") {
        return res
          .status(409)
          .json({ message: `${task_name} already exists!` });
      }
      console.error("database error encountered: ", err);
      res.status(500).json({ message: err });
    });
});

//update activity
router.put("/update/:activity_id", (req, res) => {
  //activity_id initializing
  const activity_id = req.params.activity_id;

  //Deconstruct the form
  const { activity_name, team_id } = req.body;

  //SQL query to update the activity in database
  const sql = `
            UPDATE activities
            SET activity_name = $1, team_id = $2
            WHERE activity_id = $3
            RETURNING activity_id, activity_name, team_id
            `;

  //ERROR HANDLING: checking if name was provided
  if (!activity_name || activity_name == "" || activity_name == null)
    return res.status(400).json({
      message: "Activity name is missing",
    });

  //ERROR HANDLING: checking if activity_id was provided
  if (!activity_id || activity_id == 0)
    return res.status(400).json({
      message: "Failed to locate Activity!",
    });

  //Query the database with sql and values
  db.query(sql, [activity_name, team_id, activity_id])
    .then(() => {
      res.status(200).json({ message: "Activity updated successfully" });
    })
    .catch((err) => {
      console.error("database error encountered: ", err);
      res.status(500).json({ message: err });
    });
});

//can be used to specifically assign a task to a specific user.
//might not be useful but here it is, if not needed remove. thanks.
router.put("/task/assign_user/:task_id", (req, res) => {
  //task_id initializing
  const task_id = req.params.task_id;

  //Deconstruct the form
  const { user_id } = req.body;

  //SQL query to update the team in database
  const sql = `
          UPDATE tasks
          SET assigned_to = $1
          WHERE id = $2`;

  //ERROR HANDLING: checking if team_id was provided
  if (!task_id || task_id == 0)
    return res.status(400).json({
      message: "Failed to locate task!",
    });

  //Query the database with sql and values
  db.query(sql, [user_id, task_id])
    .then(() => {
      res.status(200).json({ message: "Task assigned successfully" });
    })
    .catch((err) => {
      console.error("database error encountered: ", err);
      res.status(500).json({ message: err });
    });
});

//route to update the task.
router.put("/task/update/:task_id", (req, res) => {
  //task_id initializing
  const task_id = req.params.task_id;

  console.log(req.body);


    //Deconstruct the form
    let {
        task_name,
        task_description,
        tasks_status,
        task_priority,
        assigned_to,
        due_date,
        updated_at,
    } = req.body;

    assigned_to = assigned_to ? assigned_to : null;
    due_date = due_date || null;



  //SQL query to update the task in database
  const sql = `
            UPDATE tasks
            SET 
              task_name = $1, 
              task_description = $2, 
              tasks_status = $3, 
              task_priority = $4,
              assigned_to = $5, 
              due_date = $6, 
              updated_at = $7
            WHERE id = $8
            RETURNING id, task_name, updated_at, activity_id
            `;

  //ERROR HANDLING: checking if name was provided
  if (!task_name || task_name == "" || task_name == null)
    return res.status(400).json({
      message: "Task name is missing",
    });

  //ERROR HANDLING: checking if team_id was provided
  if (!task_id || task_id == 0)
    return res.status(400).json({
      message: "Failed to locate task!",
    });


    //Query the database with sql and values
    db.query(sql, [
        task_name,
        task_description,
        tasks_status,
        task_priority,
        assigned_to,
        due_date,
        updated_at,
        task_id,
    ])
        .then((result) => {
            const activity_id = result.rows[0].activity_id;

            res.status(200).json({
                activity_id,
                message: "Task updated successfully",
            });
        })
        .catch((err) => {
            console.error("database error encountered: ", err);
            res.status(500).json({ message: err });
        });

});

//route to delete activity
router.delete("/delete/:activity_id", (req, res) => {
    //activity_id initializing
    const activity_id = req.params.activity_id;
    // activity_id is a foreign key in the tasks table, so we delete the tasks first and after that the activity
    const sql = `
  DELETE FROM tasks where activity_id=$1
  `;
    //ERROR HANDLING: checking if activity_id was provided
    if (!activity_id || activity_id == 0)
        return res.status(400).json({
            success: false,
            message: "Failed to locate Activity!",
        });
    db.query(sql, [activity_id]).then(() => {
        //SQL query to delete the activity from DB
        const sql = `
    DELETE FROM activities
    WHERE activity_id = $1`;
        //Query the database with sql and values
        db.query(sql, [activity_id])
            .then(() => {
                res.status(200).json({
                    success: true,
                    message: "Actvity deleted successfully",
                });
            })
            .catch((err) => {
                res.status(500).json({
                    success: false,
                    message: "Error",
                    err,
                });
            });
    });
});

//route to delete task
router.delete("/task/delete/:task_id", (req, res) => {
  //task_id initializing
  const task_id = req.params.task_id;

  //SQL query to delete the task from database
  const sql = `
          DELETE FROM tasks
          WHERE id = $1`;

  //ERROR HANDLING: checking if team_id was provided
  if (!task_id || task_id == 0)
    return res.status(400).json({
      message: "Failed to locate Task!",
    });

  //Query the database with sql and values
  db.query(sql, [task_id])
    .then(() => {
      res.status(200).json({ message: "Task deleted successfully" });
    })
    .catch((err) => {
      console.error("database error encountered: ", err);
      res.status(500).json({ message: err });
    });
});
//Export signup route
module.exports = router;
