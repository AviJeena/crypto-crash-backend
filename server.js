const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Inject io into every request for broadcasting from APIs
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
const gameRoutes = require('./routes/gameRoutes');
app.use('/api', gameRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Crypto Crash Backend is running');
});

// WebSocket Logic
const { getCurrentRound, startNewRound } = require('./services/roundManager');
const Player = require('./models/Player');
const { getCryptoPrices } = require('./services/priceService');
const Transaction = require('./models/Transaction');
const crypto = require('crypto');

io.on('connection', (socket) => {
  console.log('🔌 New player connected');

  // Join player to the "lobby" or global room
  socket.join('lobby');

  // (Optional) Join to round-specific room
  socket.on('join_round', (roundNumber) => {
    socket.join(`round_${roundNumber}`);
    console.log(`Player joined room: round_${roundNumber}`);
  });

  socket.on('cashout', async ({ username }) => {
    try {
      const round = getCurrentRound();
      if (!round) return;

      const player = await Player.findOne({ username });
      if (!player) return;

      const prices = await getCryptoPrices();
      const bet = round.bets.find(b => b.playerId.toString() === player._id.toString());
      if (!bet || bet.cashoutMultiplier) return;

      const currentMultiplier = global.multiplier || 1.0;
      if (currentMultiplier >= round.crashPoint) return;

      const payoutCrypto = bet.cryptoAmount * currentMultiplier;
      const usdEquivalent = payoutCrypto * prices[bet.currency];

      player.wallet[bet.currency] += payoutCrypto;
      await player.save();

      bet.cashoutMultiplier = currentMultiplier;
      bet.payout = payoutCrypto;
      await round.save();

      await Transaction.create({
        playerId: player._id,
        usdAmount: usdEquivalent,
        cryptoAmount: payoutCrypto,
        currency: bet.currency,
        transactionType: 'cashout',
        transactionHash: crypto.randomBytes(8).toString('hex'),
        priceAtTime: prices[bet.currency],
      });

      // Broadcast only to current round room
      io.to(`round_${round.roundNumber}`).emit('player_cashout', {
        username,
        payoutCrypto: payoutCrypto.toFixed(6),
        usdEquivalent: usdEquivalent.toFixed(2),
        multiplier: currentMultiplier.toFixed(2),
      });

      console.log(`💸 ${username} cashed out at ${currentMultiplier.toFixed(2)}x`);
    } catch (err) {
      console.error('Cashout error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Player disconnected');
  });
});

// Start the first round
startNewRound(io);

// Launch server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
