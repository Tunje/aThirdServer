import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});


const USERS = [
    { username: "user1", password: "pass1", admin: true },
    { username: "user2", password: "pass2", admin: false }
];

const checkAuth = (req, res, next) => {
    const { username, password } = req.body;
    const user = USERS.find(user => user.username === username && user.password === password);
    if (user) {
        next();
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }
};

const checkadmin = (req, res, next) => {
    const user = USERS.find(user => user.username === req.body.username);
    if (user && user.admin) {
        next();
    } else {
        res.status(403).json({ message: "Forbidden: access denied" });
    }
};