require("dotenv").config();
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const User = require("../models/user.js")
const Device = require("../models/devices.js")
const moistureData = require("../models/moistureData.js")
const moistureImg = require("../models/moistureImg.js")
const userMiddleware = require('../middleware/users.js');
const devices = require("../models/devices.js");

router.get("/", (req, res) => {
    res.send("Welcome to GrowTimeLapseHelper User Verwaltung");
});

//Register endpoint um einen neuen User zu registrieren
router.post('/register', async(req, res) => {
    //Passwort wird zuerst gehashed
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
    })
    const result = await user.save()
        //Passwort von Antwort entfernen
    const { password, ...data } = await result.toJSON();
    res.send(data);
})

//Login endpoint um einen User anzumelden, bei erfolgreicher Anmeldung wird ein jwt token zurückgegeben
router.post("/login", async(req, res) => {
    const user = await User.findOne({ email: req.body.username })
    if (!user) {
        return res.status(404).send({
            message: "user not found"
        })
    }
    //passwort überprüfen
    if (!await bcrypt.compare(req.body.password, user.password)) {
        return res.status(400).send({
            message: "invalid credentials"
        })
    }
    //JWT token generieren, welches 24 Stunden gültig ist
    //Mögliche next steps: jwt refresh token einbauen
    const token = jwt.sign({ _id: user._id.toJSON() }, process.env.JWT_SECRET, { expiresIn: '24h' })
    res.send({
        id: user._id,
        username: user.username,
        email: user.email,
        accessToken: token,
        message: "erfolgreich eingeloggt"
    })
})

//Alle Devices in device-Datenbank mit zugehörigem owner finden und zurückgeben
//Route ist nur durch eingeloggte User erreichbar, da die Route durch unsere userMiddleware und der isLoggedIn Funktion geschützt wird
router.get('/pairedDevices/:username', userMiddleware.isLoggedIn, async(req, res) => {
    const devices = await Device.find({ owner: req.params.username })
    if (!devices) {
        res.status(404).send("no devices found for this user");
    }
    console.log("found following devices: " + devices)
    res.status(200).send(devices)
});

//Letzte Werte für die angegebene DeviceID finden und zurückgeben
//Diese Route ist ebenfalls gesichert
router.get('/lastValues/:deviceID', userMiddleware.isLoggedIn, async(req, res) => {
    const values = await moistureData.find({ espID: req.params.deviceID }).sort({ 'createdAt': -1 }).limit(90);
    if (!values) {
        res.status(404).send("no values found for this user");
    }
    res.status(200).send(values)
});

//Letzte Bilder(URL's) für die angegebene DeviceID finden und zurückgeben
//Diese Route ist ebenfalls gesichert
router.get('/lastImages/:deviceID', userMiddleware.isLoggedIn, async(req, res) => {
    const images = await moistureImg.find({ deviceID: req.params.deviceID }).sort({ 'createdAt': -1 }).limit(50);
    if (!images) {
        res.status(404).send("no values found for this user");
    }
    console.log("found following images: " + images)
    res.status(200).send(images)
});

//Route um neuen Device zu pairen, benötigt wird der owner Name und die DeviceID
router.post('/pairDevice', userMiddleware.isLoggedIn, async(req, res) => {
    //check if device(ID) exist
    const device = await devices.findOne({ deviceID: req.body.deviceID })
    if (!device) {
        res.status(404).send("no device found for this deviceID");
    }
    //Jeder device besitzt eine claimable bool, die true sein muss um erfolgreich zu pairen
    if (device.claimable && device.owner === "temp") {
        //update device to not claimable and owner
        device.owner = req.body.username;
        device.claimable = false;
        console.log(device)
        device.save(function(err) {
            if (!err) {
                console.log("device " + device.deviceID + " now claimed by " + device.owner);
                res.status(200).send("OK")
            } else {
                console.log("Error: could not claim device " + device);
                res.status(500).send("Couldn't claim device")
            }
        });
    }
});

//Route um vorhandenes Bild zu löschen, ebenfalls geschützt durch unsere middleware
router.post('/deleteImage', userMiddleware.isLoggedIn, async(req, res) => {
    const deleteUrl = req.body.imgUrl
    console.log(deleteUrl)
    moistureImg.deleteOne({ imgUrl: deleteUrl }, function(err) {
        if (err) return handleError(err);
    });
    res.status(200).send("sucessfully deleted img");

})

//route um nähestes bild für eintrag zu verwenden
router.post('/nearestImg', userMiddleware.isLoggedIn, async(req, res) => {
    const date = req.body.date;
    const deviceID = req.body.deviceID
    const dbRes = await moistureImg.find({
        "deviceID": deviceID,
        "createdAt": {
            "$lte": date
        }
    }).sort({ "createdAt": -1 }).limit(1)
    if (dbRes) {
        console.log(dbRes)
        res.status(200).send(dbRes)
    }
})

//route um nähesten Sensor Wert für datum zu finden
router.post('/nearestVal', userMiddleware.isLoggedIn, async(req, res) => {
    const date = req.body.date;
    const deviceID = req.body.deviceID
    const dbRes = await moistureData.find({
        "deviceID": deviceID,
        "createdAt": {
            "$lte": date
        }
    }).sort({ "createdAt": -1 }).limit(1)
    if (dbRes) {
        res.status(200).send(dbRes)
    }
})

module.exports = router