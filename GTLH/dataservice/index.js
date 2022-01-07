require('dotenv').config()
const express = require("express");
const multer = require("multer");
const morgan = require("morgan")
const path = require('path');
const dataService = express();
const port = process.env.DATASERVICE_PORT;
const fs = require("fs");

dataService.use(express.json());
dataService.use(morgan('dev'));
// Create multer object
const imageUpload = multer({
    storage: multer.diskStorage(
        {
            destination: function (req, file, cb) {
                cb(null, 'images/');
            },
            filename: function (req, file, cb) {
                cb(
                    null,
                    new Date().valueOf() + 
                    '_sentImg'
                );
            }
        }
    ), 
});

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})
var upload = multer({ storage: storage })

//API ENDPOINTS
dataService.get("/", (req, res) => {
    res.send("Welcome to GrowTimeLapseHelper");
});
dataService.listen(port, () => {
    console.log(`GrowTimeLapseHelper dataService listening at http://127.0.0.1:${port}`);
});
dataService.post("/api/imageUpload2", imageUpload.single('image'), (req, res) => { 
    //console.log(req);
    console.log(JSON.stringify(req.file));
    res.status(200).json('/image api'); 
});
dataService.post("/api/imageUpload", (req, res) => { 
    //console.log(JSON.stringify(req.body.base64));
    let buffer = req.body.base64;
    let buf = Buffer.from(buffer, 'base64'); // Ta-da
    console.log(buf)
    fs.writeFileSync("./images/newest.jpg", buf);
    res.status(200).send('/image api'); 
});

dataService.get('/image/:filename', (req, res) => {
    const { filename } = req.params;
    const dirname = path.resolve();
    const fullfilepath = path.join(dirname, 'images/' + filename);
    return res.sendFile(fullfilepath);
});