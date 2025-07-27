const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  usdAmount: Number,
  cryptoAmount: Number,
  currency: String,
  transactionType: { type: String, enum: ['bet', 'cashout'] },
  transactionHash: String, // mock hash
  priceAtTime: Number, // USD per crypto
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);