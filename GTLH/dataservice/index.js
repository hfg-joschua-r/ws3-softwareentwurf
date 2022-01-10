require("dotenv").config();
const express = require("express");
const multer = require("multer");
const morgan = require("morgan");
const path = require("path");
const dataService = express();
const port = process.env.DATASERVICE_PORT;
const fs = require("fs");
const cloudinary = require("cloudinary");

dataService.use(express.json());
dataService.use(morgan("dev"));
// Create multer object
const imageUpload = multer({
    storage: multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, "images/");
        },
        filename: function(req, file, cb) {
            cb(null, new Date().valueOf() + "_sentImg");
        },
    }),
});
cloudinary.config({
    cloud_name: "dvr9e7c1y",
    api_key: "793927819676284",
    api_secret: "SFpjfQ1qOP3W5WiOdhueaR9EM0A",
});

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    },
});

//API ENDPOINTS
dataService.get("/", (req, res) => {
    res.send("Welcome to GrowTimeLapseHelper");
});
dataService.listen(port, () => {
    console.log(
        `GrowTimeLapseHelper dataService listening at http://127.0.0.1:${port}`
    );
});
dataService.post(
    "/api/imageUpload2",
    imageUpload.single("image"),
    (req, res) => {
        //console.log(req);
        console.log(JSON.stringify(req.file));
        res.status(200).json("/image api");
    }
);
dataService.post("/api/imageUpload", async(req, res) => {
    let buffer = req.body.base64;
    let espID = req.body.espID;
    console.log("new upload from id" + espID);
    let buf = Buffer.from(buffer, "base64");
    fs.writeFileSync("./images/newest.jpg", buf);
    res.status(200).send("upload sucessfull!");
    let imgUrl = await storeImg(espID);
    let now = new Date();
    //todo owner finden über espID
    let entry = {
        espID: espID,
        imgUrl: imgUrl,
        createdAt: now,
    }
    createDBentry(entry);
});

dataService.get("/image/:filename", (req, res) => {
    const { filename } = req.params;
    const dirname = path.resolve();
    const fullfilepath = path.join(dirname, "images/" + filename);
    return res.sendFile(fullfilepath);
});

//Storing functions
async function storeImg(espID) {
    cloudinary.v2.uploader.upload(
        "./images/newest.jpg", { public_id: espID + Date.now() },
        function(error, result) {
            console.log(result.url);
            return result.url
        }
    );
}
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
        moistureCollection = dbClient.db("GLTH").collection("moistureImg");
        // perform actions on the collection object
        console.log("connected to moistureImg-DB");
    }
});

function createDBentry(entry) {
    moistureCollection.insertOne(entry, (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log("added new entry to DB")
        }
    })
}