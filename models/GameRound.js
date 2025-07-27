const mongoose = require('mongoose');

const gameRoundSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date }, // Set after crash
  crashPoint: { type: Number }, // e.g., 2.3x
  seed: { type: String }, // Used to generate the hash
  hash: { type: String }, // SHA-256 hash of seed + roundNumber

  bets: [{
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    usdAmount: { type: Number, required: true },
    cryptoAmount: { type: Number, required: true },
    currency: { type: String, enum: ['BTC', 'ETH'], required: true },
    cashoutMultiplier: { type: Number }, // Optional, if player cashed out
    payout: { type: Number }, // Final payout in crypto
  }],
}, {
  timestamps: true // adds createdAt and updatedAt
});

module.exports = mongoose.model('GameRound', gameRoundSchema);
