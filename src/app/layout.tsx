import type { Metadata } from 'next';
import { Press_Start_2P, VT323 } from 'next/font/google';
import './globals.css';

const pressStart = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-pixel',
  display: 'swap',
});

const vt323 = VT323({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-terminal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'birthofego // ego',
  description: 'Ego — full-stack developer. Motivated, eager, and ready to show the world what I can build.',
  openGraph: {
    title: 'birthofego',
    description: 'Ego just means self — and the confidence to back it up.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${pressStart.variable} ${vt323.variable}`}>
      <body>{children}</body>
    </html>
  );
}
