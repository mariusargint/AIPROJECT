import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { analyzeMarket } from '../utils/aiBrain';
import { generateAnalysis } from '../utils/aiTeacher';
import { Brain } from 'lucide-react';

export default function PriceChart({ symbol, name, onChartClick }) {
  const chartContainerRef = useRef();
  const candleHistory = useRef({ closes: [], highs: [], lows: [] });
  
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [aiSignal, setAiSignal] = useState(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#1f2937' }, textColor: '#9ca3af' },
      grid: { vertLines: { visible: false }, horzLines: { color: '#374151' } },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: { timeVisible: true, secondsVisible: false },
    });

    const newSeries = chart.addCandlestickSeries({
      upColor: '#10b981', 
      downColor: '#ef4444', 
      borderVisible: false, 
      wickUpColor: '#10b981', 
      wickDownColor: '#ef4444',
    });

    fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=100`)
      .then(res => res.json())
      .then(data => {
        const cdata = data.map(d => ({
          time: d[0] / 1000,
          open: parseFloat(d[1]), 
          high: parseFloat(d[2]), 
          low: parseFloat(d[3]), 
          close: parseFloat(d[4]),
        }));
        
        newSeries.setData(cdata);
        
        const closes = cdata.map(c => c.close);
        const highs = cdata.map(c => c.high);
        const lows = cdata.map(c => c.low);
        
        candleHistory.current = { closes, highs, lows };
        setAiSignal(analyzeMarket(closes, highs, lows));
      })
      .catch(err => console.log("Fetch Error", err));

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
      
      newSeries.update(liveCandle);
      setCurrentPrice(parseFloat(k.c));
      setPriceChange(parseFloat(k.c) - parseFloat(k.o));

      const currentCloses = [...candleHistory.current.closes, parseFloat(k.c)];
      const currentHighs = [...candleHistory.current.highs, parseFloat(k.h)];
      const currentLows = [...candleHistory.current.lows, parseFloat(k.l)];
      
      if (currentCloses.length > 200) {
        currentCloses.shift();
        currentHighs.shift();
        currentLows.shift();
      }

      candleHistory.current = { closes: currentCloses, highs: currentHighs, lows: currentLows };
      setAiSignal(analyzeMarket(currentCloses, currentHighs, currentLows));
    };

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
  }, [symbol]);

  const handleAskAI = (e) => {
    e.stopPropagation();
    let estimatedRSI = 50;
    if (aiSignal?.type === 'BUY') estimatedRSI = 30;
    if (aiSignal?.type === 'SELL') estimatedRSI = 70;

    const analysis = generateAnalysis(symbol, estimatedRSI, currentPrice);
    alert(`🤖 AI TEACHER SAYS:\n\n${analysis.title}\n----------------\n${analysis.text}\n\n👉 ${analysis.action}`);
  };

  return (
    <div 
      onClick={() => onChartClick(symbol, currentPrice)} 
      className="relative w-full h-full bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-yellow-500 transition duration-300 group cursor-pointer shadow-lg"
    >
      <div className="absolute top-3 left-4 z-10 bg-black/50 p-2 rounded backdrop-blur-md pointer-events-none border border-gray-600/50">
         <div className="flex items-center gap-2">
            <h3 className="text-white font-bold text-md">{name}</h3>
            <span className={`text-sm font-mono font-bold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${currentPrice.toLocaleString()}
            </span>
         </div>
      </div>

      {aiSignal && aiSignal.type !== 'HOLD' && (
        <div className="absolute top-3 right-4 z-20 animate-fade-in-up">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full shadow-lg backdrop-blur-md bg-black/60 border" style={{ borderColor: aiSignal.color }}>
            <span className="animate-pulse w-2 h-2 rounded-full" style={{ backgroundColor: aiSignal.color }}></span>
            <span className="text-xs font-bold text-white">AI: {aiSignal.type}</span>
          </div>
        </div>
      )}

      <div className="absolute bottom-3 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={handleAskAI}
          className="flex items-center gap-2 bg-yellow-500 text-black px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-white transition shadow-lg hover:scale-105"
        >
          <Brain size={14} />
          <span>Why?</span>
        </button>
      </div>

      <div ref={chartContainerRef} className="w-full h-[300px]" />
    </div>
  );
}