'use client';

import { useDynamicContext } from '@/components/providers/DynamicProvider';
import Dashboard from '@/components/Dashboard';
import LoginPrompt from '@/components/LoginPrompt';

export default function AppPage() {
  const { isAuthenticated } = useDynamicContext();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return <Dashboard />;
}

