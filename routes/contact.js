const express = require('express');
const router = express.Router();
const Message = require('../models/message');

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

router.post('/', async (req, res) => {
    console.log(req.body.text);
    const message = new Message({
        email: req.body.email,
        text: req.body.text
    });
    try {
        await message.save();
        res.status(201).json({message: 'Message sent sucessfully'});
    } catch (error) {
        res.status(400).json({message: error.message});
    }
});

router.get('/', authorize, async (req, res) => {
    try {
        const messages = await Message.find().select('-__v -_id');
        res.json({messages: messages})
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

module.exports = router;