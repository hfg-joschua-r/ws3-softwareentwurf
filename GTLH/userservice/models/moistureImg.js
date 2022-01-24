const mongoose = require("mongoose");

const moistureImgSchema = new mongoose.Schema({
    espID: {
        type: String
    },
    imgUrl: {
        type: String,
    },
    createdAt: {
        type: Date
    },
}, { collection: 'moistureImg' })

module.exports = mongoose.model('moistureImg', moistureImgSchema);