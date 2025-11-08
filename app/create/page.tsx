'use client';

import Header from '@/components/Header';
import PredictionWizard from '@/components/PredictionWizard';

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-800">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-lime-200 mb-2">Create Prediction Market</h1>
          <p className="text-white">Transform your intuition into a tradable prediction asset</p>
        </div>
        <PredictionWizard />
      </main>
    </div>
  );
}

