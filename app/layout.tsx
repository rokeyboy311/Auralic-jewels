import type { Metadata } from 'next';
import './globals.css';
import LayoutClientWrapper from '@/components/LayoutClientWrapper';

export const metadata: Metadata = {
  title: 'AURELIC — Haute Joaillerie & High Fine Jewellery Paris',
  description:
    'Aurelic Jewels handcrafts certified conflict-free diamond solitaires, untreated Colombian emeralds, and 18K/22K gold heirlooms with insured worldwide armored courier delivery.',
  openGraph: {
    title: 'AURELIC — Haute Joaillerie & High Fine Jewellery Paris',
    description:
      'Certified conflict-free diamond solitaires, rare Colombian emeralds, and 18K/22K gold masterworks.',
    type: 'website',
    url: 'https://aurelic-jewels.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AURELIC — Haute Joaillerie Paris',
    description: 'International Fine Jewellery & Bespoke Diamond Workshop.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body suppressHydrationWarning className="bg-[#faf8f5] text-[#1a1a1a] min-h-screen flex flex-col">
        <LayoutClientWrapper>{children}</LayoutClientWrapper>
      </body>
    </html>
  );
}
