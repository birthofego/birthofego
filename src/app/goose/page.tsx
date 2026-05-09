import type { Metadata } from 'next';
import GooseApp from '@/components/goose/GooseApp';
import './goose.css';

export const metadata: Metadata = {
  title: 'GOOSE — Duck Duck Goose | birthofego',
  description: 'A grainy little browser horror game. Pull cards, dodge the goose, win your freedom from the mafia.',
};

export default function GoosePage() {
  return <GooseApp />;
}
