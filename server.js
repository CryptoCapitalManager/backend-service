//TODO zameni mongodb connection string sa ENV
const express = require('express');
const app = express();
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/investiva');

const db = mongoose.connection;

db.on('error',(error)=>{
    console.log(error);
});

db.once('open',()=>{
    console.log('DB opened');
});

app.use(express.json());

const contactUsRouter = require('./routes/contact');
app.use('/contact',contactUsRouter);

const userRouter = require('./routes/user');
app.use('/user',userRouter);

const traderRouter = require('./routes/trader');
app.use('/trader',traderRouter);

// setInterval(() => {
//     console.log('aaa');
// }, 1000);


app.listen(3000, ()=>{
    console.log('Server listening on port 3000');
})