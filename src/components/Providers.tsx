'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import SessionProvider from './SessionProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider session={null}>
      <Provider store={store}>{children}</Provider>
    </SessionProvider>
  );
}
