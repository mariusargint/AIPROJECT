import React from 'react';
import { Wallet, Activity, BookOpen, LayoutDashboard } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'ai-signals', label: 'AI Signals', icon: <Activity size={20} /> },
    { id: 'wallet', label: 'Wallet', icon: <Wallet size={20} /> },
    { id: 'academy', label: 'Academy', icon: <BookOpen size={20} /> },
  ];

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 h-screen flex flex-col p-4 fixed left-0 top-0 z-50">
      {/* Logo Area */}
      <div className="flex items-center gap-2 mb-10 px-2 pt-2">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
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
                ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/50'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Status at Bottom */}
      <div className="mt-auto pt-6 border-t border-gray-800">
        <div className="flex items-center gap-3 px-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <p className="text-xs text-gray-500">System Operational</p>
        </div>
      </div>
    </div>
  );
}