import React from 'react';
import { Home, Wallet, Activity, BookOpen } from 'lucide-react'; // Icons placeholder

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'wallet', label: 'Wallet', icon: '💰' },
    { id: 'signals', label: 'AI Signals', icon: '🤖' },
    { id: 'learn', label: 'Academy', icon: '🎓' },
  ];

  return (
    <div className="w-64 bg-brand-dark border-r border-gray-800 h-screen flex flex-col p-4 fixed left-0 top-0">
      {/* Logo Area */}
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center font-bold text-black">
          AI
        </div>
        <h1 className="text-xl font-bold text-white tracking-wider">FUTURES</h1>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-brand-yellow text-black font-bold shadow-lg shadow-yellow-500/20'
                : 'text-brand-gray hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Status at Bottom */}
      <div className="mt-auto pt-6 border-t border-gray-800">
        <div className="flex items-center gap-3 px-2">
          <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></div>
          <p className="text-xs text-brand-gray">System Operational</p>
        </div>
      </div>
    </div>
  );
}