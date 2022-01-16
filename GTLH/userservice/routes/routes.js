require("dotenv").config();
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const User = require("../models/user.js")

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
    res.send(data);
})

router.post("/login", async(req, res) => {
    const user = await User.findOne({ email: req.body.email })

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
    const token = jwt.sign({ _id: user._id }, "test")

    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 //1 Tag lang
    })
    res.send({
        message: "erfolgreich eingeloggt"
    })
})

router.get("/user", async(req, res) => {
    try {
        const cookie = req.cookies['jwt']
        const claims = jwt.verify(cookie, "test")
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
        return res.status(401).send({
            message: "unauthenticated"
        })
    }
})

router.post("/logout", (req, res) => {
    //cookie entfernen
    res.cookie("jwt", "", { maxAge: 0 })
    res.send({
        message: "erfolgreich ausgeloggt"
    })
})

module.exports = router