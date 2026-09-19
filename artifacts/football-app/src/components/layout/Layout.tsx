import React from 'react';
import { useLocation } from 'wouter';
import { Header } from './Header';
import { AnnouncementBanner } from './AnnouncementBanner';

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isAdmin = location.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
