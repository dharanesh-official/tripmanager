import { Inter, Poppins } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-heading'
});

export const metadata = {
  title: 'GlobeTrotter - Empowering Personalized Travel Planning',
  description: 'Plan, visualize, and share your multi-city travel itineraries with ease.',
  keywords: ['travel', 'itinerary', 'planning', 'budget', 'collaboration'],
};

import Providers from '@/components/Providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
