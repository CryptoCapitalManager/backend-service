const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
    positionType: {
        type: String,
        required: true
    },
    tradingPair: {
        type: String,
        required: true
    },
    positionSize: {
        type: String,
        required: true
    },
    entryPrice: {
        type: Number,
    },
    stopLoss: {
        type: Number
    },
    takeProfit: {
        type: Number
    },
    exitPrice: {
        type: Number
    }
});

module.exports = mongoose.model('Position', positionSchema);