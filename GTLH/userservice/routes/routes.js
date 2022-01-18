require("dotenv").config();
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const User = require("../models/user.js")
const Device = require("../models/devices.js")
const moistureData = require("../models/moistureData.js")
const moistureImg = require("../models/moistureImg.js")
const userMiddleware = require('../middleware/users.js');

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
    console.log(req.params.deviceID)
    const values = await moistureData.find({ espID: req.params.deviceID }).sort({ 'createdAt': -1 }).limit(30);
    if (!values) {
        res.status(404).send("no values found for this user");
    }
    console.log("found following values: " + values)
    res.status(200).send(values)
});
router.get('/lastImages/:deviceID', userMiddleware.isLoggedIn, async(req, res) => {
    const images = await moistureImg.find({ espID: req.params.deviceID }).sort({ 'date': -1 }).limit(6);
    if (!images) {
        res.status(404).send("no values found for this user");
    }
    console.log("found following images: " + images)
    res.status(200).send(images)
});

/*router.get("/user", async(req, res) => {
    try {
        //console.log(req)
        const cookie = req.cookies['1']
        const claims = jwt.verify(cookie, process.env.JWT_SECRET)
        console.log(claims)
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            })
        }
        const user = await User.findOne({ _id: claims._id })
            //removing password from response
        const { password, ...data } = await user.toJSON();
        res.send(data);
    } catch (e) {
        return res.status(403).send({
            message: "unauthenticated"
        })
    }
})*/

/*router.post("/logout", (req, res) => {
    //cookie entfernen
    res.cookie("jwt", "", { maxAge: 0 })
    res.send({
        message: "erfolgreich ausgeloggt"
    })
})*/

module.exports = router