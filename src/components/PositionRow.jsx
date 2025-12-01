import React, { useState, useEffect, useRef } from 'react';

export default function PositionRow({ position, index, onClose }) {
  const [currentPrice, setCurrentPrice] = useState(position.entryPrice || 0);
  const [pnl, setPnl] = useState(0);
  const [pnlPercent, setPnlPercent] = useState(0);
  
  // Use Ref to prevent double-firing close
  const hasClosedRef = useRef(false);

  useEffect(() => {
    if (!position || !position.symbol) return;

    const wsSymbol = position.symbol.toLowerCase();
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@miniTicker`);

    ws.onmessage = (event) => {
      if (hasClosedRef.current) return;

      const data = JSON.parse(event.data);
      const price = parseFloat(data.c);
      
      if (!price || isNaN(price)) return;

      setCurrentPrice(price);

      // Calculate PnL
      let rawPnl = 0;
      if (position.side === 'long') {
        rawPnl = ((price - position.entryPrice) / position.entryPrice) * position.size;
      } else {
        rawPnl = ((position.entryPrice - price) / position.entryPrice) * position.size;
      }

      setPnl(rawPnl);
      
      if (position.margin > 0) {
        setPnlPercent((rawPnl / position.margin) * 100);
      }

      // Auto-Close Logic
      const STOP_LOSS_PCT = -3; 
      const TAKE_PROFIT_PCT = 12;
      const currentPercent = (rawPnl / position.margin) * 100;

      if (currentPercent <= STOP_LOSS_PCT) {
        hasClosedRef.current = true;
        ws.close();
        onClose(index, rawPnl, position.margin, '🛑 Stop Loss');
      } else if (currentPercent >= TAKE_PROFIT_PCT) {
        hasClosedRef.current = true;
        ws.close();
        onClose(index, rawPnl, position.margin, '✅ Take Profit');
      }
    };

    return () => {
      if (ws.readyState === 1) ws.close();
    };
  }, [position, index, onClose]);

  const isProfit = pnl >= 0;
  const colorClass = isProfit ? 'text-green-500' : 'text-red-500';

  // NOTICE: The root element here is <tr>, NOT <div>. This fixes the error.
  return (
    <tr className="border-b border-gray-700/50 hover:bg-white/5 transition">
      <td className="py-4 px-4 font-bold flex items-center gap-3 text-white">
        <div className={`p-2 rounded-lg bg-gray-800 ${position.side === 'long' ? 'text-green-500' : 'text-red-500'}`}>
          {position.side === 'long' ? '↑' : '↓'}
        </div>
        <div>
          <div className="text-sm">{position.symbol}</div>
          <div className="text-xs text-yellow-500 font-mono">x{position.leverage}</div>
        </div>
      </td>
      <td className="py-4 px-4 text-gray-300 font-mono text-sm">${position.size?.toLocaleString()}</td>
      <td className="py-4 px-4 text-gray-400 font-mono text-sm">${position.entryPrice?.toLocaleString()}</td>
      <td className="py-4 px-4 text-white font-mono text-sm font-bold">${currentPrice?.toLocaleString()}</td>
      <td className="py-4 px-4 text-red-400/80 font-mono text-sm">${position.liquidationPrice?.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
      <td className={`py-4 px-4 text-right font-mono font-bold ${colorClass}`}>
        <div className="text-base">{isProfit ? '+' : ''}{pnl.toFixed(2)}</div>
        <div className="text-xs opacity-80">{isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%</div>
      </td>
      <td className="py-4 px-4 text-right">
        <button 
          onClick={() => {
            hasClosedRef.current = true; 
            onClose(index, pnl, position.margin, 'Manual Close');
          }}
          className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded border border-gray-600 transition"
        >
          Close
        </button>
      </td>
    </tr>
  );
}