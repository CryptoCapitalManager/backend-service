//TODO zameni mongodb connection string sa ENV
const express = require('express');
const app = express();
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

mongoose.connect(process.env.MONGO_URI);       

const db = mongoose.connection;

const PORT = process.env.PORT || 3000;

db.on('error', (error) => {
    console.log(error);
});

db.once('open', () => {
    console.log('DB opened');
});

//db.dropDatabase();

app.use(express.json());

const contactUsRouter = require('./routes/contact');
app.use('/contact', contactUsRouter);

const userRouter = require('./routes/user');
app.use('/user', userRouter);

const traderRouter = require('./routes/trader');
app.use('/trader', traderRouter);

const dataRouter = require('./routes/data');
app.use('/data',dataRouter);

// setInterval(() => {
//     console.log('aaa');
// }, 1000);




app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})