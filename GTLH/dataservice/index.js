require("dotenv").config();
const express = require("express");
const multer = require("multer");
const morgan = require("morgan");
const path = require("path");
const dataService = express();
const port = process.env.DATASERVICE_PORT;
const fs = require("fs");
const cloudinary = require("cloudinary");
const axios = require("axios");

const asyncHandler = require("express-async-handler");

dataService.use(express.json());
dataService.use(morgan("dev"));
// Create multer object
const imageUpload = multer({
    storage: multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, "./images/");
        },
        filename: function(req, file, cb) {
            cb(null, new Date().valueOf() + "_sent.jpg");
        },
    }),
});
//Müsste vielleicht noch in .env file gepackt werden
cloudinary.config({
    cloud_name: "dvr9e7c1y",
    api_key: "793927819676284",
    api_secret: "SFpjfQ1qOP3W5WiOdhueaR9EM0A",
});

//API ENDPOINTS
dataService.get("/", (req, res) => {
    res.send("Welcome to GrowTimeLapseHelper Dataservice");
});
dataService.listen(port, () => {
    console.log(
        `GrowTimeLapseHelper dataService listening at http://127.0.0.1:${port}`
    );
});

//upload endpoint for sensorValues
dataService.post("/api/sensorValues", asyncHandler(async(req, res) => {
    let auth = await authentificateDevice(req.body.espID);
    if (auth == 200 || auth == 201) {
        console.log(req.body);
        let now = new Date();
        let espID = req.body.espID;
        let moisture = req.body.moisture;
        let airQual = req.body.airQual;
        let entry = {
            espID: espID,
            moisture: moisture,
            airQual: airQual,
            createdAt: now,
        };
        createMoistureDBEntry(entry);
        res.status(200).send("updated sensor values");
    } else {
        res.status(500).send("Device not registered in system");
    }
}));

//upload endpoint for jpgs
dataService.post(
    "/api/imageUpload2",
    asyncHandler(async(req, res) => {
        console.log(req.body);
        let buffer = req.body.base64;
        let espID = req.body.espID;
        console.log("new upload from id" + espID);
        let buf = Buffer.from(buffer, "base64");
        fs.writeFileSync("./images/newestTEST.jpg", buf);

        res.status(200).json("/image api");
    })
)

//Endpoint for uploading base64 buffered images
dataService.post(
    "/api/imageUpload",
    asyncHandler(async(req, res) => {
        let auth = await authentificateDevice(req.body.espID);
        if (auth == 200 || auth == 201) {
            let buffer = req.body.base64;
            let espID = req.body.espID;
            console.log("new upload from id" + espID);
            let buf = Buffer.from(buffer, "base64");
            fs.writeFileSync("./images/newest.jpg", buf);
            const imgUrl = await storeImg(espID);
            let now = new Date();
            //todo owner finden über espID
            let entry = {
                deviceID: espID,
                imgUrl: imgUrl,
                createdAt: now,
            };
            createImgDBEntry(entry);
            res.status(200).send("upload sucessfull!");
        } else {
            res.status(500).send("Device not registered in system");
        }
    })
);

dataService.get("/image/:filename", (req, res) => {
    const { filename } = req.params;
    const dirname = path.resolve();
    const fullfilepath = path.join(dirname, "images/" + filename);
    return res.sendFile(fullfilepath);
});

//Storing functions
async function storeImg(espID) {
    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload(
            "./images/newest.jpg", { public_id: espID + Date.now(), effect: "improve" },
            function(error, result) {
                resolve(result.url);
            }
        );
    });
}
const { MongoClient } = require("mongodb");
const dbUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/myFirstDatabase?retryWrites=true&w=majority`;
const dbClient = new MongoClient(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let imageCollection;
let moistureCollection;
dbClient.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        imageCollection = dbClient.db("GLTH").collection("moistureImg");
        moistureCollection = dbClient.db("GLTH").collection("moistureData");
        // perform actions on the collection object
        console.log("connected to moisture- & Img-DB");
    }
});

async function createImgDBEntry(entry) {
    console.log(entry);
    imageCollection.insertOne(entry, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("added new entry to DB");
        }
    });
}

function createMoistureDBEntry(entry) {
    moistureCollection.insertOne(entry, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("added new entry to DB");
        }
    });
}

async function authentificateDevice(deviceID) {
    return new Promise((resolve, reject) => {
        axios.post(process.env.DEVICESERVICE_LOCATION + "/device/auth", { deviceID: deviceID })
            .then(res => {
                console.log(`statusCode: ${res.status}`)
                console.log(res.data)
                resolve(res.status);
            })
            .catch(error => {
                reject(error)
                console.error(error)
            })
    })
}