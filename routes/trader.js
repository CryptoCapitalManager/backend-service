const express = require('express');
const router = express.Router();
const { ethers, BigNumber } = require('ethers');
const { readFileSync } = require('fs');
const { join } = require('path');
const UserInvestment = require('../models/investment');


const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_GOERLI);


const contractAddress = '0x8e717dC9DD1b9c837bBe8a6Ff42073d6Fee3fDdA';
const contractABI = JSON.parse(readFileSync(join(__dirname, '../contracts/Trading.json'), 'utf-8'));;

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contract = new ethers.Contract(contractAddress, contractABI.abi, wallet);

const authToken = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJnb3JldGljLmJvamFuQGdtYWlsLmNvbSIsImV4cCI6MTY3MTE1NTUwMSwiaWF0IjoxNjcxMTE5NTAxfQ.dn9IZeVL_XWcOsnVRiVxTPPp9bEzAwbPs0F3mWyI_VWndSvVljtKI_VpsBCWi1RMHzd9OqG3TWdfQ1ZqsDVISg';

const authorize = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        if (token === authToken) next();
        else res.status(401).send('Unauthorized');

    } else {
        res.status(401).send('Unauthorized');
    }
};

router.post('/enter-trade-market', authorize, (req, res) => {

});

//https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT
router.post('/enter-trade-limit', authorize, (req, res) => {

});

router.post('/cancel-trade-limit/:id', authorize, (req, res) => {

});

router.post('/close-decrese-position/:id', authorize, (req, res) => {

});

router.post('/update-trade-setup/:id', authorize, (req, res) => {

});

router.get('/open-orders', authorize, (req, res) => {

});

router.get('/positions', (req, res) => {

});









module.exports = router;