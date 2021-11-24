const express = require("express");
const app = express();
const port = 3001;
require('dotenv').config()

//API ENDPOINTS
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
app.get("/", (req, res) => {
    res.send("Welcome to trockenobst Userservice oida");
});
app.post("/register", (req, res) => {

});

const { MongoClient } = require("mongodb");
const dbAccess = require("./config.js").dbAccess;
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
        userCollection = dbClient.db("PlantDB").collection("users");
        // perform actions on the collection object
        console.log("connected to userDB");
    }
});