require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.USER_SERVICE_PORT;
const corsOptions = {
    origin: process.env.FRONTEND_LOCATION,
    methods: ["POST", "GET"],
};
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//uuid
const { v4: uuidv4 } = require("uuid");

//bcrypt
const bcrypt = require("bcrypt");
const saltRounds = 10;
let sessions = {
    "test": {
        test: "test"
    }
};

//API ENDPOINTS
app.listen(port, () => {
    console.log(`User Service of Trockenobst joyful listening at http://127.0.0.1:${port}`);
});
app.get("/", (req, res) => {
    res.send("Welcome to trockenobst Userservice oida");
});
//REGISTER ENDPOINT
app.post("/api/register", (req, res) => {
    let userData = req.body;
    if (userData) {
        let now = new Date();
        const hash = bcrypt.hashSync(userData.password, saltRounds);
        delete userData.password;
        userData.hashedPass = hash;
        userData.createdAt = now;
        userData.modifiedAt = now;
        console.log(userData);

        userCollection.insertOne(userData, (err) => {
            if (err) {
                console.log(err);
                res.status(500).send({
                    message: "database error",
                });
            } else {
                console.log("inserted new User in DB");
                res.status(200).send({
                    message: "success!",
                });
            }
        });
    } else {
        res.status(500).send({
            message: "not connected to Database",
        });
    }
});
//LOGIN ENDPOINT
app.post("/api/login", (req, res) => {
    let sentData = req.body;
    if (sentData) {
        userCollection
            .findOne({ username: sentData.username })
            .then((dbres) => {
                if (dbres) {
                    console.log("Found following entry in DB: " + dbres._id);
                    if (bcrypt.compareSync(sentData.password, dbres.hashedPass)) {
                        //correct password
                        const session = createSession(dbres._id);

                        res.status(200).send(session)
                    } else {
                        console.log("wrong password for username");
                        res.status(400).send({ message: "wrong password" });
                    }
                } else {
                    console.log("user not found");
                    res.status(400).send({ message: "user not found" });
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(400).send({ message: "user not found" });
            });
    }
});
app.post("/api/validateToken", (req, res) => {
    console.log("processing sent token for validation");
    let sentToken = req.body.token;

    res.status(200).send({
        tokenIsValid: sessions.hasOwnProperty(sentToken)
    })
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

function createSession(userId) {
    let token = uuidv4();
    let now = new Date();
    const session = {
        token: token,
        createdAt: now,
        modifiedAt: now,
        userId: userId,
    };
    sessions[token] = session
    return session;
};