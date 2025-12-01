/**
 * ═══════════════════════════════════════════════════════════════════════
 * TRADING SYSTEM CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════
 * Central configuration file for all trading parameters
 * Edit this file to customize system behavior
 * ═══════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════
// ENVIRONMENT
// ═══════════════════════════════════════════════════════════════════════

export const ENV = {
  MODE: import.meta.env.MODE || 'development', // 'development' | 'production'
  USE_WEBWORKER: true, // Set false to disable WebWorker
  LOG_LEVEL: 'info', // 'debug' | 'info' | 'warn' | 'error'
  API_ENDPOINT: import.meta.env.VITE_API_ENDPOINT || 'https://api.binance.com'
};

// ═══════════════════════════════════════════════════════════════════════
// TRADING PARAMETERS
// ═══════════════════════════════════════════════════════════════════════

export const TRADING_CONFIG = {
  // Scan settings
  SCAN_INTERVAL: 30000, // 30 seconds
  MIN_CANDLES_REQUIRED: 50,
  
  // Signal settings
  SIGNAL_VALIDITY_DURATION: 300000, // 5 minutes
  MAX_ACTIVE_SIGNALS: 10,
  
  // Position settings
  MAX_OPEN_POSITIONS: 5,
  DEFAULT_LEVERAGE: 10,
  
  // Risk management
  MAX_DAILY_LOSS: -40, // USD
  MAX_POSITION_SIZE: 10000, // USD
  
  // Assets to scan
  ASSETS: [
    'BTCUSDT',
    'ETHUSDT',
    'SOLUSDT',
    'DOGEUSDT',
    'XRPUSDT',
    'BNBUSDT'
  ]
};

// ═══════════════════════════════════════════════════════════════════════
// RISK LEVELS
// ═══════════════════════════════════════════════════════════════════════

export const RISK_LEVELS = {
  CONSERVATIVE: {
    id: 'conservative',
    name: 'Conservative',
    description: 'Lower frequency, highest quality setups',
    color: '#4ade80',
    
    // Stop Loss / Take Profit
    stopLoss: -0.01, // -1%
    takeProfit: 0.015, // +1.5% (1.5R)
    
    // Signal filters
    minStrength: 75, // Minimum 75% signal strength
    volumeMultiplier: 2.5, // Volume must be 2.5x average
    requireWick: true, // Must have wick confirmation
    
    // Risk per trade
    fixedRisk: 10, // $10 per trade
    maxDailyLoss: -40 // Stop at -$40 daily loss
  },
  
  MODERATE: {
    id: 'moderate',
    name: 'Moderate',
    description: 'Balanced approach with good setups',
    color: '#fbbf24',
    
    stopLoss: -0.02, // -2%
    takeProfit: 0.03, // +3% (1.5R)
    
    minStrength: 60,
    volumeMultiplier: 2.0,
    requireWick: false, // Wick preferred but not required
    
    fixedRisk: 10,
    maxDailyLoss: -40
  },
  
  AGGRESSIVE: {
    id: 'aggressive',
    name: 'Aggressive',
    description: 'Higher frequency, more trades',
    color: '#ef4444',
    
    stopLoss: -0.03, // -3%
    takeProfit: 0.045, // +4.5% (1.5R)
    
    minStrength: 45,
    volumeMultiplier: 1.5,
    requireWick: false,
    
    fixedRisk: 10,
    maxDailyLoss: -40
  }
};

// ═══════════════════════════════════════════════════════════════════════
// STRATEGY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════

export const STRATEGY_CONFIG = {
  // Volume/Wick Strategy
  VOLUME_WICK: {
    enabled: true,
    weight: 1.0, // Weight for multi-strategy combination
    
    volumeMultiplier: 2.5,
    wickThreshold: 0.5,
    closePositionThreshold: 0.6, // Upper/lower 40%
    
    indicators: {
      rsi: { enabled: true, oversold: 30, overbought: 70 },
      bollingerBands: { enabled: true, period: 20, stdDev: 2 },
      macd: { enabled: true, fast: 12, slow: 26, signal: 9 }
    }
  },
  
  // Momentum Strategy
  MOMENTUM: {
    enabled: false, // Disabled by default
    weight: 0.8,
    
    emaPeriods: [9, 21],
    momentumPeriod: 5,
    
    indicators: {
      rsi: { enabled: true },
      macd: { enabled: true }
    }
  },
  
  // Mean Reversion Strategy
  MEAN_REVERSION: {
    enabled: false, // Disabled by default
    weight: 0.8,
    
    indicators: {
      bollingerBands: { enabled: true, period: 20 },
      rsi: { enabled: true }
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════
// COMBINATION MODES
// ═══════════════════════════════════════════════════════════════════════

export const COMBINATION_MODES = {
  BEST: 'best', // Return highest strength signal
  ALL: 'all', // Return all signals
  CONSENSUS: 'consensus', // Require 2+ strategies to agree
  WEIGHTED: 'weighted' // Combine signals with weighted average
};

export const DEFAULT_COMBINATION_MODE = COMBINATION_MODES.BEST;
export const CONSENSUS_THRESHOLD = 2; // Min strategies for consensus

// ═══════════════════════════════════════════════════════════════════════
// INDICATOR PARAMETERS
// ═══════════════════════════════════════════════════════════════════════

export const INDICATOR_CONFIG = {
  RSI: {
    period: 14,
    oversold: 30,
    overbought: 70
  },
  
  BOLLINGER_BANDS: {
    period: 20,
    stdDev: 2,
    nearBandThreshold: 0.1 // Within 10% of band
  },
  
  MACD: {
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9
  },
  
  EMA: {
    shortPeriod: 9,
    longPeriod: 21
  },
  
  VOLUME: {
    lookbackPeriod: 20,
    spikeMultiplier: 2.5
  }
};

// ═══════════════════════════════════════════════════════════════════════
// PERFORMANCE MONITORING
// ═══════════════════════════════════════════════════════════════════════

export const PERFORMANCE_CONFIG = {
  // Tracking
  TRACK_SIGNALS: true,
  TRACK_TRADES: true,
  TRACK_EXECUTION_TIME: true,
  
  // Limits
  MAX_HISTORY_SIZE: 1000,
  HISTORY_RETENTION_DAYS: 30,
  
  // Alerts
  ALERT_ON_DAILY_LOSS_LIMIT: true,
  ALERT_ON_MAX_POSITIONS: true
};

// ═══════════════════════════════════════════════════════════════════════
// UI CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════

export const UI_CONFIG = {
  // Chart settings
  CHART_UPDATE_INTERVAL: 1000, // 1 second
  SHOW_VOLUME: true,
  SHOW_INDICATORS: true,
  
  // Signal display
  SIGNAL_AUTO_REMOVE: true, // Auto-remove expired signals
  SHOW_SIGNAL_REASONS: true,
  SHOW_CONFIDENCE_SCORE: true,
  
  // Notifications
  ENABLE_NOTIFICATIONS: true,
  NOTIFICATION_SOUND: true,
  
  // Theme
  THEME: 'dark',
  ACCENT_COLOR: '#fbbf24'
};

// ═══════════════════════════════════════════════════════════════════════
// ADVANCED SETTINGS
// ═══════════════════════════════════════════════════════════════════════

export const ADVANCED_CONFIG = {
  // Caching
  ENABLE_CACHE: true,
  CACHE_TTL: 60000, // 1 minute
  
  // WebWorker
  WORKER_TIMEOUT: 10000, // 10 seconds
  
  // API
  API_TIMEOUT: 5000, // 5 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 60,
  
  // Debug
  DEBUG_MODE: ENV.MODE === 'development',
  LOG_API_CALLS: false,
  LOG_WORKER_MESSAGES: false
};

// ═══════════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════════

export function validateConfig() {
  const errors = [];
  
  // Check risk levels
  Object.values(RISK_LEVELS).forEach(level => {
    if (level.minStrength < 0 || level.minStrength > 100) {
      errors.push(`Invalid minStrength for ${level.name}: ${level.minStrength}`);
    }
    if (level.fixedRisk <= 0) {
      errors.push(`Invalid fixedRisk for ${level.name}: ${level.fixedRisk}`);
    }
  });
  
  // Check trading config
  if (TRADING_CONFIG.SCAN_INTERVAL < 1000) {
    errors.push('SCAN_INTERVAL too low (min 1000ms)');
  }
  if (TRADING_CONFIG.MAX_DAILY_LOSS >= 0) {
    errors.push('MAX_DAILY_LOSS should be negative');
  }
  
  if (errors.length > 0) {
    console.error('Configuration errors:', errors);
    return false;
  }
  
  return true;
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT DEFAULT CONFIG OBJECT
// ═══════════════════════════════════════════════════════════════════════

export default {
  ENV,
  TRADING_CONFIG,
  RISK_LEVELS,
  STRATEGY_CONFIG,
  COMBINATION_MODES,
  DEFAULT_COMBINATION_MODE,
  CONSENSUS_THRESHOLD,
  INDICATOR_CONFIG,
  PERFORMANCE_CONFIG,
  UI_CONFIG,
  ADVANCED_CONFIG,
  validateConfig
};
