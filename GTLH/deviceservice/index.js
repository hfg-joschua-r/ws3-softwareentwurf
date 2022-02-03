require("dotenv").config();
const express = require("express");
const port = process.env.DEVICESERVICE_PORT;
const deviceService = express();
const cors = require("cors");

deviceService.use(express.json());
/*const corsOptions = {
    origin: "*",
    credentials: true,
};
deviceService.use(cors(corsOptions));*/

//API ENDPOINTS
deviceService.get("/", (req, res) => {
    res.send("Welcome to GrowTimeLapseHelper Device Verwaltung");
});
deviceService.listen(port, () => {
    console.log(
        `GrowTimeLapseHelper deviceService listening at http://127.0.0.1:${port}`
    );
});

//authentificate devices backend endpoint
//HIGH LEVEL SECURITY: ID's werden ab Produktion hinzugefügt, wenn Werte von ID's kommen, die nicht existieren, muss die Anfrage ignoriert werden!
//Addon: ID's werden nur kurze zeit claimable. Es wird eine neue ID angelegt, wenn sie nicht existiert  
deviceService.post("/device/auth", (req, res) => {
        //was muss rausgefunden werden: wird aufgerufen wenn neue Werte reinkommen; gibt es einen owner? wenn nein --> device claimable für 5 minuten 
        console.log(req.body);
        const deviceID = req.body.deviceID;
        deviceCollection.findOne({ 'deviceID': deviceID })
            .then((deviceEntry) => {
                if (!deviceEntry) {
                    console.log("no device found");
                    res.status(404).send("device doesn't exist")
                } else {
                    console.log("entry found " + JSON.stringify(deviceEntry));
                    if (deviceEntry.owner == "") {
                        let claimableUpdate = { $set: { claimable: true, owner: 'temp' } };
                        deviceCollection.updateOne({ '_id': deviceEntry._id }, claimableUpdate, (res, err) => {
                            if (err)
                                console.log(err);
                            else {
                                console.log("updated entry " + res);
                                res.status(201).send("device exists, but hasn't been claimed yet, now claimable");
                                setInterval(() => {
                                    setDeviceUnclaimable(deviceEntry._id)
                                }, 300000);
                                //timer entspricht 5 Minuten, dann wird device auf unclaimable gesetzt
                            }
                        })
                    } else {
                        res.status(200).send("device exists");
                    }
                }
            });
    })
    //Timer function um device auf unclaimable zu setzen
function setDeviceUnclaimable(deviceID) {
    let claimableUpdate = { $set: { claimable: false, owner: 'unclaimed' } };
    deviceCollection.updateOne({ '_id': deviceID }, claimableUpdate, (res, err) => {
        if (err)
            console.log(err);
        else {
            console.log("device " + deviceID + " is now unclaimable")
        }
    })
}

//Frontend endpoints: device claimen & owner setzen
deviceService.post("/device/claim", (req, res) => {
    console.log(req.body)
    const deviceID = req.body.deviceID
    const owner = req.body.owner
    let now = new Date();
    deviceCollection.findOne({ 'deviceID': deviceID })
        .then((deviceEntry) => {
            if (!deviceEntry) {
                console.log("no device found");
                res.status(404).send("device doesn't exist")
            } else {
                if (deviceEntry.claimable) {
                    let deviceUpdate = { $set: { claimable: false, owner: owner, registered: now } };
                    deviceCollection.updateOne({ '_id': deviceEntry._id }, deviceUpdate, (res, err) => {
                        if (err)
                            console.log(err);
                        else {
                            console.log("claimed entry " + res);
                            res.status(200).send("device sucessfully claimed");
                        }
                    })
                }
            }
        })
});

//Datenbank connection
const { MongoClient } = require("mongodb");
const dbUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/myFirstDatabase?retryWrites=true&w=majority`;
const dbClient = new MongoClient(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let deviceCollection;
dbClient.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        deviceCollection = dbClient.db("GLTH").collection("registeredDevices");
        // perform actions on the collection object
        console.log("connected to deviceDB");
    }
});