const mongoose = require('mongoose');
const Player = require('../models/Player');
const GameRound = require('../models/GameRound');
const Transaction = require('../models/Transaction');
const { getCryptoPrices } = require('../services/priceService');
const { getCurrentRound } = require('../services/roundManager');
const crypto = require('crypto');

exports.placeBet = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { username, usdAmount, currency } = req.body;

    if (!['BTC', 'ETH'].includes(currency)) {
      return res.status(400).json({ msg: 'Invalid currency' });
    }

    if (usdAmount <= 0) {
      return res.status(400).json({ msg: 'Invalid bet amount. Must be greater than 0.' });
    }

    const prices = await getCryptoPrices();
    const cryptoPrice = prices[currency];
    const cryptoAmount = usdAmount / cryptoPrice;

    const player = await Player.findOne({ username }).session(session);
    if (!player || player.wallet[currency] < cryptoAmount) {
      return res.status(400).json({ msg: 'Insufficient funds' });
    }

    const round = getCurrentRound();
    if (!round) {
      return res.status(400).json({ msg: 'No active round' });
    }

    // Deduct player balance
    player.wallet[currency] -= cryptoAmount;
    await player.save({ session });

    // Add bet to round
    round.bets.push({
      playerId: player._id,
      usdAmount,
      cryptoAmount,
      currency,
    });
    await round.save({ session });

    // Log transaction
    await Transaction.create([{
      playerId: player._id,
      usdAmount,
      cryptoAmount,
      currency,
      transactionType: 'bet',
      transactionHash: crypto.randomBytes(8).toString('hex'),
      priceAtTime: cryptoPrice,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ msg: 'Bet placed successfully', cryptoAmount });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Transaction error:', err);
    return res.status(500).json({ msg: 'Server error during bet placement' });
  }
};
