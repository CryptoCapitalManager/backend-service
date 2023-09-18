const express = require('express');
const router = express.Router();
const Trade = require('../models/trade');
const UserAccount = require('../models/user-account');

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

router.get('/trades', async (req, res) => {
    try {
        const trades = await Trade.find().select('-__v -_id');
        res.json({ messages: trades.reverse() });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/add-trade', authorize, async (req, res) => {
    console.log(req.body.tradingPair);
    const trade = new Trade({
        tradingPair: req.body.tradingPair,
        positionType: req.body.positionType,
        entryPrice: req.body.entryPrice,
        entryTX: req.body.entryTX,
        exitPrice: req.body.exitPrice,
        exitTX: req.body.exitTX,
        ROI: req.body.ROI,
        realROI: req.body.realROI,
        //new Date('2023-07-27T18:00:00');
        date: new Date(req.body.date)
    });
    try {
        await trade.save();
        res.status(201).json({ message: 'Trade saved sucessfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }

});

router.get('/calculator', async (req, res) => {
    try {
        const trades = await Trade.find().select('-_id date realROI');
        res.json(trades)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/add-user-account', authorize, async (req, res) => {
    console.log(req.body);
    const userAccount = new UserAccount({
        userAddress: req.body.userAddress,
        balance: req.body.balance,
        totalInvested: req.body.totalInvested,
        balanceChanges: req.body.balanceChanges
    });
    try {
        await userAccount.save();
        res.status(201).json({ message: 'User account saved sucessfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/user-account/:address', async (req, res) => {
    try {
        console.log(req.params.address.toLocaleLowerCase());
        const userAccount = await UserAccount.findOne({ userAddress: req.params.address.toLocaleLowerCase() }).select('-balanceChanges._id -__v -_id');
        const trades = await Trade.find().select('-__v -_id');
        let userBalanceChanges = [];
        userBalanceChanges.push(userAccount.balanceChanges[0]);
        let userActionNumber = 1;
        let currentAmount = parseInt(userAccount.balanceChanges[0].amount);
        let totalDeposited = currentAmount;
        let totalWithdrawn = 0;
        let i = 0;
        
        while(userAccount.balanceChanges[0].date > trades[i].date)i++;

        for (i; i < trades.length; i++) {
            console.log(userAccount.balanceChanges[userActionNumber].date);
            console.log(userActionNumber);
            if (userAccount.balanceChanges[userActionNumber] != undefined && userAccount.balanceChanges[userActionNumber].date < trades[i].date) {
                console.log('aaa');
                if (userAccount.balanceChanges[userActionNumber].actionType == 'deposit') {
                    currentAmount += parseInt(userAccount.balanceChanges[userActionNumber].amount);
                    totalDeposited += parseInt(userAccount.balanceChanges[userActionNumber].amount);
                }
                else {
                    console.log('usoo');
                    currentAmount -= parseInt(userAccount.balanceChanges[userActionNumber].amount);
                    totalWithdrawn += parseInt(userAccount.balanceChanges[userActionNumber].amount);
                }

                userBalanceChanges.push({
                    actionType: userAccount.balanceChanges[userActionNumber].actionType,
                    amount: currentAmount,
                    date: userAccount.balanceChanges[userActionNumber].date
                });

                userActionNumber++;
                i--;
                continue;
            }
            
            currentAmount = currentAmount * ((100 + trades[i].realROI) / 100);
            
            userBalanceChanges.push({
                actionType: 'trade',
                amount: currentAmount,
                date: trades[i].date
            });
        }

        while(userAccount.balanceChanges[userActionNumber]!= undefined){
            
            if (userAccount.balanceChanges[userActionNumber].actionType == 'deposit') {
                currentAmount += parseInt(userAccount.balanceChanges[userActionNumber].amount);
                totalDeposited += parseInt(userAccount.balanceChanges[userActionNumber].amount);
            }
            else {
                console.log('usoo');
                currentAmount -= parseInt(userAccount.balanceChanges[userActionNumber].amount);
                totalWithdrawn += parseInt(userAccount.balanceChanges[userActionNumber].amount);
            }

            userBalanceChanges.push({
                actionType: userAccount.balanceChanges[userActionNumber].actionType,
                amount: currentAmount,
                date: userAccount.balanceChanges[userActionNumber].date
            });

            userActionNumber++;
        }

        let ROI = (totalWithdrawn + userBalanceChanges[userBalanceChanges.length-1].amount) / totalDeposited;
        ROI = (ROI - 1) * 100;
        
        res.json({
            balance: userBalanceChanges[userBalanceChanges.length-1].amount,
            totalDeposited: totalDeposited,
            totalWithdrawn: totalWithdrawn,
            balanceChanges: userBalanceChanges,
            ROI: ROI
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;