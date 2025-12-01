import React, { useState, useEffect } from 'react';
import { Target, Zap, TrendingUp, RefreshCw } from 'lucide-react';

export default function AISignalsTab({ isConnected, onExecuteSignal }) {
  const [signals, setSignals] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  // Mock scan function
  const handleScan = () => {
    setIsScanning(true);
    
    setTimeout(() => {
      // Mock signal
      const mockSignal = {
        id: Date.now(),
        symbol: 'BTCUSDT',
        type: 'BUY',
        side: 'long',
        entry: 85000,
        stopLoss: 84500,
        takeProfit: 86000,
        strength: 85,
        reasons: ['Volume Spike 2.5x', 'Bullish Hammer Pattern'],
        timestamp: new Date().toISOString()
      };
      
      setSignals([mockSignal]);
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">AI Trading Signals</h2>
          <p className="text-gray-400">Live signals with auto-validation</p>
        </div>
        
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-black rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50"
        >
          <RefreshCw size={16} className={isScanning ? 'animate-spin' : ''} />
          Scan Now
        </button>
      </div>

      {/* Active Signals */}
      <div className="bg-brand-dark border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Zap size={20} className="text-brand-yellow" />
          Active Signals ({signals.length})
        </h3>

        {!isConnected ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Connect wallet to see signals</p>
          </div>
        ) : signals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw size={32} className={`text-gray-600 ${isScanning ? 'animate-spin' : ''}`} />
            </div>
            <p className="text-gray-500 mb-2">
              {isScanning ? 'Scanning for signals...' : 'No signals found'}
            </p>
            <p className="text-xs text-gray-600">Click "Scan Now" to search for trading opportunities</p>
          </div>
        ) : (
          <div className="space-y-3">
            {signals.map((signal) => (
              <div 
                key={signal.id}
                className="bg-gradient-to-r from-green-900/20 to-transparent border-l-4 border-green-500 rounded-lg p-4"
              >
                {/* Signal Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="text-green-500" size={24} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-lg">{signal.symbol}</span>
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-500/20 text-green-400">
                          {signal.type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Strength: {signal.strength}%
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onExecuteSignal && onExecuteSignal(signal)}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition"
                  >
                    Execute
                  </button>
                </div>

                {/* Signal Details */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-black/30 rounded p-2">
                    <p className="text-xs text-gray-400 mb-1">Entry</p>
                    <p className="text-sm font-mono text-white font-bold">
                      ${signal.entry.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="bg-red-900/20 rounded p-2">
                    <p className="text-xs text-gray-400 mb-1">Stop Loss</p>
                    <p className="text-sm font-mono text-red-400 font-bold">
                      ${signal.stopLoss.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="bg-green-900/20 rounded p-2">
                    <p className="text-xs text-gray-400 mb-1">Take Profit</p>
                    <p className="text-sm font-mono text-green-400 font-bold">
                      ${signal.takeProfit.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Reasons */}
                <div className="flex flex-wrap gap-2">
                  {signal.reasons && signal.reasons.map((reason, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}