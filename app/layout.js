import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata = {
  title: 'GlobeTrotter - Empowering Personalized Travel Planning',
  description: 'Plan, visualize, and share your multi-city travel itineraries with ease.',
  keywords: ['travel', 'itinerary', 'planning', 'budget', 'collaboration'],
};

import Providers from '@/components/Providers';
import { ToastProvider } from '@/components/Toast';

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body className={outfit.className}>
        <Providers>
          <ToastProvider>
            {children}
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
