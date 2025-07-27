const { generateCrashPoint } = require('../utils/crashGenerator');
const GameRound = require('../models/GameRound');

let currentRound = null;
let roundNumber = 1;
let multiplier = 1.00;
let crashMultiplier = 0;
let interval = null;
const growthRate = 0.02; // adjust for faster multiplier increase

function startNewRound(io) {
  const { crashPoint, seed, hash } = generateCrashPoint(roundNumber);

  currentRound = new GameRound({
    roundNumber,
    startTime: new Date(),
    crashPoint,
    seed,
    hash,
    bets: [],
  });

  multiplier = 1.00;
  crashMultiplier = crashPoint;

  io.emit('round_start', {
    roundNumber,
    crashPoint: 'hidden',
  });

  interval = setInterval(async () => {
    multiplier += growthRate;
    io.emit('multiplier_update', { multiplier: multiplier.toFixed(2) });

    if (multiplier >= crashMultiplier) {
      clearInterval(interval);
      currentRound.crashPoint = crashMultiplier;
      currentRound.endTime = new Date();
      await currentRound.save();
      
      io.emit('round_crash', {
        crashPoint: crashMultiplier,
      });

      roundNumber += 1;
      setTimeout(() => startNewRound(io), 10000); // next round in 10 sec
    }
  }, 100); // update every 100ms
}

function getCurrentRound() {
  return currentRound;
}

module.exports = {
  startNewRound,
  getCurrentRound,
};
