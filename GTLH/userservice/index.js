require("dotenv").config();
const express = require("express");
const port = process.env.USERSERVICE_PORT;
const userService = express();
const cors = require("cors");

userService.use(express.json());
const corsOptions = {
    origin: "http://127.0.0.1:8080",
    credentials: true,
};
userService.use(cors(corsOptions));
userService.listen(port, () => {
    console.log(`GrowTimeLapseHelper User Service listening at http://127.0.0.1:${port}`);
});

userService.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

//Router setup unter /api
const routes = require('./routes/routes.js');
userService.use('/api', routes);

//mongoose setup
const mongoose = require("mongoose");
const dbUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/GLTH?retryWrites=true&w=majority`;
mongoose.connect(dbUri, () => {
    console.log("connected to userDB")
})