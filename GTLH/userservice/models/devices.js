const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
    deviceID: {
        type: String,
        required: true
    },
    claimable: {
        type: Boolean,
        required: true
    },
    owner: {
        type: String
    }
}, { collection: 'registeredDevices' })

module.exports = mongoose.model('Device', deviceSchema);