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

module.exports = mongoose.model('UserInvestment', userInvestmentSchema);