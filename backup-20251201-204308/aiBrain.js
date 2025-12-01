// Advanced AI Algorithm: Multi-Indicator Strategy with 3 Risk Levels
// Indicators: RSI, Bollinger Bands, MACD, EMA Crossover

export const RISK_LEVELS = {
  CONSERVATIVE: {
    id: 1,
    name: 'Conservative',
    stopLoss: 0.01,    // 1% loss
    takeProfit: 0.05,  // 5% profit
    minStrength: 75,   // Only strong signals
    color: '#0ecb81',
    description: 'Low risk, high confidence trades'
  },
  MODERATE: {
    id: 2,
    name: 'Moderate',
    stopLoss: 0.02,    // 2% loss
    takeProfit: 0.08,  // 8% profit
    minStrength: 60,   // Medium signals
    color: '#fcd535',
    description: 'Balanced risk-reward ratio'
  },
  AGGRESSIVE: {
    id: 3,
    name: 'Aggressive',
    stopLoss: 0.03,    // 3% loss
    takeProfit: 0.12,  // 12% profit
    minStrength: 45,   // Accept weaker signals
    color: '#f6465d',
    description: 'High risk, maximum profit potential'
  }
};

export function analyzeMarket(closes, symbol, riskLevel = RISK_LEVELS.CONSERVATIVE) {
  if (!closes || closes.length < 50) return null;

  try {
    // Calculate all technical indicators
    const rsi = calculateRSI(closes, 14);
    const bb = calculateBollingerBands(closes, 20, 2);
    const macd = calculateMACD(closes);
    const ema9 = calculateEMA(closes, 9);
    const ema21 = calculateEMA(closes, 21);
    
    const lastPrice = closes[closes.length - 1];
    const prevPrice = closes[closes.length - 2];
    
    // Calculate signal strength (0-100)
    let buySignals = 0;
    let sellSignals = 0;
    let reasons = [];

    // === INDICATOR ANALYSIS ===
    
    // 1. RSI Analysis (30 points)
    if (rsi < 30) {
      buySignals += 30;
      reasons.push(`RSI Oversold (${rsi.toFixed(1)})`);
    } else if (rsi > 70) {
      sellSignals += 30;
      reasons.push(`RSI Overbought (${rsi.toFixed(1)})`);
    } else if (rsi < 40) {
      buySignals += 15;
      reasons.push(`RSI Low (${rsi.toFixed(1)})`);
    } else if (rsi > 60) {
      sellSignals += 15;
      reasons.push(`RSI High (${rsi.toFixed(1)})`);
    }

    // 2. Bollinger Bands (25 points)
    const lowerBandDist = ((lastPrice - bb.lower) / bb.lower) * 100;
    const upperBandDist = ((bb.upper - lastPrice) / bb.upper) * 100;
    
    if (lowerBandDist < 0.5) { // Price at lower band
      buySignals += 25;
      reasons.push(`Price at Lower BB ($${bb.lower.toFixed(2)})`);
    } else if (upperBandDist < 0.5) { // Price at upper band
      sellSignals += 25;
      reasons.push(`Price at Upper BB ($${bb.upper.toFixed(2)})`);
    } else if (lowerBandDist < 1.5) {
      buySignals += 12;
      reasons.push('Price near Lower BB');
    } else if (upperBandDist < 1.5) {
      sellSignals += 12;
      reasons.push('Price near Upper BB');
    }

    // 3. MACD (20 points)
    if (macd.histogram > 0 && macd.histogram > macd.prevHistogram) {
      buySignals += 20;
      reasons.push('MACD Bullish Momentum');
    } else if (macd.histogram < 0 && macd.histogram < macd.prevHistogram) {
      sellSignals += 20;
      reasons.push('MACD Bearish Momentum');
    } else if (macd.histogram > 0) {
      buySignals += 10;
    } else if (macd.histogram < 0) {
      sellSignals += 10;
    }

    // 4. EMA Crossover (15 points)
    const ema9Value = ema9[ema9.length - 1];
    const ema21Value = ema21[ema21.length - 1];
    const prevEma9 = ema9[ema9.length - 2];
    const prevEma21 = ema21[ema21.length - 2];
    
    if (ema9Value > ema21Value && prevEma9 <= prevEma21) {
      buySignals += 15;
      reasons.push('Golden Cross (EMA 9/21)');
    } else if (ema9Value < ema21Value && prevEma9 >= prevEma21) {
      sellSignals += 15;
      reasons.push('Death Cross (EMA 9/21)');
    } else if (ema9Value > ema21Value) {
      buySignals += 7;
    } else if (ema9Value < ema21Value) {
      sellSignals += 7;
    }

    // 5. Price Momentum (10 points)
    const momentum = ((lastPrice - prevPrice) / prevPrice) * 100;
    if (momentum > 0.5) {
      buySignals += 10;
      reasons.push('Strong Upward Momentum');
    } else if (momentum < -0.5) {
      sellSignals += 10;
      reasons.push('Strong Downward Momentum');
    } else if (momentum > 0.2) {
      buySignals += 5;
    } else if (momentum < -0.2) {
      sellSignals += 5;
    }

    // === DETERMINE SIGNAL ===
    
    const isBuy = buySignals > sellSignals;
    const signalStrength = Math.min(100, isBuy ? buySignals : sellSignals);

    // Filter by risk level
    if (signalStrength < riskLevel.minStrength) {
      return null; // Signal too weak for this risk level
    }

    // Only return signal if we have at least 2 confirming indicators
    if (reasons.length < 2) {
      return null;
    }

    // Generate signal
    if (isBuy) {
      return {
        id: Date.now(),
        type: 'BUY',
        side: 'long',
        symbol: symbol,
        strength: signalStrength,
        riskLevel: riskLevel.name,
        entry: lastPrice,
        stopLoss: lastPrice * (1 - riskLevel.stopLoss),
        takeProfit: lastPrice * (1 + riskLevel.takeProfit),
        reasons: reasons,
        timestamp: new Date().toISOString(),
        color: riskLevel.color
      };
    } else {
      return {
        id: Date.now(),
        type: 'SELL',
        side: 'short',
        symbol: symbol,
        strength: signalStrength,
        riskLevel: riskLevel.name,
        entry: lastPrice,
        stopLoss: lastPrice * (1 + riskLevel.stopLoss),
        takeProfit: lastPrice * (1 - riskLevel.takeProfit),
        reasons: reasons,
        timestamp: new Date().toISOString(),
        color: riskLevel.color
      };
    }
  } catch (error) {
    console.error('Error in analyzeMarket:', error);
    return null;
  }
}

// === TECHNICAL INDICATOR FUNCTIONS ===

function calculateRSI(prices, period = 14) {
  if (!prices || prices.length < period + 1) return 50;
  
  try {
    let gains = 0, losses = 0;
    for (let i = 1; i <= period; i++) {
      const diff = prices[i] - prices[i - 1];
      diff >= 0 ? gains += diff : losses += Math.abs(diff);
    }
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    for (let i = period + 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff >= 0) {
        avgGain = (avgGain * 13 + diff) / 14;
        avgLoss = (avgLoss * 13) / 14;
      } else {
        avgGain = (avgGain * 13) / 14;
        avgLoss = (avgLoss * 13 + Math.abs(diff)) / 14;
      }
    }
    
    if (avgLoss === 0) return 100;
    return 100 - (100 / (1 + (avgGain / avgLoss)));
  } catch (error) {
    console.error('RSI calculation error:', error);
    return 50;
  }
}

function calculateBollingerBands(prices, period = 20, stdDevMultiplier = 2) {
  if (!prices || prices.length < period) {
    return { upper: 0, middle: 0, lower: 0 };
  }
  
  try {
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
  } catch (error) {
    console.error('Bollinger Bands calculation error:', error);
    return { upper: 0, middle: 0, lower: 0 };
  }
}

function calculateMACD(prices, fast = 12, slow = 26, signal = 9) {
  if (!prices || prices.length < slow) {
    return { macd: 0, signal: 0, histogram: 0, prevHistogram: 0 };
  }
  
  try {
    const emaFast = calculateEMA(prices, fast);
    const emaSlow = calculateEMA(prices, slow);
    
    const macdLine = emaFast.map((val, i) => val - emaSlow[i]);
    const signalLine = calculateEMA(macdLine, signal);
    
    const histogram = macdLine[macdLine.length - 1] - signalLine[signalLine.length - 1];
    const prevHistogram = macdLine[macdLine.length - 2] - signalLine[signalLine.length - 2];
    
    return {
      macd: macdLine[macdLine.length - 1],
      signal: signalLine[signalLine.length - 1],
      histogram: histogram,
      prevHistogram: prevHistogram
    };
  } catch (error) {
    console.error('MACD calculation error:', error);
    return { macd: 0, signal: 0, histogram: 0, prevHistogram: 0 };
  }
}

function calculateEMA(prices, period) {
  if (!prices || prices.length === 0) return [0];
  
  try {
    const k = 2 / (period + 1);
    const emaArray = [prices[0]];
    
    for (let i = 1; i < prices.length; i++) {
      const ema = prices[i] * k + emaArray[i - 1] * (1 - k);
      emaArray.push(ema);
    }
    
    return emaArray;
  } catch (error) {
    console.error('EMA calculation error:', error);
    return [0];
  }
}