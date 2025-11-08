'use client';

import { useDynamicContext } from '@/components/providers/DynamicProvider';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  const { user, isAuthenticated } = useDynamicContext();

  return (
    <header className="bg-gradient-to-r from-green-950 via-green-900 to-green-950 border-b border-lime-400/30 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <Image
              src="/syuzhet.png"
              alt="Syuzhet"
              width={36}
              height={36}
              className="rounded-full"
            />
            <div>
                <h1 className="text-lg font-bold text-lime-200">Syuzhet</h1>
                  <p className="text-xs text-green-300">(Sue-jet)</p>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <div className="text-sm font-medium text-lime-200">
                {user?.email || 'Demo User'}
                  </div>
                )}
                {!isAuthenticated && (
                  <div className="text-sm text-green-300 font-medium">Demo Mode</div>
                )}
          </div>
        </div>
      </div>
    </header>
  );
}

