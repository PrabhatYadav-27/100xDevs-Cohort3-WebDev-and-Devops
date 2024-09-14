// Import the express, mongoose, and jwt modules
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Import the UserModel and TodoModel from the db.js file
const { UserModel, TodoModel } = require("./db");

// Create an instance of the express module
const app = express();

// Parse the JSON data using the express.json() middleware
app.use(express.json());

// Connect to the MongoDB database using the mongoose.connect() method
mongoose.connect("mongodb+srv://100xdevs:WvaTca0509mb90YX@cluster0.ossjd.mongodb.net/todo-harkirat-2222");

// Create a JWT_SECRET variable for the secret key
const JWT_SECRET = "hellobacchomajaloclasska";

// Create a POST route for the signup endpoint
app.post("/signup", async function (req, res) {
    const { email, password, name } = req.body;

    try {
        // Create a new user using the UserModel.create() method
        await UserModel.create({ email, password, name });

        // Send a success response to the client
        res.json({ message: "You are signed up!" });
    } catch (error) {
        // Catch errors like user already existing or other issues
        res.status(400).json({ message: "User already exists!" });
    }
});

// Create a POST route for the signin endpoint
app.post("/signin", async function (req, res) {
    const { email, password } = req.body;

    try {
        // Find the user with the given email and password
        const user = await UserModel.findOne({ email, password });

        if (user) {
            // Create a JWT token
            const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET);

            // Send the token to the client
            res.json({ token, message: "You are signed in!" });
        } else {
            // If the user is not found, send an error message
            res.status(403).json({ message: "Invalid Credentials!" });
        }
    } catch (error) {
        // Catch any other potential errors
        res.status(500).json({ message: "An error occurred during signin." });
    }
});

// Create an auth middleware function to authenticate the user
function auth(req, res, next) {
    const token = req.headers.authorization;

    try {
        // Verify the token
        const decodedData = jwt.verify(token, JWT_SECRET);

        if (decodedData) {
            req.userId = decodedData.id;
            next();
        } else {
            res.status(403).json({ message: "Invalid Token!" });
        }
    } catch (error) {
        res.status(403).json({ message: "Invalid Token!" });
    }
}

// Create a POST route for the todo endpoint
app.post("/todo", auth, async function (req, res) {
    const { title, done } = req.body;
    const userId = req.userId;

    try {
        // Create a new todo
        await TodoModel.create({ userId, title, done });

        // Send a success response
        res.json({ message: "Todo created" });
    } catch (error) {
        // Handle potential errors in todo creation
        res.status(500).json({ message: "Error creating todo" });
    }
});

// Create a GET route for the todo endpoint
app.get("/todo", auth, async function (req, res) {
    const userId = req.userId;

    try {
        // Find all the todos for the authenticated user
        const todos = await TodoModel.find({ userId });

        // Send the todos to the client
        res.json({ todos });
    } catch (error) {
        // Handle potential errors in fetching todos
        res.status(500).json({ message: "Error fetching todos" });
    }
});

// Start the server on port 3000
app.listen(3000);
