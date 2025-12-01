import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PriceChart from './components/PriceChart';
import TradeModal from './components/TradeModal';
import PositionRow from './components/PositionRow';
import AISignalsTab from './components/AISignalsTab';
import { useWallet } from './hooks/useWallet';
import { RISK_LEVELS } from './utils/aiBrain';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Wallet
  const { account, balance, isConnected, connectWallet, updateBalance, formatAddress } = useWallet();
  
  // --- TRADING STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  
  // Positions (from manual trades OR signal executions)
  const [positions, setPositions] = useState(() => {
    const saved = localStorage.getItem('openPositions');
    return saved ? JSON.parse(saved) : [];
  });

  // --- AI SIGNALS STATE ---
  const [selectedRiskLevel, setSelectedRiskLevel] = useState(RISK_LEVELS.CONSERVATIVE);

  // Save positions whenever they change
  useEffect(() => {
    localStorage.setItem('openPositions', JSON.stringify(positions));
  }, [positions]);

  // Debug: Log active tab changes
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
  }, [activeTab]);

  const assets = [
    { symbol: 'BTCUSDT', name: 'Bitcoin' },
    { symbol: 'ETHUSDT', name: 'Ethereum' },
    { symbol: 'SOLUSDT', name: 'Solana' },
    { symbol: 'DOGEUSDT', name: 'Dogecoin' },
    { symbol: 'XRPUSDT', name: 'Ripple' },
    { symbol: 'BNBUSDT', name: 'Binance Coin' }, 
  ];

  // === MANUAL TRADING (from charts) ===
 
  const handleChartClick = (symbol, price) => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }
    
    if (!price || price === 0) {
      alert("⌛ Price data loading... Please wait 1 second.");
      return;
    }
    
    setSelectedAsset(symbol);
    setCurrentPrice(price);
    setIsModalOpen(true);
  };

  // === SIGNAL EXECUTION (from AI Signals tab) ===
  
  const handleExecuteFromSignal = (signalPosition) => {
    const currentBal = parseFloat(balance);
    if (currentBal < signalPosition.margin) {
      alert("❌ Insufficient Funds!");
      return;
    }
    
    const newBal = currentBal - signalPosition.margin;
    updateBalance(newBal);

    // Add position with signal's risk parameters
    setPositions([signalPosition, ...positions]);
    
    alert(`🚀 Signal Executed: ${signalPosition.side.toUpperCase()} ${signalPosition.symbol}`);
  };

  // === MANUAL TRADE EXECUTION ===
  
  const handleExecuteTrade = (tradeDetails) => {
    const currentBal = parseFloat(balance);
    if (currentBal < tradeDetails.margin) {
      alert("❌ Insufficient Funds!");
      return;
    }
    
    const newBal = currentBal - tradeDetails.margin;
    updateBalance(newBal);

    const enhancedDetails = {
      ...tradeDetails,
      timestamp: Date.now(),
      id: Date.now()
    };
    
    setPositions([enhancedDetails, ...positions]);
    
    alert(`🚀 Order Executed: ${tradeDetails.side.toUpperCase()} ${tradeDetails.symbol}`);
  };

  // === POSITION CLOSING ===
  
  const handleClosePosition = (index, finalPnL, initialMargin) => {
    const currentBal = parseFloat(balance);
    const payout = parseFloat(initialMargin) + parseFloat(finalPnL);
    const newBal = currentBal + payout;

    updateBalance(newBal);

    const updatedPositions = positions.filter((_, i) => i !== index);
    setPositions(updatedPositions);

    alert(`💰 Position Closed!\n${finalPnL >= 0 ? 'Profit' : 'Loss'}: $${finalPnL.toFixed(2)}\nWallet Updated: $${newBal.toLocaleString()}`);
  };

  // Normalize tab names (handle different cases)
  const normalizedTab = activeTab.toLowerCase().replace(/\s+/g, '-');
  
  // Determine which content to show
  const showDashboard = normalizedTab === 'dashboard';
  const showSignals = normalizedTab === 'ai-signals' || normalizedTab === 'signals';
  const showWallet = normalizedTab === 'wallet';
  const showAcademy = normalizedTab === 'academy' || normalizedTab === 'learn';

  // === RENDER ===

  return (
    <div className="min-h-screen bg-brand-black text-white font-sans flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 ml-64 p-8 relative">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold capitalize text-white">
              {showDashboard ? 'Market Command' : showSignals ? 'AI Signals' : activeTab}
            </h2>
            <p className="text-brand-gray text-sm">
              {showDashboard 
                ? 'Real-time Futures Data Stream' 
                : showSignals 
                  ? `${selectedRiskLevel.name} Risk Profile`
                  : 'Advanced Trading Platform'}
            </p>
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

        {/* Debug Info */}
        <div className="mb-4 p-2 bg-blue-900/20 border border-blue-500/30 rounded text-xs text-blue-300">
          Debug: activeTab = "{activeTab}" | normalized = "{normalizedTab}" | showSignals = {showSignals.toString()}
        </div>

        {/* Content Area */}
        <div className="animate-fade-in pb-10 space-y-8">
          
          {/* Dashboard Tab */}
          {showDashboard && (
            <>
              {/* Active Positions Table */}
              {positions.length > 0 && (
                <div className="bg-brand-dark border border-gray-800 rounded-xl p-6 overflow-hidden">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
                    Open Positions ({positions.length})
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
            </>
          )}

          {/* AI Signals Tab */}
          {showSignals && (
            <AISignalsTab 
              onExecuteSignal={handleExecuteFromSignal}
              selectedRiskLevel={selectedRiskLevel}
              onRiskLevelChange={setSelectedRiskLevel}
              isConnected={isConnected}
            />
          )}

          {/* Wallet Tab */}
          {showWallet && (
            <div className="bg-brand-dark border border-gray-800 rounded-xl p-12 text-center">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Wallet Management</h3>
              <p className="text-gray-500">Coming Soon</p>
            </div>
          )}

          {/* Academy Tab */}
          {showAcademy && (
            <div className="bg-brand-dark border border-gray-800 rounded-xl p-12 text-center">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎓</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Trading Academy</h3>
              <p className="text-gray-500">Coming Soon</p>
            </div>
          )}

        </div>

        {/* Trade Modal */}
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