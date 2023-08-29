//Start express
const express = require("express");

//Connect with database
const db = require("../database/db.js");

//Connect to OpenAI

const OpenAI = require("openai");

const openai = new OpenAI({
    organization: "org-2RFOiFUTNJtIGdP2ywIyqOrE",
    apiKey: "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",
});

//Create router for easy access
const router = express.Router();

router.post("/activity", (req, res) => {
    const { activity } = req.body;

    console.log("activity ", activity);

    const sql = `
    INSERT INTO activities (activity_name)
    VALUES ($1)
    RETURNING activity_name;
    `;

    db.query(sql, [activity])
        .then(() => {
            res.status(200).json({ message: "Activity created successfully" });
        })
        .catch((error) => {
            console.error("database error encountered: ", error);
            res.status(500).json({ message: "internal server error" });
        });
});

router.post("/", async (req, res) => {
    const sql = "SELECT * from activities ORDER BY activity_id DESC LIMIT 1";

    try {
        const activityResult = await db.query(sql);
        const activity = activityResult.rows[0];

        if (!activity) {
            return res.status(404).json({ error: "Activity not found" });
        }

        // Now make a call to OpenAI with the activity as a message
        const messages = [
            {
                role: "system",
                content:
                    "anything that you will be prompted will be used to generate a to-do list. answer with up to 5 tasks using keywords or short sentences of up to 3 words only. Output your answer in JSON",
            },
            {
                role: "user",
                content: activity.activity_name,
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

        // (Optional) Save tasks to your database if needed

        res.json({ tasks: data });
    } catch (error) {
        console.error(
            "Error fetching activity or communicating with OpenAI: ",
            error
        );
        res.status(500).json({ message: "internal server error" });
    }

    //NEED TO SAVE TASKS TO DATABASE
    // //SQL query to insert user into the database
    // const sql = `
    //     INSERT INTO tasks (task_name)
    //     VALUES ($1)
    //     RETURNING task_name;
    // `;

    // db.query(sql, [name])
    //     .then(() => {
    //         res.status(200).json({ message: "Task created successfully" });
    //     })
    //     .catch((error) => {
    //         console.error("database error encountered: ", error);
    //         res.status(500).json({ message: "internal server error" });
    //     });
});

//Export signup route
module.exports = router;
