require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.MOISTURE_SERVICE_PORT;
const { v4: uuidv4 } = require("uuid");

//API ENDPOINTS
app.get("/", (req, res) => {
    res.send("Welcome to trockenobst dataservice oida");
});
app.post("/api/latest", async(req, res) => {
    //const sentToken = req.body.token;
    if (moistureCollection) {
        //check if token is valid
        axios
            .post(process.env.USERSERVICE_LOCATION + "/api/validateToken", {
                token: "test",
            })
            .then(async(tokValRes) => {
                console.log(tokValRes.data);
                if (tokValRes.data.tokenIsValid) {
                    let latest = await moistureCollection.findOne({}, { sort: { $natural: -1 } });
                    res.send(latest);
                } else {
                    console.log("token not valid")
                    res.status(400).send("not allowed")
                }
            })
            .catch((tokErr) => {
                console.log(tokErr);
            });
    }
});

app.listen(port, () => {
    console.log(
        `Dataservice of Trockenobst joyful ding listening at http://127.0.0.1:${port}`
    );
});

const mqtt = require("mqtt");
const topic = process.env.MQTT_TOPIC;
const mqttId = uuidv4();
const mqttClient = mqtt.connect(process.env.MQTT_HOST, { clientId: mqttId });
const { MongoClient } = require("mongodb");

const dbUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/myFirstDatabase?retryWrites=true&w=majority`;

const dbClient = new MongoClient(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
let moistureCollection;
dbClient.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        moistureCollection = dbClient.db("PlantDB").collection("moisture");
        // perform actions on the collection object
        console.log("connected to moistureDB");
    }
});
mqttClient.on("connect", function() {
    mqttClient.subscribe(topic, function(err) {
        if (err) {
            console.log(err);
        } else {
            mqttClient.publish(topic + "logs/", mqttId + " subscribed to: " + topic);
            console.log("subscribed to: " + topic);
        }
    });
});

mqttClient.on("message", (topic, message) => {
    if (moistureCollection) {
        let msg = JSON.parse(message);
        msg.createdAt = new Date();
        msg.modifiedAt = new Date();
        console.log(msg);
        //moistureCollection.insertOne(msg);
    }
});