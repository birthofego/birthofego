import type { Metadata } from 'next';
import EchoApp from '@/components/echo/EchoApp';
import './echo.css';

export const metadata: Metadata = {
  title: 'ECHO — Encrypted Messenger | birthofego',
  description: 'Zero-signup E2E encrypted messenger with a live encryption observatory. ECDH key exchange, AES-256-GCM, Web Crypto API.',
};

export default function EchoPage() {
  return <EchoApp />;
}
