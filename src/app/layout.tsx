import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UK Fuel & EV Price Tracker',
  description:
    'Find the cheapest fuel and EV charging near you across the UK. Compare prices, track trends, and calculate if making the trip is worth the fuel cost.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-navy-900 text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
