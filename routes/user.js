const express = require('express');
const router = express.Router();
const { ethers, BigNumber } = require('ethers');
const { readFileSync } = require('fs');
const { join } = require('path');
const UserInvestment = require('../models/investment');
const UserAccount = require('../models/user-account');


const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_GOERLI);


const contractAddress = '0xaCc276c03b28Afd822B8ef90A7180a3bE4Fb6ABb';
const contractABI = JSON.parse(readFileSync(join(__dirname, '../contracts/Trading.json'), 'utf-8'));;

const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);

let contractValue = 0;
contract.getContractValue().then(result => {
    contractValue = parseInt(result);
});

let totalUserOwnershipPoints = 0;
contract.gettotalUserOwnershipPoints().then(result => {
    totalUserOwnershipPoints = parseInt(result);
});

contract.on('userDeposit', async (user, investment) => {
    console.log('uso');
    console.log(user, investment);
    console.log('--------------------------------------------------');
    const i = await UserInvestment.find({ user: user }).countDocuments();
    console.log(i);
    const userInvestmnet = new UserInvestment({
        user: user,
        investment: {
            userOwnership: investment.userOwnership.toString(),
            initialInvestment: investment.initialInvestment.toString(),
            annualFeeColectedTime: investment.annualFeeColectedTime.toString()
        },
        investmentNumber: i
    });

    await userInvestmnet.save();

    totalUserOwnershipPoints += parseInt(investment.userOwnership);
    contractValue += parseInt(investment.initialInvestment);

    UserAccount.findOne({ userAddress: user })
        .then((account) => {
            if (account) {
                console.log('Found account:', account);

                account.balance += investment.userOwnership;
                account.totalInvested += investment.initialInvestment;

                const tmp = {
                    actionType: 'deposit',
                    amount: investment.initialInvestment,
                    date: new Date()
                }

                account.balanceChanges.push(tmp);

                account.save()
                    .then((updatedAccount) => {
                        console.log('Account updated successfully:', updatedAccount);
                    })
                    .catch((error) => {
                        console.error('Error occurred while updating account:', error);
                    });
            } else {
                console.log('Account not found.');

                const tmp = {
                    userAddress: user,
                    balance: investment.userOwnership,
                    totalInvested: investment.initialInvestment,
                    balanceChanges: [{
                        actionType: 'deposit',
                        amount: investment.initialInvestment,
                        date: new Date()
                    }]
                }

                const newUserAccount = new UserAccount(tmp);

                newUserAccount.save()
                    .then((savedAccount) => {
                        console.log('New user account saved successfully:', savedAccount);
                    })
                    .catch((error) => {
                        console.error('Error occurred while saving the new user account:', error);
                    });
            }
        })
        .catch((error) => {
            console.error('Error occurred:', error);
        });
});

contract.on('withdrawnFromInvestment', async (user, investment, amount) => {
    const userInvestment = await UserInvestment.findOne({ user: user, 'investment.annualFeeColectedTime': investment.annualFeeColectedTime.toString() });

    userInvestment.investment.userOwnership = investment.userOwnership.toString();

    const x = await contract.getContractValue();

    console.log(contractValue);

    await userInvestment.save();

    UserAccount.findOne({ userAddress: user })
        .then((account) => {
            if (account) {
                console.log('Found account:', account);

                account.balance -= amount;

                const tmp = {
                    actionType: 'withdraw',
                    amount: amount * (contractValue / totalUserOwnershipPoints),
                    date: new Date()
                }

                account.balanceChanges.push(tmp);

                account.save()
                    .then((updatedAccount) => {
                        console.log('Account updated successfully:', updatedAccount);
                    })
                    .catch((error) => {
                        console.error('Error occurred while updating account:', error);
                    });

            } else {
                console.log('Account not found.');
            }
        })
        .catch((error) => {
            console.error('Error occurred:', error);
        });

    contractValue = parseInt(x);
    totalUserOwnershipPoints -= parseInt(amount);
    
});

router.get('/', async (req, res) => {
    try {
        const userInvestments = await UserInvestment.find().select('-__v -_id -investment._id');
        res.json(userInvestments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:user', async (req, res) => {
    // console.log(totalUserOwnershipPoints.toString());
    // console.log(contractValue.toString());
    // try {
    //     const userInvestments = await UserInvestment.find({ user: req.params.user, 'investment.userOwnership': { $ne: '0' } })
    //         .select('-__v -_id -investment._id -investment.annualFeeColectedTime');
    //     res.json({
    //         userInvestments: userInvestments,
    //         usdToPointRatio: contractValue / totalUserOwnershipPoints
    //     });
    // } catch (error) {
    //     res.status(500).json({ message: error.message });
    // }





});

router.get('/accountvalue/:user', async (req, res) => {


});

router.get('/withdraw/:user', async (req, res) => {
    let amount = parseInt(req.query.amount);
    amount = amount / (contractValue / totalUserOwnershipPoints);

    try {
        const userInvestments = await UserInvestment.find({ user: req.params.user, 'investment.userOwnership': { $ne: '0' } })
            .select('-__v -_id -investment._id');
        const sorted = userInvestments.sort((a, b) => {
            if (a.investment.annualFeeColectedTime < b.investment.annualFeeColectedTime) {
                return -1;
            } else if (a.investment.annualFeeColectedTime > b.investment.annualFeeColectedTime) {
                return 1;
            } else {
                return 0;
            }
        });

        let response = [];

        for (let i = 0; i < sorted.length; i++) {
            console.log(parseInt(sorted[i].investment.userOwnership))
            if (amount > parseInt(sorted[i].investment.userOwnership)) {
                amount -= parseInt(sorted[i].investment.userOwnership);
                response.push({ invesmentNumber: sorted[i].investmentNumber, amount: sorted[i].investment.userOwnership });
            } else {
                response.push({ invesmentNumber: sorted[i].investmentNumber, amount: amount });
                break;
            }
        }
        res.json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});

module.exports = router;