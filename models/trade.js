const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
    tradingPair: {
        type: String,
        required: true
    },
    positionType: {
        type: String,
        required: true
    },
    entryPrice: {
        type: Number,
        required: true
    },
    entryTX: {
        type: String,
        required: true
    },
    exitPrice: {
        type: Number,
        required: true
    },
    exitTX: {
        type: String,
        required: true
    },
    ROI: {
        type: Number,
        required: true
    },
    realROI: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Trade', tradeSchema);