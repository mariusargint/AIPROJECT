import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AISignalsTab from './components/AISignalsTab';
import TradeModal from './components/TradeModal';
import { useWallet } from './hooks/useWallet';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  
  const { account, balance, isConnected, connectWallet, updateBalance, formatAddress } = useWallet();
  
  const [positions, setPositions] = useState(() => {
    const saved = localStorage.getItem('openPositions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('openPositions', JSON.stringify(positions));
  }, [positions]);

  const normalizeTab = (tab) => {
    if (!tab) return 'dashboard';
    const lower = tab.toLowerCase().trim();
    if (lower === 'ai signals' || lower === 'ai-signals' || lower === 'signals') {
      return 'ai-signals';
    }
    return lower;
  };
  const normalizedTab = normalizeTab(activeTab);

  const handleOpenTradeModal = (symbol, price) => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }
    if (!price || price === 0) {
      alert("⌛ Price data loading... Please wait.");
      return;
    }
    setSelectedAsset(symbol);
    setCurrentPrice(price);
    setIsModalOpen(true);
  };

  const handleExecuteTrade = (tradeDetails) => {
    const currentBal = parseFloat(balance);
    if (isNaN(currentBal) || currentBal < tradeDetails.margin) {
      alert("❌ Insufficient Funds or Invalid Balance!");
      return;
    }
    
    updateBalance(currentBal - tradeDetails.margin);
    
    const newPosition = { 
      ...tradeDetails, 
      id: Date.now(), 
      openTime: Date.now() 
    };
    setPositions([newPosition, ...positions]);
    
    alert(`🚀 Order Executed: ${tradeDetails.side.toUpperCase()} ${tradeDetails.symbol}`);
    setIsModalOpen(false);
  };

  const handleClosePosition = (id, finalPnL, initialMargin, reason = "Manual Close") => {
    const currentBal = parseFloat(balance);
    const safePnL = isNaN(parseFloat(finalPnL)) ? 0 : parseFloat(finalPnL);
    const payout = parseFloat(initialMargin) + safePnL;
    const newBal = currentBal + payout;

    updateBalance(newBal);
    
    const updatedPositions = positions.filter((p) => p.id !== id);
    setPositions(updatedPositions);

    const msg = safePnL >= 0 
      ? `🎉 ${reason} (+${safePnL.toFixed(2)})` 
      : `🔻 ${reason} (${safePnL.toFixed(2)})`;
    alert(msg);
  };

  const handleExecuteSignal = (signal) => {
    if (!isConnected) {
      alert("Please connect wallet!");
      return;
    }

    const tradeDetails = {
      symbol: signal.symbol,
      entryPrice: signal.entry,
      leverage: signal.leverage || 50,
      margin: signal.margin || 1000,
      size: (signal.margin || 1000) * (signal.leverage || 50),
      side: signal.type === 'BUY' ? 'long' : 'short',
      liquidationPrice: signal.type === 'BUY' 
         ? signal.entry * 0.98 
         : signal.entry * 1.02
    };

    handleExecuteTrade(tradeDetails);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex">
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 ml-64 p-8 relative">
        
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1 capitalize">
              {normalizedTab.replace('-', ' ')}
            </h1>
            <p className="text-gray-400 text-sm">
              {normalizedTab === 'dashboard' && 'Real-time Futures Data Stream'}
              {normalizedTab === 'ai-signals' && 'High-Probability Setup Scanner'}
              {normalizedTab === 'wallet' && 'Manage your assets'}
              {normalizedTab === 'academy' && 'Learn to trade like a pro'}
            </p>
          </div>

          {isConnected ? (
            <div className="flex items-center gap-4 bg-gray-800 border border-blue-500/30 p-2 rounded-lg shadow-lg">
               <div className="text-right px-2">
                 <p className="text-[10px] uppercase tracking-wider text-gray-400">Demo Equity</p>
                 <p className="text-blue-400 font-mono font-bold text-lg">
                   ${!isNaN(parseFloat(balance)) ? parseFloat(balance).toLocaleString(undefined, {minimumFractionDigits: 2}) : '11110.00'}
                 </p>
               </div>
               <div className="bg-blue-600 text-white px-4 py-2 rounded font-bold font-mono text-sm">
                 {formatAddress(account)}
               </div>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-lg transition shadow-lg flex items-center gap-2"
            >
              <span>⚡ Connect Wallet</span>
            </button>
          )}
        </header>

        <div className="animate-fade-in">
          {normalizedTab === 'dashboard' && (
            <Dashboard 
              positions={positions}
              onClosePosition={handleClosePosition}
              onOpenTradeModal={handleOpenTradeModal}
            />
          )}
          
          {normalizedTab === 'ai-signals' && (
            <AISignalsTab 
              isConnected={isConnected}
              onExecuteSignal={handleExecuteSignal}
            />
          )}
          
          {normalizedTab === 'wallet' && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-10 text-center">
              <h3 className="text-2xl font-bold text-gray-300">Wallet Portfolio</h3>
              <p className="text-gray-500 mt-2">Detailed asset breakdown coming soon...</p>
            </div>
          )}
          
          {normalizedTab === 'academy' && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-10 text-center">
              <h3 className="text-2xl font-bold text-gray-300">Trading Academy</h3>
              <p className="text-gray-500 mt-2">Educational content coming soon...</p>
            </div>
          )}
        </div>

      </main>

      <TradeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        symbol={selectedAsset}
        currentPrice={currentPrice}
        executeTrade={handleExecuteTrade}
      />

    </div>
  );
}