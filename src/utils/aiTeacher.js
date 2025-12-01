// This simulates a Generative AI by assembling dynamic market analysis
// based on real technical indicators.

export function generateAnalysis(symbol, rsi, price) {
  const asset = symbol.replace('USDT', '');
  
  // 1. Define the "Vibe" of the market
  let sentiment = 'NEUTRAL';
  if (rsi < 35) sentiment = 'OVERSOLD';
  if (rsi > 65) sentiment = 'OVERBOUGHT';

  // 2. Select the "Teacher's Voice"
  const intros = [
    `Analyzing ${asset}'s current structure...`,
    `Looking at the latest price action on ${asset}...`,
    `My AI models have detected a pattern on ${asset}...`,
  ];

  // 3. Generate the Explanation
  if (sentiment === 'OVERSOLD') {
    return {
      title: "💎 Potential Buy Opportunity",
      text: `${getRandom(intros)} The RSI has dropped to ${rsi.toFixed(0)}, which is extremely low. This suggests traders have panic-sold. Historically, when ${asset} hits this level, a bounce back to the mean is highly probable.`,
      action: "Consider a LONG position with tight stops."
    };
  } 
  
  else if (sentiment === 'OVERBOUGHT') {
    return {
      title: "⚠️ Overheated Market Warning",
      text: `${getRandom(intros)} The price is stretching too far, pushing RSI to ${rsi.toFixed(0)}. This is unsustainable momentum. The buying pressure is likely exhausted, and we expect a pullback soon.`,
      action: "Look for SHORT entries or take profits."
    };
  } 
  
  else {
    return {
      title: "👀 Market is in Equilibrium",
      text: `${asset} is currently trading sideways at $${price.toLocaleString()}. The RSI is neutral (${rsi.toFixed(0)}), meaning neither bulls nor bears are in control. Volatility is low.`,
      action: "Wait for a breakout above resistance."
    };
  }
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}