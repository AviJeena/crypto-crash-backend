const axios = require('axios');

let cachedPrices = {};
let lastFetch = 0;
const CACHE_DURATION = 10000; // 10 seconds

async function getCryptoPrices() {
  const now = Date.now();
  if (now - lastFetch < CACHE_DURATION && cachedPrices.BTC) {
    return cachedPrices;
  }

  const res = await axios.get(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd'
  );

  const prices = {
    BTC: res.data.bitcoin.usd,
    ETH: res.data.ethereum.usd,
  };

  cachedPrices = prices;
  lastFetch = now;

  return prices;
}

module.exports = { getCryptoPrices };
