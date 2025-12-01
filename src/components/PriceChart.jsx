import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { analyzeMarket } from '../utils/aiBrain'; // Import our AI brain

export default function PriceChart({ symbol, name, onChartClick }) {
  const chartContainerRef = useRef();
  
  // State
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [aiSignal, setAiSignal] = useState(null); // The AI Prediction
  
  // We keep the history ref to feed the AI without causing re-renders
  const candleHistory = useRef([]); 

  useEffect(() => {
    // --- 1. SETUP CHART ---
    // We create the chart AND the series first, so they exist for everyone to use.
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#181a20' }, textColor: '#848e9c' },
      grid: { vertLines: { visible: false }, horzLines: { color: '#2b3139' } },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: { timeVisible: true, secondsVisible: false },
    });

    // CRITICAL: We define 'newSeries' here so Fetch and WebSocket can use it!
    const newSeries = chart.addCandlestickSeries({
      upColor: '#0ecb81', 
      downColor: '#f6465d', 
      borderVisible: false, 
      wickUpColor: '#0ecb81', 
      wickDownColor: '#f6465d',
    });

    // --- 2. FETCH HISTORY ---
    fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=100`)
      .then(res => res.json())
      .then(data => {
        // Format data for the chart
        const cdata = data.map(d => ({
          time: d[0] / 1000,
          open: parseFloat(d[1]), 
          high: parseFloat(d[2]), 
          low: parseFloat(d[3]), 
          close: parseFloat(d[4]),
        }));
        
        // Update the chart
        newSeries.setData(cdata);
        
        // Run AI Analysis on the history
        const closes = cdata.map(c => c.close);
        candleHistory.current = closes;
        
        const prediction = analyzeMarket(closes);
        setAiSignal(prediction);
      })
      .catch(err => console.log("Fetch Error:", err));

    // --- 3. LIVE WEBSOCKET ---
    const wsSymbol = symbol.toLowerCase();
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@kline_1m`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const k = message.k;
      
      const liveCandle = {
        time: k.t / 1000,
        open: parseFloat(k.o), 
        high: parseFloat(k.h), 
        low: parseFloat(k.l), 
        close: parseFloat(k.c),
      };
      
      // Update Chart
      newSeries.update(liveCandle);
      
      // Update UI Numbers
      setCurrentPrice(parseFloat(k.c));
      setPriceChange(parseFloat(k.c) - parseFloat(k.o));

      // Update AI Live
      // We add the new price to our history array
      const currentCloses = [...candleHistory.current, parseFloat(k.c)];
      if (currentCloses.length > 200) currentCloses.shift(); // Keep it short
      candleHistory.current = currentCloses;

      const livePrediction = analyzeMarket(currentCloses);
      setAiSignal(livePrediction);
    };

    // --- 4. CLEANUP ---
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (ws.readyState === 1) ws.close();
      chart.remove();
    };
  }, [symbol]); // Re-run this entire block if the Symbol changes

  return (
    <div 
      onClick={() => onChartClick(symbol, currentPrice)} 
      className="relative w-full h-full bg-brand-dark rounded-xl border border-gray-800 overflow-hidden hover:border-brand-yellow transition duration-300 group cursor-pointer"
    >
      {/* Price Header */}
      <div className="absolute top-3 left-4 z-10 bg-black/50 p-2 rounded backdrop-blur-md pointer-events-none">
         <div className="flex items-center gap-2">
            <h3 className="text-white font-bold text-md">{name}</h3>
            <span className={`text-sm font-mono font-bold ${priceChange >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
              ${currentPrice.toLocaleString()}
            </span>
         </div>
      </div>

      {/* 🤖 AI SIGNAL BADGE */}
      {aiSignal && aiSignal.type !== 'HOLD' && (
        <div className="absolute top-3 right-4 z-20 animate-fade-in-up">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full shadow-lg backdrop-blur-md bg-black/60 border" style={{ borderColor: aiSignal.color }}>
            <span className="animate-pulse w-2 h-2 rounded-full" style={{ backgroundColor: aiSignal.color }}></span>
            <span className="text-xs font-bold text-white">AI: {aiSignal.type}</span>
          </div>
        </div>
      )}

      <div ref={chartContainerRef} className="w-full h-[300px]" />
    </div>
  );
}