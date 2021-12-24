require('dotenv').config()
const express = require("express");
const multer = require("multer");
const morgan = require("morgan")
const path = require('path');
const dataService = express();
const port = process.env.DATASERVICE_PORT;

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
                    '_' +
                    file.originalname
                );
            }
        }
    ), 
});
//API ENDPOINTS
dataService.get("/", (req, res) => {
    res.send("Welcome to GrowTimeLapseHelper");
});

dataService.listen(port, () => {
    console.log(`GrowTimeLapseHelper dataService listening at http://127.0.0.1:${port}`);
});
dataService.post("/api/imageUpload", imageUpload.single('image'), (req, res) => { 
    console.log(req.file);
    res.json('/image api'); 
});
dataService.get('/image/:filename', (req, res) => {
    const { filename } = req.params;
    const dirname = path.resolve();
    const fullfilepath = path.join(dirname, 'images/' + filename);
    return res.sendFile(fullfilepath);
});