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
router.post('/register', async(req, res) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
    })
    const result = await user.save()
        //passwort von Antwort entfernen
    const { password, ...data } = await result.toJSON();
    console.log("new user registered");
    res.send(data);
})

router.post("/login", async(req, res) => {
    console.log("logging in " + JSON.stringify(req.body))
    const user = await User.findOne({ email: req.body.username })
    if (!user) {
        return res.status(404).send({
            message: "user not found"
        })
    }
    if (!await bcrypt.compare(req.body.password, user.password)) {
        return res.status(400).send({
            message: "invalid credentials"
        })
    }
    const token = jwt.sign({ _id: user._id.toJSON() }, process.env.JWT_SECRET, { expiresIn: '24h' })
    console.log("user logging in");
    res.send({
        id: user._id,
        username: user.username,
        email: user.email,
        accessToken: token,
        message: "erfolgreich eingeloggt"
    })
})

router.get("/profile", userMiddleware.isLoggedIn, (req, res) => {
    console.log(req.userData);
    res.send('This is the secret content. Only logged in users can see that!');
})

router.get('/pairedDevices/:username', userMiddleware.isLoggedIn, async(req, res) => {
    const devices = await Device.find({ owner: req.params.username })
    if (!devices) {
        res.status(404).send("no devices found for this user");
    }
    console.log("found following devices: " + devices)
    res.status(200).send(devices)
});

router.get('/lastValues/:deviceID', userMiddleware.isLoggedIn, async(req, res) => {
    const values = await moistureData.find({ espID: req.params.deviceID }).sort({ 'createdAt': -1 }).limit(50);
    if (!values) {
        res.status(404).send("no values found for this user");
    }
    res.status(200).send(values)
});

router.get('/lastImages/:deviceID', userMiddleware.isLoggedIn, async(req, res) => {
    const images = await moistureImg.find({ deviceID: req.params.deviceID }).sort({ 'createdAt': -1 }).limit(20);
    if (!images) {
        res.status(404).send("no values found for this user");
    }
    console.log("found following images: " + images)
    res.status(200).send(images)
});

router.post('/pairDevice', userMiddleware.isLoggedIn, async(req, res) => {
    //check if device exist
    const device = await devices.findOne({ deviceID: req.body.deviceID })
    if (!device) {
        res.status(404).send("no device found for this deviceID");
    }

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

module.exports = router