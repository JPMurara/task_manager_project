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
    INSERT INTO activity (activity_name)
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

// router.post("/", async (req, res) => {
//     //Deconstruct the form
//     const { messages } = req.body;

//     console.log(messages);

//     const completion = await openai.chat.completions.create({
//         model: "gpt-3.5-turbo",
//         messages: [
//             {
//                 role: "system",
//                 content:
//                     "anything that you will be prompted will be used to generate a to-do list. answer with up to 5 tasks using keywords or short sentences of up to 3 words only. Output your answer in JSON",
//             },
//             ...messages,
//         ],
//     });

//     console.log("completion", completion);

//     const tasksAI = JSON.parse(completion.choices[0].message.content);

//     console.log("tasksAI: ", tasksAI);

//     const data = tasksAI.tasks;

//     console.log("data: ", data);
//     // Loop through each task and log it (or process it as you see fit)
//     const name = data.forEach((task) => {
//         console.log("task: ", task);
//         return task;
//     });

//     console.log("name ", name);

//     // res.json({ completion: JSON.parse(completion.choices[0].message.content) });

//     //SQL query to insert user into the database
//     const sql = `
//         INSERT INTO tasks (task_name)
//         VALUES ($1)
//         RETURNING task_name;
//     `;

//     db.query(sql, [name])
//         .then(() => {
//             res.status(200).json({ message: "Task created successfully" });
//         })
//         .catch((error) => {
//             console.error("database error encountered: ", error);
//             res.status(500).json({ message: "internal server error" });
//         });
// });

//Export signup route
module.exports = router;
