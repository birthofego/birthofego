// ── ECHO Crypto – ECDH P-256 key exchange + AES-GCM encryption ──

import type { PipelineEvent } from './types';

let eventCounter = 0;
function makeEvent(
  type: PipelineEvent['type'],
  label: string,
  detail: string,
  durationMs?: number,
  dataPreview?: string,
): PipelineEvent {
  return {
    id: `pe-${Date.now()}-${++eventCounter}`,
    type,
    label,
    detail,
    timestamp: Date.now(),
    durationMs,
    dataPreview,
  };
}

// ── Key Generation ──

export async function generateKeyPair(): Promise<{
  keyPair: CryptoKeyPair;
  event: PipelineEvent;
}> {
  const t0 = performance.now();
  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits'],
  );
  const ms = performance.now() - t0;
  return {
    keyPair,
    event: makeEvent(
      'key-generate',
      'ECDH Key Pair Generated',
      'Algorithm: ECDH P-256 · Extractable: true',
      ms,
    ),
  };
}

export async function exportPublicKey(key: CryptoKey): Promise<{
  jwk: JsonWebKey;
  event: PipelineEvent;
}> {
  const t0 = performance.now();
  const jwk = await crypto.subtle.exportKey('jwk', key);
  const ms = performance.now() - t0;
  const preview = `x: ${jwk.x?.slice(0, 12)}... y: ${jwk.y?.slice(0, 12)}...`;
  return {
    jwk,
    event: makeEvent('key-export', 'Public Key Exported', 'Format: JWK · Curve: P-256', ms, preview),
  };
}

export async function importPublicKey(jwk: JsonWebKey): Promise<{
  key: CryptoKey;
  event: PipelineEvent;
}> {
  const t0 = performance.now();
  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    [],
  );
  const ms = performance.now() - t0;
  return {
    key,
    event: makeEvent('key-exchange', 'Peer Public Key Imported', 'Format: JWK · Curve: P-256', ms),
  };
}

// ── Key Derivation ──

export async function deriveSharedKey(
  privateKey: CryptoKey,
  peerPublicKey: CryptoKey,
): Promise<{
  sharedKey: CryptoKey;
  event: PipelineEvent;
}> {
  const t0 = performance.now();
  const bits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: peerPublicKey },
    privateKey,
    256,
  );
  const sharedKey = await crypto.subtle.importKey(
    'raw',
    bits,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
  const ms = performance.now() - t0;
  const preview = toHex(new Uint8Array(bits)).slice(0, 32) + '...';
  return {
    sharedKey,
    event: makeEvent(
      'key-derive',
      'Shared Secret Derived',
      'ECDH deriveBits → AES-GCM 256-bit key',
      ms,
      preview,
    ),
  };
}

// ── Encrypt / Decrypt ──

export async function encrypt(
  plaintext: string,
  key: CryptoKey,
): Promise<{
  ciphertext: string;
  iv: string;
  event: PipelineEvent;
}> {
  const t0 = performance.now();
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    data.buffer as ArrayBuffer,
  );
  const ms = performance.now() - t0;
  const ciphertext = toBase64(new Uint8Array(encrypted));
  const ivStr = toBase64(iv);
  return {
    ciphertext,
    iv: ivStr,
    event: makeEvent(
      'encrypt',
      'Message Encrypted',
      `AES-GCM · IV: ${toHex(iv).slice(0, 16)}... · ${data.byteLength}B → ${encrypted.byteLength}B`,
      ms,
      ciphertext.slice(0, 40) + '...',
    ),
  };
}

export async function decrypt(
  ciphertext: string,
  ivStr: string,
  key: CryptoKey,
): Promise<{
  plaintext: string;
  event: PipelineEvent;
}> {
  const t0 = performance.now();
  const data = fromBase64(ciphertext);
  const iv = fromBase64(ivStr);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    data.buffer as ArrayBuffer,
  );
  const ms = performance.now() - t0;
  const plaintext = new TextDecoder().decode(decrypted);
  return {
    plaintext,
    event: makeEvent(
      'decrypt',
      'Message Decrypted',
      `AES-GCM · ${data.byteLength}B → ${decrypted.byteLength}B plaintext`,
      ms,
    ),
  };
}

// ── Utilities ──

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(str: string): Uint8Array {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
