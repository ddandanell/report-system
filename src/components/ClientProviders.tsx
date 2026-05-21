'use client';
import { ReactNode } from 'react';
import { ToastProvider } from '@/components/Toast';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
