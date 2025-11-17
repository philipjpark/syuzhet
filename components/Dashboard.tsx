'use client';

import { useState } from 'react';
import { useDynamicContext } from '@/components/providers/DynamicProvider';
import Header from './Header';
import PredictionList from './PredictionList';
import CreatePrediction from './CreatePrediction';
import Portfolio from './Portfolio';
import { TrendingUp, Plus, Wallet } from 'lucide-react';

type Tab = 'market' | 'create' | 'portfolio';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('market');
  const { user } = useDynamicContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-500 to-green-600">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation - Robinhood Style */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-green-700/50 p-1 rounded-lg inline-flex border border-lime-400/20">
            <button
              onClick={() => setActiveTab('market')}
              className={`px-6 py-2.5 rounded-md font-semibold text-sm flex items-center gap-2 transition-all ${
                activeTab === 'market'
                  ? 'bg-lime-400 text-green-950 shadow-lg shadow-lime-500/50'
                  : 'text-green-200 hover:text-lime-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Market
            </button>
            <button
              onClick={() => window.location.href = '/create'}
              className="px-6 py-2.5 rounded-md font-semibold text-sm flex items-center gap-2 transition-all text-green-200 hover:text-lime-200"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-6 py-2.5 rounded-md font-semibold text-sm flex items-center gap-2 transition-all ${
                activeTab === 'portfolio'
                  ? 'bg-lime-400 text-green-950 shadow-lg shadow-lime-500/50'
                  : 'text-green-200 hover:text-lime-200'
              }`}
            >
              <Wallet className="w-4 h-4" />
              Portfolio
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'market' && <PredictionList />}
          {activeTab === 'portfolio' && <Portfolio />}
        </div>
      </main>
    </div>
  );
}

