import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('50000.00'); // Default start
  const [isConnected, setIsConnected] = useState(false);

  // 1. Load Data on Startup
  useEffect(() => {
    // Check for saved balance
    const savedBalance = localStorage.getItem('demoBalance');
    if (savedBalance) {
      setBalance(savedBalance);
    } else {
      localStorage.setItem('demoBalance', '50000.00');
    }

    // Check for saved wallet connection
    const savedAccount = localStorage.getItem('walletAccount');
    if (savedAccount) {
      setAccount(savedAccount);
      setIsConnected(true);
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        localStorage.setItem('walletAccount', accounts[0]);
      }
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  // 2. THIS IS THE FUNCTION YOU WERE MISSING 👇
  const updateBalance = (newAmount) => {
    // Ensure we handle strings or numbers safely
    const amountFloat = parseFloat(newAmount);
    const fixedAmount = amountFloat.toFixed(2);
    
    setBalance(fixedAmount);
    localStorage.setItem('demoBalance', fixedAmount);
  };

  const formatAddress = (addr) => {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  };

  // 3. EXPORT IT HERE 👇
  return { 
    account, 
    balance, 
    isConnected, 
    connectWallet, 
    updateBalance, // <--- Crucial!
    formatAddress 
  };
}