const crypto = require('crypto');

/**
 * Generate a provably fair crash point using a secure seed and round number.
 * Returns: { crashPoint, seed, hash }
 */
function generateCrashPoint(roundNumber) {
  const seed = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(seed + roundNumber).digest('hex');
  const number = parseInt(hash.substring(0, 8), 16); // Use first 8 hex chars
  const maxCrash = 12000; // represents 120.00x
  const crashRaw = number % maxCrash;
  const crashPoint = (crashRaw / 100).toFixed(2); // e.g., 1.35x, 3.75x
  return { crashPoint: parseFloat(crashPoint), seed, hash };
}

module.exports = { generateCrashPoint };