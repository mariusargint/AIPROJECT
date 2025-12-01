import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Zap, Clock, X } from 'lucide-react';

export default function SignalRow({ signal, onExecute, onExpire, isPosition = false }) {
  const [currentPrice, setCurrentPrice] = useState(signal.entry);
  const [isValid, setIsValid] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes validity
  const [pnl, setPnl] = useState(0);
  const [pnlPercent, setPnlPercent] = useState(0);
  
  const wsRef = useRef(null);
  const hasClosedRef = useRef(false);

  useEffect(() => {
    // Connect to WebSocket for live price
    const wsSymbol = signal.symbol.toLowerCase();
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@miniTicker`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      if (hasClosedRef.current) return;
      
      const data = JSON.parse(event.data);
      const price = parseFloat(data.c);
      setCurrentPrice(price);

      // If this is an executed position, calculate PnL
      if (isPosition) {
        calculatePnL(price);
        checkAutoClose(price);
      } else {
        // If it's still a signal, validate it
        validateSignal(price);
      }
    };

    return () => {
      if (ws.readyState === 1) ws.close();
    };
  }, [signal, isPosition]);

  // Countdown timer for signal validity
  useEffect(() => {
    if (isPosition) return; // No timer for positions

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsValid(false);
          onExpire(signal.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPosition, signal.id, onExpire]);

  const validateSignal = (price) => {
    // Check if signal is still valid based on price movement
    const priceChange = ((price - signal.entry) / signal.entry) * 100;
    
    // Signal becomes invalid if price moves > 2% in opposite direction
    if (signal.side === 'long' && priceChange < -2) {
      setIsValid(false);
      onExpire(signal.id);
    } else if (signal.side === 'short' && priceChange > 2) {
      setIsValid(false);
      onExpire(signal.id);
    }
  };

  const calculatePnL = (price) => {
    let rawPnl = 0;
    
    if (signal.side === 'long') {
      rawPnl = ((price - signal.entry) / signal.entry) * signal.size;
    } else {
      rawPnl = ((signal.entry - price) / signal.entry) * signal.size;
    }
    
    setPnl(rawPnl);
    setPnlPercent((rawPnl / signal.margin) * 100);
  };

  const checkAutoClose = (price) => {
    if (hasClosedRef.current) return;
    
    const priceChangePercent = signal.side === 'long'
      ? (price - signal.entry) / signal.entry
      : (signal.entry - price) / signal.entry;

    // Auto close at stop loss or take profit
    if (priceChangePercent <= signal.stopLossPercent) {
      hasClosedRef.current = true;
      if (wsRef.current) wsRef.current.close();
      // Signal will be handled by parent component
    } else if (priceChangePercent >= signal.takeProfitPercent) {
      hasClosedRef.current = true;
      if (wsRef.current) wsRef.current.close();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isBuy = signal.type === 'BUY' || signal.side === 'long';
  const isProfit = pnl >= 0;

  // If position is executed, show position row
  if (isPosition) {
    return (
      <div className={`bg-gradient-to-r ${isBuy ? 'from-green-900/5' : 'from-red-900/5'} to-transparent border-l-4 ${isBuy ? 'border-brand-green' : 'border-brand-red'} rounded-lg p-4 hover:bg-white/5 transition`}>
        <div className="grid grid-cols-12 gap-4 items-center">
          
          {/* Symbol & Side */}
          <div className="col-span-2 flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isBuy ? 'bg-brand-green' : 'bg-brand-red'}`}>
              {isBuy ? <TrendingUp size={16} className="text-black" /> : <TrendingDown size={16} className="text-white" />}
            </div>
            <div>
              <div className="font-bold text-white text-sm">{signal.symbol}</div>
              <div className="text-xs text-gray-400">{signal.riskLevel}</div>
            </div>
          </div>

          {/* Size */}
          <div className="col-span-2">
            <div className="text-xs text-gray-400">Size</div>
            <div className="font-mono text-white text-sm">${signal.size.toLocaleString()}</div>
          </div>

          {/* Entry Price */}
          <div className="col-span-2">
            <div className="text-xs text-gray-400">Entry</div>
            <div className="font-mono text-gray-300 text-sm">${signal.entry.toLocaleString()}</div>
          </div>

          {/* Current Price */}
          <div className="col-span-2">
            <div className="text-xs text-gray-400">Current</div>
            <div className="font-mono text-white font-bold text-sm">${currentPrice.toLocaleString()}</div>
          </div>

          {/* PnL */}
          <div className="col-span-2">
            <div className="text-xs text-gray-400">PnL</div>
            <div className={`font-mono font-bold ${isProfit ? 'text-brand-green' : 'text-brand-red'}`}>
              {isProfit ? '+' : ''}{pnl.toFixed(2)}
              <span className="text-xs ml-1">({isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%)</span>
            </div>
          </div>

          {/* TP/SL Indicators */}
          <div className="col-span-2 flex items-center gap-2">
            <div className="text-xs">
              <div className="text-brand-green">TP: ${signal.takeProfit.toLocaleString()}</div>
              <div className="text-brand-red">SL: ${signal.stopLoss.toLocaleString()}</div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Signal row (not yet executed)
  if (!isValid) return null;

  return (
    <div className={`bg-gradient-to-r ${isBuy ? 'from-green-900/10' : 'from-red-900/10'} to-transparent border ${isBuy ? 'border-brand-green/30' : 'border-brand-red/30'} rounded-lg p-4 hover:border-brand-yellow/50 transition group`}>
      <div className="grid grid-cols-12 gap-4 items-center">
        
        {/* Symbol & Signal Type */}
        <div className="col-span-2 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isBuy ? 'bg-brand-green' : 'bg-brand-red'} animate-pulse`}>
            {isBuy ? <TrendingUp size={16} className="text-black" /> : <TrendingDown size={16} className="text-white" />}
          </div>
          <div>
            <div className="font-bold text-white text-sm">{signal.symbol}</div>
            <div className={`text-xs font-bold ${isBuy ? 'text-brand-green' : 'text-brand-red'}`}>
              {signal.type}
            </div>
          </div>
        </div>

        {/* Risk Level Badge */}
        <div className="col-span-1">
          <div className="px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: `${signal.color}20`, color: signal.color }}>
            {signal.riskLevel.charAt(0)}
          </div>
        </div>

        {/* Strength */}
        <div className="col-span-1">
          <div className="text-xs text-gray-400">Strength</div>
          <div className="text-white font-bold text-sm">{signal.strength}%</div>
        </div>

        {/* Entry Price */}
        <div className="col-span-2">
          <div className="text-xs text-gray-400">Entry</div>
          <div className="font-mono text-white text-sm">${signal.entry.toLocaleString()}</div>
        </div>

        {/* Current Price */}
        <div className="col-span-2">
          <div className="text-xs text-gray-400">Current</div>
          <div className="font-mono text-brand-yellow text-sm font-bold">${currentPrice.toLocaleString()}</div>
        </div>

        {/* Take Profit / Stop Loss */}
        <div className="col-span-2">
          <div className="text-xs text-brand-green">TP: ${signal.takeProfit.toLocaleString()}</div>
          <div className="text-xs text-brand-red">SL: ${signal.stopLoss.toLocaleString()}</div>
        </div>

        {/* Time Left */}
        <div className="col-span-1 flex items-center gap-1">
          <Clock size={12} className="text-gray-400" />
          <span className={`text-xs font-mono ${timeLeft < 60 ? 'text-brand-red' : 'text-gray-400'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Execute Button */}
        <div className="col-span-1">
          <button
            onClick={() => onExecute(signal)}
            className={`w-full py-2 rounded-lg font-bold text-xs transition transform hover:scale-105 ${
              isBuy 
                ? 'bg-brand-green text-black hover:bg-green-400' 
                : 'bg-brand-red text-white hover:bg-red-600'
            }`}
          >
            BUY
          </button>
        </div>
      </div>

      {/* Key Indicators (collapsed by default, can expand on hover) */}
      <div className="mt-2 pt-2 border-t border-gray-800/50 opacity-0 group-hover:opacity-100 transition">
        <div className="flex gap-4 text-xs text-gray-400">
          {signal.reasons.slice(0, 3).map((reason, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <Zap size={10} className="text-yellow-400" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}