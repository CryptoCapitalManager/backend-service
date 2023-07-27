const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
    userOwnership: {
        type: String,
        required: true
    },
    initialInvestment: {
        type: String,
        required: true
    },
    annualFeeColectedTime: {
        type: String,
        required: true
    }
});

const userInvestmentSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    investment: {
        type: investmentSchema,
        required: true
    },
    investmentNumber: {
        type: Number,
        required: true
    }
});

const userInvestmentStateRecordSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    totalInvestmentValue: {
        type: Number,
        required: true
    }
});

const userInvestmentStateSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    userInvestmentChanges: [userInvestmentStateRecordSchema]
});


module.exports = mongoose.model('UserInvestment', userInvestmentSchema);