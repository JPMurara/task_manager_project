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

router.post("/", async (req, res) => {
    //Deconstruct the form
    const { messages } = req.body;

    console.log(messages);

    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content:
                    "anything that you will be prompted will be used to generate a to-do list. answer with up to 5 tasks using keywords or short sentences of up to 3 words only. Output your answer in JSON",
            },
            ...messages,
        ],
    });

    console.log(completion);

    const tasksAI = JSON.parse(completion.choices[0].message.content);

    console.log(tasksAI);

    const data = tasksAI.tasks;
    // Loop through each task and log it (or process it as you see fit)
    const name = data.forEach((task) => {
        return task;
    });

    console.log(name);

    //SQL query to insert user into the database
    const sql = `
        INSERT INTO tasks (task_name)
        VALUES ($1)
        RETURNING task_name;
    `;

    db.query(sql, [name])
        .then(() => {
            res.status(200).json({ message: "Task created successfully" });
        })
        .catch((error) => {
            console.error("database error encountered: ", error);
            res.status(500).json({ message: "internal server error" });
        });
});

//Export signup route
module.exports = router;
