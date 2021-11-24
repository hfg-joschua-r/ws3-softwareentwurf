require('dotenv').config()
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.USER_SERVICE_PORT;
const corsOptions = {
    origin: process.env.FRONTEND_LOCATION,
    methods: ["POST", "GET"]
}
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//bcrypt 
const bcrypt = require('bcrypt');
const saltRounds = 10;

//API ENDPOINTS
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
app.get("/", (req, res) => {
    res.send("Welcome to trockenobst Userservice oida");
});
app.post("/api/register", (req, res) => {
    let userData = req.body;
    let now = new Date();
    const hash = bcrypt.hashSync(userData.password, saltRounds);
    delete userData.password;
    userData.hashedPass = hash;
    userData.createdAt = now;
    userData.modifiedAt = now;
    console.log(userData)
    
    userCollection.insertOne(userData, (err) => {
        if (err)
            console.log(err)
        else
            console.log("inserted new User in DB")
    })
    res.send("success!");
});

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
        userCollection = dbClient.db("PlantDB").collection("users");
        // perform actions on the collection object
        console.log("connected to userDB");
    }
});