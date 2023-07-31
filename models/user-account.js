const mongoose = require('mongoose');

const balanceChangeSchema = new mongoose.Schema({
    actionType: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});

const userAccountSchema = new mongoose.Schema({
    userAddress: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    totalInvested: {
        type: Number,
        required: true
    },
    balanceChanges: {
        type: [balanceChangeSchema],
        default: []
    }
});

module.exports = mongoose.model('UserAccount', userAccountSchema);