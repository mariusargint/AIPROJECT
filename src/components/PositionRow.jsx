import React, { useState, useEffect, useRef } from 'react';

export default function PositionRow({ position, index, onClose }) {
  const [currentPrice, setCurrentPrice] = useState(position.entryPrice);
  const [pnl, setPnl] = useState(0);
  const [pnlPercent, setPnlPercent] = useState(0);
  
  // We use a ref to prevent the bot from closing the same trade twice
  const hasClosedRef = useRef(false);

  useEffect(() => {
    // 1. Connect to WebSocket
    const wsSymbol = position.symbol.toLowerCase();
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@miniTicker`);

    ws.onmessage = (event) => {
      // Safety check: If we already closed this trade, ignore new data
      if (hasClosedRef.current) return;

      const data = JSON.parse(event.data);
      const price = parseFloat(data.c);
      setCurrentPrice(price);

      // 2. Calculate PnL
      let rawPnl = 0;
      let priceChangePercent = 0;

      if (position.side === 'long') {
        // Long Formula: (Current - Entry) / Entry * Size
        rawPnl = ((price - position.entryPrice) / position.entryPrice) * position.size;
        priceChangePercent = (price - position.entryPrice) / position.entryPrice;
      } else {
        // Short Formula: (Entry - Current) / Entry * Size
        rawPnl = ((position.entryPrice - price) / position.entryPrice) * position.size;
        priceChangePercent = (position.entryPrice - price) / position.entryPrice;
      }

      setPnl(rawPnl);
      setPnlPercent((rawPnl / position.margin) * 100);

      // 3. 🤖 AUTO-TRADING BOT (Stop Loss / Take Profit)
      // Settings: Stop Loss at -1% | Take Profit at +5%
      const STOP_LOSS_PCT = -0.01; 
      const TAKE_PROFIT_PCT = 0.05;

      if (priceChangePercent <= STOP_LOSS_PCT) {
        hasClosedRef.current = true; // Mark as closed so we don't trigger twice
        ws.close();
        onClose(index, rawPnl, position.margin, '🛑 Stop Loss Hit');
      } 
      else if (priceChangePercent >= TAKE_PROFIT_PCT) {
        hasClosedRef.current = true;
        ws.close();
        onClose(index, rawPnl, position.margin, '✅ Take Profit Hit');
      }
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, [position, index, onClose]);

  // Color Helper
  const isProfit = pnl >= 0;
  const colorClass = isProfit ? 'text-brand-green' : 'text-brand-red';
  const bgClass = isProfit ? 'bg-brand-green/10' : 'bg-brand-red/10';

  return (
    <tr className="border-b border-gray-800/50 hover:bg-white/5 transition group">
      {/* Symbol */}
      <td className="py-4 px-4 font-bold flex items-center gap-3 text-white">
        <div className={`p-2 rounded-lg ${bgClass} ${colorClass}`}>
          {position.side === 'long' ? '↑' : '↓'}
        </div>
        <div>
          <div className="text-sm">{position.symbol}</div>
          <div className="text-xs text-brand-yellow font-mono">x{position.leverage}</div>
        </div>
      </td>

      {/* Size */}
      <td className="py-4 px-4 text-gray-300 font-mono text-sm">
        ${position.size.toLocaleString()}
      </td>

      {/* Entry */}
      <td className="py-4 px-4 text-gray-400 font-mono text-sm">
        ${position.entryPrice.toLocaleString()}
      </td>

      {/* Mark Price */}
      <td className="py-4 px-4 text-white font-mono text-sm font-bold">
        ${currentPrice.toLocaleString()}
      </td>

      {/* Liq. Price */}
      <td className="py-4 px-4 text-brand-red/80 font-mono text-sm">
        ${position.liquidationPrice.toLocaleString(undefined, {maximumFractionDigits: 2})}
      </td>

      {/* PnL */}
      <td className={`py-4 px-4 text-right font-mono font-bold ${colorClass}`}>
        <div className="text-base">{isProfit ? '+' : ''}{pnl.toFixed(2)}</div>
        <div className="text-xs opacity-80">{isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%</div>
      </td>

      {/* Close Button */}
      <td className="py-4 px-4 text-right">
        <button 
          onClick={() => {
            hasClosedRef.current = true; // Mark as closed
            onClose(index, pnl, position.margin, 'Manual Close');
          }}
          className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded border border-gray-600 transition hover:border-brand-yellow"
        >
          Close
        </button>
      </td>
    </tr>
  );
}