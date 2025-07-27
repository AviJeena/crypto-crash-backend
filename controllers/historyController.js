const GameRound = require('../models/GameRound');

exports.getRoundHistory = async (req, res) => {
  try {
    const rounds = await GameRound.find()
      .sort({ createdAt: -1 })
      .limit(20);

    const history = rounds.map((round) => ({
      crashPoint: round.crashPoint,
      seed: round.seed,
      hash: round.hash,
      bets: round.bets.length,
      timestamp: round.createdAt,
    }));

    res.status(200).json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch round history' });
  }
};
