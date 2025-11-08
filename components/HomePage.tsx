'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, Sparkles, DollarSign, Shield } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [showSaylor, setShowSaylor] = useState(true);

  // Flash Michael Saylor image every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowSaylor((prev) => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-green-950">
      {/* Hero Section with Ethereal Green Energy Effect */}
      <div className="relative overflow-hidden bg-gradient-to-b from-green-950 via-green-900 to-green-950 min-h-[600px]">
        {/* Central Glowing Energy Core - Radial from bottom center */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[800px]">
            {/* White-hot core */}
            <div className="absolute inset-0 bg-gradient-radial from-lime-200 via-lime-300 to-transparent rounded-full blur-3xl opacity-80 animate-pulse"></div>
            {/* Electric lime green middle layer */}
            <div className="absolute inset-0 bg-gradient-radial from-lime-400 via-lime-500 to-transparent rounded-full blur-2xl opacity-60" style={{ transform: 'scale(1.2)' }}></div>
            {/* Emerald green outer layer */}
            <div className="absolute inset-0 bg-gradient-radial from-emerald-400 via-emerald-500 to-transparent rounded-full blur-xl opacity-40" style={{ transform: 'scale(1.5)' }}></div>
          </div>
        </div>
        
        {/* Upward Emanating Energy Plumes */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-full pointer-events-none">
          {/* Central plume */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-full bg-gradient-to-t from-lime-300/40 via-lime-400/30 to-transparent blur-2xl" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
          {/* Left plume */}
          <div className="absolute bottom-0 left-1/4 transform -translate-x-1/2 w-64 h-3/4 bg-gradient-to-t from-emerald-400/30 via-emerald-500/20 to-transparent blur-xl" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
          {/* Right plume */}
          <div className="absolute bottom-0 right-1/4 transform translate-x-1/2 w-64 h-3/4 bg-gradient-to-t from-emerald-400/30 via-emerald-500/20 to-transparent blur-xl" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
        </div>

        {/* Dark background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 via-green-900/70 to-green-950/50 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/60 via-transparent to-green-950/80 pointer-events-none"></div>
        
        {/* Ethereal wispy effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-950/50 via-lime-400/10 to-green-950/50 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-green-950/60 pointer-events-none"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-lime-400 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                <div className="relative z-10 rounded-full border-4 border-white shadow-2xl">
                  <Image
                    src="/syuzhet.png"
                    alt="Syuzhet"
                    width={120}
                    height={120}
                    className="rounded-full"
                    priority
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center mb-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-lime-200 mb-2 tracking-tight drop-shadow-lg" style={{ textShadow: '0 0 20px rgba(196, 253, 56, 0.5)' }}>
                Syuzhet
              </h1>
              <p className="text-lg sm:text-xl text-lime-300 font-light italic">
                (Sue-jet)
              </p>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-4xl text-lime-200 mb-8 font-light drop-shadow-md">
              Express intuition, predict the ending, make money along the way
            </p>
            <p className="text-lg sm:text-xl text-white mb-8 max-w-2xl mx-auto">
              Be the Michael Saylor of the Foresight Markets
            </p>
            {/* Flashing Michael Saylor Image */}
            <div className="flex justify-center mb-12">
              <div className="relative w-[120px] h-[120px]">
                <div 
                  className={`transition-opacity duration-500 ${
                    showSaylor ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <Image
                    src="/Saylor.png"
                    alt="Michael Saylor"
                    width={120}
                    height={120}
                    className="rounded-lg shadow-2xl border-2 border-lime-400/30"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/app')}
                className="bg-lime-400 text-green-950 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-lime-300 transition-all shadow-lg hover:shadow-xl shadow-lime-500/50 flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/app')}
                className="bg-lime-400/20 backdrop-blur-sm text-lime-200 border-2 border-lime-400/50 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-lime-400/30 transition-all"
              >
                Explore Market
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-b from-green-950 via-green-900 to-green-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-lime-200 mb-4">
              Why Syuzhet?
            </h2>
            <p className="text-xl text-white max-w-2xl mx-auto">
              The future of prediction markets, powered by AI and blockchain
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative bg-gradient-to-br from-green-900/90 via-green-800/85 to-emerald-900/90 rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:shadow-lime-500/30 transition-all hover:scale-105 border border-lime-400/20 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-lime-400/20 to-transparent rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-lime-500 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-lime-500/50">
                  <Sparkles className="w-6 h-6 text-green-950" />
                </div>
                <h3 className="text-xl font-bold text-lime-200 mb-2">AI-Powered Predictions</h3>
                <p className="text-green-100">
                  Upload your research and let AI generate investable prediction theses. No manual analysis needed.
                </p>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-green-900/90 via-green-800/85 to-emerald-900/90 rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:shadow-lime-500/30 transition-all hover:scale-105 border border-lime-400/20 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-lime-400/20 to-transparent rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-lime-500 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-lime-500/50">
                  <TrendingUp className="w-6 h-6 text-green-950" />
                </div>
                <h3 className="text-xl font-bold text-lime-200 mb-2">Trade Like Stocks</h3>
                <p className="text-white">
                  Buy and sell prediction shares with USDC. Real-time pricing, portfolio tracking, and market insights.
                </p>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-green-900/90 via-green-800/85 to-emerald-900/90 rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:shadow-lime-500/30 transition-all hover:scale-105 border border-lime-400/20 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-lime-400/20 to-transparent rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-lime-500 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-lime-500/50">
                  <Shield className="w-6 h-6 text-green-950" />
                </div>
                <h3 className="text-xl font-bold text-lime-200 mb-2">Blockchain Secured</h3>
                <p className="text-white">
                  Built on Arc blockchain with smart contracts. Your predictions are immutable and tradable assets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-24 bg-gradient-to-b from-green-950 via-green-900 to-green-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-lime-200 mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Upload Research', desc: 'Add PDFs, articles, or paste text' },
              { step: '2', title: 'AI Generates Prediction', desc: 'Get an investable thesis with probability' },
              { step: '3', title: 'Publish to Market', desc: 'List your prediction for others to trade' },
              { step: '4', title: 'Trade & Profit', desc: 'Buy/sell shares as the market evolves' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-lime-400 to-lime-500 text-green-950 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg shadow-lime-500/50">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-lime-200 mb-2">{item.title}</h3>
                <p className="text-white">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

          {/* CTA Section */}
          <div className="relative bg-gradient-to-r from-green-950 via-green-900 to-emerald-950 py-16 overflow-hidden">
            {/* Glowing energy effect */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-lime-400/30 via-lime-500/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-lime-200 mb-4">
            Ready to start predicting?
          </h2>
          <p className="text-xl text-white mb-8">
            Join the future of prediction markets today
          </p>
          <button
            onClick={() => router.push('/app')}
            className="bg-lime-400 text-green-950 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-lime-300 transition-all shadow-lg hover:shadow-xl shadow-lime-500/50 inline-flex items-center gap-2"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

