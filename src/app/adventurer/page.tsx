import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import AdventurerApp from '@/components/adventurer/AdventurerApp';
import BackToPortfolio from '@/components/ui/BackToPortfolio';
import './adventurer.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Adventurer — Daily Quests | birthofego',
  description: 'A gamified task manager with daily quests, a kanban quest board, and slime monsters to defeat.',
};

export default function AdventurerPage() {
  return (
    <div className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <BackToPortfolio />
      <AdventurerApp />
    </div>
  );
}
