'use client';

import { useDynamicContext } from '@/components/providers/DynamicProvider';
import Dashboard from '@/components/Dashboard';
import LoginPrompt from '@/components/LoginPrompt';
import { useEffect, useState } from 'react';

export default function AppPage() {
  const { isAuthenticated } = useDynamicContext();
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check if user has enabled demo mode
    const demoMode = localStorage.getItem('syuzhet_demo_mode') === 'true';
    setIsDemoMode(demoMode);
  }, []);

  // Show dashboard if authenticated OR if demo mode is enabled
  if (isAuthenticated || isDemoMode) {
    return <Dashboard />;
  }

  return <LoginPrompt />;
}

