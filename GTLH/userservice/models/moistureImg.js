const mongoose = require("mongoose");

const moistureImgSchema = new mongoose.Schema({
    espID: {
        type: String,
        required: true
    },
    imgUrl: {
        type: String,
    },
    createdAt: {
        type: Date
    },
}, { collection: 'moistureImg' })

module.exports = mongoose.model('moistureImg', moistureImgSchema);