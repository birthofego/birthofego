import type { Metadata } from 'next';
import BurnApp from '@/components/burn/BurnApp';
import BackToPortfolio from '@/components/ui/BackToPortfolio';
import './burn.css';

export const metadata: Metadata = {
  title: 'BURN — Nutrition Tracker | birthofego',
  description: 'Nutrition and fitness tracker with macro monitoring, net calorie tracking, workout logging, and hydration goals. PostgreSQL + Drizzle ORM.',
};

export default function BurnPage() {
  return (
    <>
      <BackToPortfolio />
      <BurnApp />
    </>
  );
}
