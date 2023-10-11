const express = require('express');
const router = express.Router();
const { ethers, BigNumber } = require('ethers');
const { readFileSync } = require('fs');
const { join } = require('path');
const https = require('https');
const Position = require('../models/position');


const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_ARBITRUM_GOERLI);


const contractAddress = '0x47d3a0da4068c96a2e196b85c5bceb85d26f9c16';
const contractABI = JSON.parse(readFileSync(join(__dirname, '../contracts/Trading.json'), 'utf-8'));;

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contract = new ethers.Contract(contractAddress, contractABI.abi, wallet);

const authToken = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJnb3JldGljLmJvamFuQGdtYWlsLmNvbSIsImV4cCI6MTY3MTE1NTUwMSwiaWF0IjoxNjcxMTE5NTAxfQ.dn9IZeVL_XWcOsnVRiVxTPPp9bEzAwbPs0F3mWyI_VWndSvVljtKI_VpsBCWi1RMHzd9OqG3TWdfQ1ZqsDVISg';

let inTrade = 0;

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



router.post('/enter-trade-market', authorize, async (req, res) => {
    const position = new Position({
        positionType: req.positionType,
        tradingPair: req.tradingPair,
        positionSize: req.positionSize,
        entryPrice: getCurrentPrice(req.tradingPair),
        stopLoss: req.stopLoss,
        takeProfit: req.takeProfit
    });

    enterPosition(position);

    await position.save();

    //DODAJ INVESTMENT

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

router.get('/positions', authorize, (req, res) => {

});

router.get('/test', authorize, async (req, res) => {
    res.send(await getCurrentPrice('BTCUSDC'));
});

async function getCurrentPrice(tradingPair) {
    let path = 'https://api.binance.com/api/v3/ticker/price?symbol='
    path = path.concat(tradingPair);
    path = path.slice(0, -1) + 'T';

    try {
        const response = await makeHttpsRequest(path);
        return JSON.parse(response).price;
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

function makeHttpsRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                resolve(data);
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

async function executeTransaction(size, way) {
    //Enter trade
    if (way == true) {
        await trading.swapTokensMultihop(size, '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', '0x07865c6E87B9F70255377e024ace6630C1Eaa37F', 500, 500, 0);
    }
    //Exit trade
    else {
        
    }

}



module.exports = router;