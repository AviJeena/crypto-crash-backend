const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Player = require('./models/Player');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('📦 Connected to MongoDB for seeding');

  // Sample player data
  const players = [
    {
      username: 'jeena',
      wallet: {
        BTC: 0.002,
        ETH: 0.05,
      },
    },
    {
      username: 'raj',
      wallet: {
        BTC: 0.0015,
        ETH: 0.03,
      },
    },
    {
      username: 'priya',
      wallet: {
        BTC: 0.003,
        ETH: 0.02,
      },
    },
  ];

  await Player.deleteMany({});
  await Player.insertMany(players);

  console.log('✅ Seeded players successfully!');
  process.exit(0);
}).catch((err) => {
  console.error('❌ MongoDB seed error:', err);
  process.exit(1);
});
