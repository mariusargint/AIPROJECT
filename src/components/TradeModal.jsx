import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';

export default function TradeModal({ isOpen, onClose, symbol, currentPrice, executeTrade }) {
  const [leverage, setLeverage] = useState(10);
  const [margin, setMargin] = useState(1000);
  const [side, setSide] = useState('long'); // 'long' or 'short'

  if (!isOpen) return null;

  // Calculations
  const positionSize = margin * leverage;
  const fee = positionSize * 0.001; // 0.1% fee simulation
  const liquidationPrice = side === 'long' 
    ? currentPrice * (1 - (1 / leverage)) 
    : currentPrice * (1 + (1 / leverage));

  const handleSubmit = () => {
    const tradeDetails = {
      symbol,
      entryPrice: currentPrice,
      leverage,
      margin: parseFloat(margin),
      size: positionSize,
      side,
      pnl: 0, // Starts at 0
      liquidationPrice
    };
    executeTrade(tradeDetails);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-brand-dark w-full max-w-md rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Trade {symbol}
              <span className="text-xs bg-gray-800 px-2 py-1 rounded text-brand-gray">Perpetual</span>
            </h2>
            <p className="text-brand-yellow font-mono mt-1">${currentPrice.toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition">
            <X className="text-gray-400" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* 1. Long vs Short Switch */}
          <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-lg">
            <button 
              onClick={() => setSide('long')}
              className={`py-2 rounded-md font-bold flex items-center justify-center gap-2 transition ${
                side === 'long' ? 'bg-brand-green text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              <TrendingUp size={16} /> Long
            </button>
            <button 
              onClick={() => setSide('short')}
              className={`py-2 rounded-md font-bold flex items-center justify-center gap-2 transition ${
                side === 'short' ? 'bg-brand-red text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <TrendingDown size={16} /> Short
            </button>
          </div>

          {/* 2. Leverage Slider */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Leverage</span>
              <span className="text-brand-yellow font-bold">{leverage}x</span>
            </div>
            <input 
              type="range" min="1" max="50" step="1" 
              value={leverage}
              onChange={(e) => setLeverage(e.target.value)}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-yellow"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>1x</span>
              <span>25x</span>
              <span>50x</span>
            </div>
          </div>

          {/* 3. Margin Input */}
          <div>
             <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Margin (USDT)</span>
              <span className="text-gray-400">Avail: $50,000</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input 
                type="number" 
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-lg py-3 pl-8 pr-4 text-white focus:border-brand-yellow focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* 4. Order Summary Card */}
          <div className="bg-black/40 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Position Size</span>
              <span className="text-white font-mono">${positionSize.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Est. Liquidation</span>
              <span className="text-brand-red font-mono">${liquidationPrice.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Fees (0.1%)</span>
              <span className="text-gray-400 font-mono">${fee.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleSubmit}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition transform hover:scale-[1.02] ${
              side === 'long' ? 'bg-brand-green text-black shadow-green-900/20' : 'bg-brand-red text-white shadow-red-900/20'
            }`}
          >
            {side === 'long' ? 'BUY / LONG' : 'SELL / SHORT'} {symbol}
          </button>

        </div>
      </div>
    </div>
  );
}