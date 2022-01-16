require("dotenv").config();
const express = require("express");
const port = process.env.USERSERVICE_PORT;
const userService = express();

userService.use(express.json());
//API ENDPOINTS
userService.get("/", (req, res) => {
    res.send("Welcome to GrowTimeLapseHelper User Verwaltung");
});
userService.listen(port, () => {
    console.log(
        `GrowTimeLapseHelper User Service listening at http://127.0.0.1:${port}`
    );
});

//MongoDB
const { MongoClient } = require("mongodb");
const dbUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/myFirstDatabase?retryWrites=true&w=majority`;
const dbClient = new MongoClient(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let userCollection;
dbClient.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        userCollection = dbClient.db("GLTH").collection("users");
        // perform actions on the collection object
        console.log("connected to UserDB");
    }
});