const express = require("express");
const app = express();
const port = 3000;

//API ENDPOINTS
app.get("/", (req, res) => {
    res.send("Welcome to trockenobst oida");
});
app.get("/api/latest", async(req, res) => {
    //quick way of doing things
    if (moistureCollection) {
        let latest = await moistureCollection.findOne({}, { sort: { $natural: -1 } });
        res.send(latest);
    }
    /*if (moistureCollection) {
          let latest = await moistureCollection.findOne({}, { sort: { "createdAt": -1 } })
          res.send(latest);
      }*/
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

const mqtt = require("mqtt");
const topic = process.env.MQTT_TOPIC;
const mqttId = "josch3";
const mqttClient = mqtt.connect(process.env.MQTT_HOST, { clientId: mqttId });

const dbAccess = require("./config.js").dbAccess;
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