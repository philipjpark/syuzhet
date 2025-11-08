'use client';

import { useDynamicContext } from '@/components/providers/DynamicProvider';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginPrompt() {
  const { isAuthenticated } = useDynamicContext();
  const router = useRouter();

  const handleDemoLogin = () => {
    // In mock mode, redirect to app
    router.push('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-700 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <Image
              src="/syuzhet.png"
              alt="Syuzhet Logo"
              width={100}
              height={100}
              className="rounded-full shadow-lg relative z-10"
              priority
            />
          </div>
        </div>
        <div className="mb-3">
          <h1 className="text-4xl font-bold text-gray-900 mb-1">Welcome to Syuzhet</h1>
          <p className="text-sm text-gray-500 italic">(Sue-jet)</p>
        </div>
        <p className="text-lg text-gray-600 mb-2 font-medium">
          Express your intuition, predict the ending, make money along the way
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Be the Michael Saylor of the Foresight Markets
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleDemoLogin}
            className="w-full bg-green-800 hover:bg-green-900 text-white py-3.5 px-6 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
          >
            Continue in Demo Mode
          </button>
          <p className="text-xs text-gray-400 mt-2">
            {isAuthenticated 
              ? 'You are logged in' 
              : 'Connect your wallet for full functionality'}
          </p>
        </div>
      </div>
    </div>
  );
}

