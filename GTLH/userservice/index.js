require("dotenv").config();
const express = require("express");
const port = process.env.USERSERVICE_PORT;
const userService = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

userService.use(express.json());
userService.use(cors({
    credentials: true,
    origin: ['http://localhost:8080']
}));
userService.use(cookieParser());

userService.listen(port, () => {
    console.log(`GrowTimeLapseHelper User Service listening at http://127.0.0.1:${port}`);
});

//API ROUTES
const routes = require('./routes/routes.js');
userService.use('/api', routes);

//mongoose setup
const mongoose = require("mongoose");

const dbUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/GLTH?retryWrites=true&w=majority`;

mongoose.connect(dbUri, () => {
    console.log("connected to userDB")
})