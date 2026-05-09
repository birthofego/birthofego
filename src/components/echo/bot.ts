// ── ECHO Demo Bot ──
// Runs entirely client-side with its own ECDH key pair.
// Performs real encryption so the observatory shows genuine crypto operations.

import * as echoCrypto from './crypto';
import type { PipelineEvent } from './types';

const BOT_RESPONSES: { trigger: RegExp; replies: string[] }[] = [
  {
    trigger: /^(hi|hello|hey|sup|yo)/i,
    replies: [
      'Hey. This channel is encrypted end-to-end.',
      'Welcome to ECHO. Everything here is encrypted.',
      'Hey. Your messages are protected by AES-256-GCM.',
    ],
  },
  {
    trigger: /how.*(work|encrypt|secure)/i,
    replies: [
      'ECDH P-256 key exchange, then AES-GCM per message. Check the observatory panel on the right.',
      'We did a Diffie-Hellman handshake when you connected. Every message gets a fresh IV. Watch the pipeline.',
      'Key exchange happened on connect. Each message: plaintext → AES-GCM encrypt → base64 → transit. The server never sees plaintext.',
    ],
  },
  {
    trigger: /interceptor|mitm|man.in.the.middle|eavesdrop/i,
    replies: [
      'Toggle the interceptor view. You\'ll see what a MITM attacker gets: just noise. No keys, no plaintext.',
      'An interceptor sees base64 ciphertext and random IVs. Without the shared secret, it\'s garbage.',
    ],
  },
  {
    trigger: /who|what are you|bot/i,
    replies: [
      'I\'m ECHO\'s demo bot. I have my own ECDH key pair and encrypt everything I send to you. This is real E2E.',
      'Demo responder. My keys are generated in your browser — the encryption pipeline is genuine, not simulated.',
    ],
  },
  {
    trigger: /test|testing/i,
    replies: [
      'Message received and decrypted. Check the observatory — you\'ll see the decrypt event logged.',
      'Confirmed. Send a few more and watch the encryption pipeline fill up.',
    ],
  },
  {
    trigger: /key|secret|diffie|ecdh/i,
    replies: [
      'Our shared secret was derived via ECDH. My private key never left this browser tab. Neither did yours.',
      'P-256 curve. 256-bit shared secret. Derived independently on both sides — the server never sees it.',
    ],
  },
];

const FALLBACK_REPLIES = [
  'Message decrypted. The observatory panel shows every step of the pipeline.',
  'Received. Try sending "how does encryption work" to learn more.',
  'Copy. All messages are AES-256-GCM encrypted with a unique IV.',
  'Acknowledged. Check the right panel — each crypto operation is logged in real time.',
  'Got it. Every message you send goes through: plaintext → encrypt → base64 → transit → decrypt.',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class EchoBot {
  private keyPair: CryptoKeyPair | null = null;
  private sharedKey: CryptoKey | null = null;
  public handle = 'echo-bot';

  async init(): Promise<PipelineEvent[]> {
    const events: PipelineEvent[] = [];
    const { keyPair, event: genEvent } = await echoCrypto.generateKeyPair();
    this.keyPair = keyPair;
    events.push(genEvent);
    return events;
  }

  async getPublicKey(): Promise<{ jwk: JsonWebKey; events: PipelineEvent[] }> {
    if (!this.keyPair) throw new Error('Bot not initialized');
    const { jwk, event } = await echoCrypto.exportPublicKey(this.keyPair.publicKey);
    return { jwk, events: [event] };
  }

  async deriveSharedKey(peerPublicJwk: JsonWebKey): Promise<PipelineEvent[]> {
    if (!this.keyPair) throw new Error('Bot not initialized');
    const events: PipelineEvent[] = [];

    const { key: peerKey, event: importEvent } = await echoCrypto.importPublicKey(peerPublicJwk);
    events.push(importEvent);

    const { sharedKey, event: deriveEvent } = await echoCrypto.deriveSharedKey(
      this.keyPair.privateKey,
      peerKey,
    );
    this.sharedKey = sharedKey;
    events.push(deriveEvent);

    return events;
  }

  async generateReply(plaintext: string): Promise<{
    ciphertext: string;
    iv: string;
    replyText: string;
    events: PipelineEvent[];
  }> {
    if (!this.sharedKey) throw new Error('No shared key');

    // Pick response
    let replyText: string | null = null;
    for (const r of BOT_RESPONSES) {
      if (r.trigger.test(plaintext)) {
        replyText = pickRandom(r.replies);
        break;
      }
    }
    if (!replyText) replyText = pickRandom(FALLBACK_REPLIES);

    // Encrypt with real crypto
    const { ciphertext, iv, event } = await echoCrypto.encrypt(replyText, this.sharedKey);
    return { ciphertext, iv, replyText, events: [event] };
  }

  async decryptMessage(ciphertext: string, iv: string): Promise<{
    plaintext: string;
    events: PipelineEvent[];
  }> {
    if (!this.sharedKey) throw new Error('No shared key');
    const { plaintext, event } = await echoCrypto.decrypt(ciphertext, iv, this.sharedKey);
    return { plaintext, events: [event] };
  }
}
