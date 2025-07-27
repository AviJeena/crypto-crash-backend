const Player = require('../models/Player');
const GameRound = require('../models/GameRound');
const Transaction = require('../models/Transaction');
const { getCryptoPrices } = require('../services/priceService');
const { getCurrentRound } = require('../services/roundManager');
const crypto = require('crypto');

exports.cashout = async (req, res) => {
  try {
    const { username } = req.body;
    const round = getCurrentRound();
    if (!round) return res.status(400).json({ msg: 'No active round' });

    const prices = await getCryptoPrices();
    const player = await Player.findOne({ username });
    if (!player) return res.status(404).json({ msg: 'Player not found' });

    const bet = round.bets.find(b => b.playerId.toString() === player._id.toString());
    if (!bet || bet.cashoutMultiplier)
      return res.status(400).json({ msg: 'Already cashed out or no bet' });

    const currentMultiplier = global.multiplier || 1.00;
    if (currentMultiplier >= round.crashPoint) {
      return res.status(400).json({ msg: 'Too late! Round already crashed' });
    }

    // Calculate payout
    const payoutCrypto = bet.cryptoAmount * currentMultiplier;
    const usdEquivalent = payoutCrypto * prices[bet.currency];

    // Update wallet
    player.wallet[bet.currency] += payoutCrypto;
    await player.save();

    // Mark cashout
    bet.cashoutMultiplier = currentMultiplier;
    bet.payout = payoutCrypto;
    await round.save();

    // Log transaction
    await Transaction.create({
      playerId: player._id,
      usdAmount: usdEquivalent,
      cryptoAmount: payoutCrypto,
      currency: bet.currency,
      transactionType: 'cashout',
      transactionHash: crypto.randomBytes(8).toString('hex'),
      priceAtTime: prices[bet.currency],
    });

    // Emit via WebSocket (to be connected later)
    req.io.emit('player_cashout', {
      username,
      payoutCrypto: payoutCrypto.toFixed(6),
      usdEquivalent: usdEquivalent.toFixed(2),
      multiplier: currentMultiplier.toFixed(2),
    });

    res.status(200).json({ msg: 'Cashed out successfully', usdEquivalent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
