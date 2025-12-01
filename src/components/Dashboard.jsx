import React from 'react';
import PriceChart from './PriceChart';
import PositionRow from './PositionRow';

export default function Dashboard({ positions, onClosePosition, onOpenTradeModal }) {
  const assets = [
    { symbol: 'BTCUSDT', name: 'Bitcoin' },
    { symbol: 'ETHUSDT', name: 'Ethereum' },
    { symbol: 'SOLUSDT', name: 'Solana' },
    { symbol: 'DOGEUSDT', name: 'Dogecoin' },
    { symbol: 'XRPUSDT', name: 'Ripple' },
    { symbol: 'BNBUSDT', name: 'Binance Coin' }, 
  ];

  return (
    <div className="space-y-8 pb-10">
      
      {positions.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 overflow-hidden shadow-xl">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Open Positions
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="py-2 px-4">Symbol</th>
                  <th className="py-2 px-4">Size</th>
                  <th className="py-2 px-4">Entry</th>
                  <th className="py-2 px-4">Mark Price</th>
                  <th className="py-2 px-4">Liq. Price</th>
                  <th className="py-2 px-4 text-right">PnL</th>
                  <th className="py-2 px-4 text-right">Action</th>
                </tr>
              </thead>
              
              <tbody className="font-mono text-sm text-gray-300">
                {positions.map((pos) => (
                  <PositionRow 
                    key={pos.id} 
                    index={pos.id} 
                    position={pos} 
                    onClose={onClosePosition}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <div key={asset.symbol} className="h-[350px]">
            <PriceChart 
              symbol={asset.symbol} 
              name={asset.name} 
              onChartClick={onOpenTradeModal}
            />
          </div>
        ))}
      </div>

    </div>
  );
}