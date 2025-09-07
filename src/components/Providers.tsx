'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import SessionProvider from './SessionProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionProvider>
        {children}
      </SessionProvider>
    </Provider>
  );
}
