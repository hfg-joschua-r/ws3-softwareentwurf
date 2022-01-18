const mongoose = require("mongoose");

const moistureDataSchema = new mongoose.Schema({
    espID: {
        type: String,
        required: true
    },
    moisture: {
        type: String,
    },
    airQual: {
        type: String
    },
    createdAt: {
        type: Date
    },
}, { collection: 'moistureData' })

module.exports = mongoose.model('moistureData', moistureDataSchema);