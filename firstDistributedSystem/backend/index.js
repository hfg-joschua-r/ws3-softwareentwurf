const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})

const mqtt = require("mqtt");
const topic = "/sweavs/josch";
const mqttId = "josch3";
const mqttClient = mqtt.connect("http://193.196.159.141", { clientId: mqttId });

const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://moistureAdmin:mango@joschcluster.vju6o.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const dbClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let moistureCollection;
dbClient.connect(err => {
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