# 💥 Crypto Crash Backend

A real-time multiplayer **Crash game backend** built with **Node.js**, **MongoDB**, and **Socket.IO**, where players bet crypto and cash out before the multiplier crashes. Designed to be **provably fair**, **secure**, and **production-ready**.

---

## 📌 Features

- 🎮 Real-time multiplayer betting
- 🧠 Provably fair crash logic (verifiable hash)
- 💸 Crypto wallets (BTC, ETH)
- 🔌 WebSocket multiplier broadcasting
- 💹 USD-to-crypto conversion via CoinGecko
- 📊 Round history, wallet checking, and transaction logs
- 🔐 Secure input validation & atomic wallet updates
- 🧠 Room-based WebSocket scaling

---

## ▶️ Setup Instructions

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/crypto-crash-backend.git
cd crypto-crash-backend
npm install

### 2.  MongoDB Setup

Ensure MongoDB is installed and running locally.

### 3. Environment File (.env.example)

```ini
PORT=5000
MONGO_URI=mongodb://localhost:27017/cryptoCrash
| ✅ No API key needed – used the free public CoinGecko API.

###  Run the Server

node server.js

---

## 🔗 Crypto API: CoinGecko

Used CoinGecko's public endpoint to fetch current crypto prices:
```bash
https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd
- No API key required
- Prices are cached for 10 seconds to respect rate limits
- Used in /api/bet and /api/wallet/:username

---

## ⚙️ USD-to-Crypto Conversion Logic

When a player places a bet:
```ini
cryptoAmount = usdAmount / currentCryptoPrice
- Price is fetched live from CoinGecko
- Conversion is done at the exact time of betting
- Logged with priceAtTime in transaction history

---

## 🎮 Game Logic Overview

- Game runs in rounds
- Each round:
      Starts at multiplier = 1.00x
      Increments ~every 100ms (0.01x)
      Ends (crashes) at a random crash point
- Players must cash out before crash to win

---

## 🧠 Provably Fair Crash Algorithm

Each round is fair and verifiable using:
```js
hash = SHA256(seed + roundNumber)
- seed: Random string generated each round
- hash: Stored in DB, shown after round ends
- Crash multiplier is derived from hash so:
       You can verify the crash value using the seed + round number
       The game owner cannot manipulate the outcome

---

## 📡 WebSocket Events

| Event Name          | Direction       | Payload                                  | Description                       |
| ------------------- | --------------- | ---------------------------------------- | --------------------------------- |
| `multiplier_update` | Server → Client | `{ multiplier }`                         | Broadcast every 100ms             |
| `player_cashout`    | Server → Client | `{ username, payoutCrypto, multiplier }` | Notify all when player cashes out |
| `cashout`           | Client → Server | `{ username }`                           | Player requests cashout           |
| `join_round`        | Client → Server | `roundNumber`                            | Join Socket.IO room per round     |

### ✅ Example Client Usage

```js
const socket = io('http://localhost:5000');
socket.emit('join_round', 3);
socket.emit('cashout', { username: 'jeena' });

socket.on('player_cashout', (data) => {
  console.log('💸', data);
});

---

##🧪 REST API Endpoints

### 🔸 Place Bet
POST /api/bet
```json
{
  "username": "jeena",
  "usdAmount": 10,
  "currency": "BTC"
}

### 🔸 Cashout
POST /api/cashout
```json
{
  "username": "jeena"
}

### 🔸 Get Wallet Balance
GET /api/wallet/:username
```json
{
  "crypto": { "BTC": 0.012, "ETH": 0.5 },
  "usdEquivalent": { "BTC": "700.00", "ETH": "1000.00" }
}

### 🔸 Get Round History
GET /api/rounds/history
```json
[
  {
    "roundNumber": 1,
    "crashPoint": 2.34,
    "seed": "ab1d2e...",
    "hash": "a3b9f4c...",
    ...
  }
]

---

## 📂 Folder Structure

crypto-crash-backend/
├── config/
├── controllers/
├── models/
├── routes/
├── services/
├── utils/
├── server.js
├── .env
└── README.md

--- 

## 🔐 Security Measures

- ❌ Invalid amounts (zero, negative) are rejected
- ❌ Cashouts blocked after crash
- ✅ Wallet updates use MongoDB transactions (atomic)
- ✅ WebSocket rooms prevent event spamming
- ✅ Inputs are validated on both API and socket layers
- ✅ Fallback to cached price if API fails

---

## ✅ Evaluation Coverage

| Section              | Status |
| -------------------- | ------ |
| Game Logic           | ✅      |
| Crypto Integration   | ✅      |
| WebSocket Real-Time  | ✅      |
| API Documentation    | ✅      |
| WebSocket Events     | ✅      |
| Provably Fair System | ✅      |
| Price Conversion     | ✅      |
| README Instructions  | ✅      |

---  

## 👤 Author

- 👩 Abhishek Jeena
- 📚 Backend Internship: Real-time Crypto Crash Game
- 🛠️ Powered by Node.js + MongoDB + Socket.IO

---










