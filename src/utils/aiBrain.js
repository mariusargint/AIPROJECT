// Advanced AI Algorithm: RSI + Bollinger Bands + ATR
// Strategy: "Squeeze & Bounce"

export function analyzeMarket(closes, highs, lows) {
  if (!closes || closes.length < 20) return null;

  // 1. Calculate Indicators
  const rsi = calculateRSI(closes, 14);
  const bb = calculateBollingerBands(closes, 20, 2);
  const atr = calculateATR(highs, lows, closes, 14);
  const lastPrice = closes[closes.length - 1];

  // 2. Define Strategy Logic
  // BUY SIGNAL: RSI is low (< 40) AND Price is touching Lower Bollinger Band
  const isOversold = rsi < 40;
  const isLowerBandHit = lastPrice <= bb.lower * 1.001; // Within 0.1% of lower band

  // SELL SIGNAL: RSI is high (> 60) AND Price is touching Upper Bollinger Band
  const isOverbought = rsi > 60;
  const isUpperBandHit = lastPrice >= bb.upper * 0.999; // Within 0.1% of upper band

  // 3. Risk Management Math (Reward 5% : Risk 1%)
  const stopLossPercent = 0.01; // 1%
  const takeProfitPercent = 0.05; // 5%

  if (isOversold && isLowerBandHit) {
    return {
      type: 'BUY',
      strength: 'STRONG',
      reason: `Price hit Lower Bollinger Band ($${bb.lower.toFixed(2)}) + RSI Oversold (${rsi.toFixed(0)}).`,
      entry: lastPrice,
      stopLoss: lastPrice * (1 - stopLossPercent),
      takeProfit: lastPrice * (1 + takeProfitPercent),
      color: '#0ecb81'
    };
  } 
  
  else if (isOverbought && isUpperBandHit) {
    return {
      type: 'SELL',
      strength: 'STRONG',
      reason: `Price hit Upper Bollinger Band ($${bb.upper.toFixed(2)}) + RSI Overbought (${rsi.toFixed(0)}).`,
      entry: lastPrice,
      stopLoss: lastPrice * (1 + stopLossPercent),
      takeProfit: lastPrice * (1 - takeProfitPercent),
      color: '#f6465d'
    };
  }

  return {
    type: 'HOLD',
    color: '#848e9c',
    reason: 'Market consolidating inside Bollinger Bands.'
  };
}

// --- MATH HELPERS (No Libraries needed) ---

function calculateRSI(prices, period = 14) {
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    diff >= 0 ? gains += diff : losses += Math.abs(diff);
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) { avgGain = (avgGain * 13 + diff) / 14; avgLoss = (avgLoss * 13) / 14; }
    else { avgGain = (avgGain * 13) / 14; avgLoss = (avgLoss * 13 + Math.abs(diff)) / 14; }
  }
  if (avgLoss === 0) return 100;
  return 100 - (100 / (1 + (avgGain / avgLoss)));
}

function calculateBollingerBands(prices, period = 20, stdDevMultiplier = 2) {
  const slice = prices.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const squaredDiffs = slice.map(p => Math.pow(p - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
  const stdDev = Math.sqrt(variance);
  return {
    upper: mean + (stdDev * stdDevMultiplier),
    middle: mean,
    lower: mean - (stdDev * stdDevMultiplier)
  };
}

function calculateATR(highs, lows, closes, period = 14) {
  // Simple ATR approximation for speed
  let trSum = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const hl = highs[i] - lows[i];
    const hc = Math.abs(highs[i] - closes[i-1]);
    const lc = Math.abs(lows[i] - closes[i-1]);
    trSum += Math.max(hl, hc, lc);
  }
  return trSum / period;
}