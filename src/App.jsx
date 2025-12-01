import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PriceChart from './components/PriceChart';
import TradeModal from './components/TradeModal';
import PositionRow from './components/PositionRow';
import { useWallet } from './hooks/useWallet';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Get the new updateBalance function
  const { account, balance, isConnected, connectWallet, updateBalance, formatAddress } = useWallet();
  
  // --- TRADING STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  
  // Initialize positions from LocalStorage (Memory)
  const [positions, setPositions] = useState(() => {
    const saved = localStorage.getItem('openPositions');
    return saved ? JSON.parse(saved) : [];
  });

  // Save positions whenever they change
  useEffect(() => {
    localStorage.setItem('openPositions', JSON.stringify(positions));
  }, [positions]);

  const assets = [
    { symbol: 'BTCUSDT', name: 'Bitcoin' },
    { symbol: 'ETHUSDT', name: 'Ethereum' },
    { symbol: 'SOLUSDT', name: 'Solana' },
    { symbol: 'DOGEUSDT', name: 'Dogecoin' },
    { symbol: 'XRPUSDT', name: 'Ripple' },
    { symbol: 'BNBUSDT', name: 'Binance Coin' }, 
  ];

 // 1. Open Modal
  const handleChartClick = (symbol, price) => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }
    
    // 🛡️ SECURITY CHECK: Prevent $0 trades
    if (!price || price === 0) {
      alert("⌛ Price data loading... Please wait 1 second.");
      return;
    }
    
    setSelectedAsset(symbol);
    setCurrentPrice(price);
    setIsModalOpen(true);
  };

  // 2. Execute Trade (Deduct Money)
  const handleExecuteTrade = (tradeDetails) => {
    // A. Deduct Margin from Wallet
    const currentBal = parseFloat(balance);
    if (currentBal < tradeDetails.margin) {
      alert("❌ Insufficient Funds!");
      return;
    }
    
    const newBal = currentBal - tradeDetails.margin;
    updateBalance(newBal); // <--- SAVES TO DATABASE

    // B. Add Position
    setPositions([tradeDetails, ...positions]); // <--- SAVES TO DATABASE VIA USEEFFECT
    
    alert(`🚀 Order Executed: ${tradeDetails.side.toUpperCase()} ${tradeDetails.symbol}`);
  };

  // 3. Close Position (Refund Margin +/- PnL)
  const handleClosePosition = (index, finalPnL, initialMargin) => {
    // A. Calculate Return
    // We give back the Initial Margin + The Profit (or minus the loss)
    const currentBal = parseFloat(balance);
    const payout = parseFloat(initialMargin) + parseFloat(finalPnL);
    const newBal = currentBal + payout;

    // B. Update Wallet
    updateBalance(newBal); // <--- SAVES TO DATABASE

    // C. Remove Position
    const updatedPositions = positions.filter((_, i) => i !== index);
    setPositions(updatedPositions); // <--- SAVES TO DATABASE VIA USEEFFECT

    alert(`💰 Position Closed!\n${finalPnL >= 0 ? 'Profit' : 'Loss'}: $${finalPnL.toFixed(2)}\nWallet Updated: $${newBal.toLocaleString()}`);
  };

  return (
    <div className="min-h-screen bg-brand-black text-white font-sans flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 ml-64 p-8 relative">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold capitalize text-white">Market Command</h2>
            <p className="text-brand-gray text-sm">Real-time Futures Data Stream</p>
          </div>

          {isConnected ? (
            <div className="flex items-center gap-4 bg-brand-dark border border-brand-yellow/30 p-2 rounded-lg">
               <div className="text-right px-2">
                 <p className="text-xs text-brand-gray">Demo Equity</p>
                 <p className="text-brand-yellow font-mono font-bold text-lg">
                   ${parseFloat(balance).toLocaleString(undefined, {minimumFractionDigits: 2})}
                 </p>
               </div>
               <div className="bg-brand-yellow text-black px-4 py-2 rounded font-bold font-mono text-sm">
                 {formatAddress(account)}
               </div>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              className="bg-brand-yellow text-black font-bold px-6 py-2 rounded-lg hover:opacity-90 transition shadow-lg flex items-center gap-2"
            >
              <span>⚡ Connect Wallet</span>
            </button>
          )}
        </header>

        {/* Content Area */}
        <div className="animate-fade-in pb-10 space-y-8">
          
          {/* Active Positions Table */}
          {positions.length > 0 && (
            <div className="bg-brand-dark border border-gray-800 rounded-xl p-6 overflow-hidden">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
                Open Positions
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-gray-500 border-b border-gray-800">
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
                  
                  <tbody className="font-mono text-sm">
                    {positions.map((pos, idx) => (
                      <PositionRow 
                        key={idx} 
                        index={idx}
                        position={pos} 
                        onClose={handleClosePosition}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <div key={asset.symbol} className="h-[300px]">
                <PriceChart 
                  symbol={asset.symbol} 
                  name={asset.name} 
                  onChartClick={handleChartClick}
                />
              </div>
            ))}
          </div>

        </div>

        <TradeModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          symbol={selectedAsset}
          currentPrice={currentPrice}
          executeTrade={handleExecuteTrade}
        />

      </main>
    </div>
  );
}