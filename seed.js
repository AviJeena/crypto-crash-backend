// seed.js
const mongoose = require('mongoose');
const Player = require('./models/Player');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const seedPlayers = async () => {
  await mongoose.connect(MONGO_URI);

  await Player.deleteMany({}); // Clear existing data

  await Player.insertMany([
    { username: 'jeena', wallet: { BTC: 0.05, ETH: 0.8 } },
    { username: 'alex', wallet: { BTC: 0.03, ETH: 0.5 } },
    { username: 'maria', wallet: { BTC: 0.02, ETH: 1.0 } },
    { username: 'rohan', wallet: { BTC: 0.06, ETH: 0.3 } },
    { username: 'sara', wallet: { BTC: 0.04, ETH: 0.6 } },
  ]);

  console.log('✅ Sample players inserted');
  process.exit();
};

seedPlayers();

