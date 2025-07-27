const express = require('express');
const router = express.Router();

const { placeBet } = require('../controllers/betController');
const { cashout } = require('../controllers/cashoutController');
const { getRoundHistory } = require('../controllers/historyController');

const Player = require('../models/Player');
const { getCryptoPrices } = require('../services/priceService');

// ==========================
// POST Routes
// ==========================
router.post('/bet', placeBet);
router.post('/cashout', cashout);

// ==========================
// GET Wallet Balance
// ==========================
router.get('/wallet/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const player = await Player.findOne({ username });

    if (!player) return res.status(404).json({ msg: 'Player not found' });

    const prices = await getCryptoPrices();
    const wallet = player.wallet;

    const walletUSD = {
      BTC: (wallet.BTC * prices.BTC).toFixed(2),
      ETH: (wallet.ETH * prices.ETH).toFixed(2),
    };

    res.status(200).json({
      crypto: wallet,
      usdEquivalent: walletUSD,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ==========================
// GET Round History
// ==========================
router.get('/rounds/history', getRoundHistory);

module.exports = router;
