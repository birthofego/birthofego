# ECHO — How to Build an Encrypted Messenger

A beginner-friendly, line-by-line breakdown of how Project ECHO works. If you can write basic JavaScript and have used React, you can understand everything here.

---

## Table of Contents

1. [What Are We Building?](#1-what-are-we-building)
2. [The Concepts (No Code Yet)](#2-the-concepts-no-code-yet)
3. [Project Structure](#3-project-structure)
4. [Part 1: Types — Defining Our Data Shapes](#4-part-1-types)
5. [Part 2: The Crypto Engine](#5-part-2-the-crypto-engine)
6. [Part 3: The Server (API Routes)](#6-part-3-the-server)
7. [Part 4: The Bot](#7-part-4-the-bot)
8. [Part 5: The Session Hook](#8-part-5-the-session-hook)
9. [Part 6: The UI](#9-part-6-the-ui)
10. [Full Flow: What Happens When You Send a Message](#10-full-flow)
11. [Glossary](#11-glossary)

---

## 1. What Are We Building?

A chat app where:
- No signup is required
- Messages are encrypted so the server can never read them
- A bot responds to your messages using real encryption (not fake)
- A side panel shows every encryption step happening in real time
- An "interceptor" view shows what a hacker would see (just noise)

**Stack:** Next.js (React framework), TypeScript, Web Crypto API (built into every browser).

**No external libraries.** Zero npm installs for the crypto. The browser already knows how to do it.

---

## 2. The Concepts (No Code Yet)

### What is Encryption?

Encryption turns readable text into unreadable garbage. Only someone with the right "key" can turn it back.

```
"hello" + key → "aX9kL2mQ8v..."    (encrypt)
"aX9kL2mQ8v..." + key → "hello"    (decrypt)
```

### What is a Key Pair?

A key pair is two keys that are mathematically linked:
- **Public key** — you share this with everyone. Think of it as an open padlock.
- **Private key** — you keep this secret. It's the only thing that opens the padlock.

### What is Key Exchange? (The Hard Part)

The problem: Two strangers need to agree on a shared secret, but they're communicating over a public channel where anyone can listen.

The solution (Diffie-Hellman):
1. Alice makes a key pair. Bob makes a key pair.
2. Alice sends Bob her **public** key. Bob sends Alice his **public** key.
3. Alice computes: `her private key + Bob's public key = SECRET`
4. Bob computes: `his private key + Alice's public key = SAME SECRET`

They both arrive at the same secret independently. The secret was never transmitted. An eavesdropper who saw both public keys CANNOT derive the secret. That's the math magic.

### What is AES-GCM?

Once both sides have the shared secret, they use it to encrypt messages. AES-GCM is the algorithm that does the scrambling. You don't need to understand how it works internally — just what goes in and what comes out:

**Inputs:** plaintext + key + IV (random number)
**Output:** ciphertext (scrambled bytes)

### What is an IV?

IV stands for "Initialization Vector." It's a random number generated fresh for every single message. It ensures that encrypting "hello" twice produces completely different ciphertext each time. Without it, a hacker could tell when you repeat a message.

The IV is NOT secret. It gets sent alongside the ciphertext. It's useless without the key.

### What is Base64?

Encrypted data is raw bytes (numbers like `[104, 29, 255, 0, 83...]`). You can't put raw bytes in a JSON message. Base64 converts bytes into safe text characters like `aGVsbG8=`. It's not encryption — it's just a format converter. Like converting a photo to a .jpg so you can email it.

---

## 3. Project Structure

```
src/
  components/echo/
    types.ts              ← Data shape definitions
    crypto.ts             ← All encryption functions (THE core file)
    bot.ts                ← Demo bot that responds with real encryption
    useEchoSession.ts     ← React hook that orchestrates everything
    usePipeline.ts        ← React hook that logs crypto events
    EchoApp.tsx           ← Main UI component
    ChatPanel.tsx          ← The chat messages + input
    ObservatoryPanel.tsx   ← Shows encryption events in real time
    InterceptorView.tsx    ← Shows what a hacker would see

  app/
    echo/
      page.tsx            ← The route (just renders EchoApp)
      echo.css            ← All styles
    api/echo/
      store.ts            ← In-memory database (just a Map)
      room/route.ts       ← API: create/join chat rooms
      keys/route.ts       ← API: share public keys
      messages/route.ts   ← API: send/receive encrypted messages
```

Build order: types → crypto → store → API routes → bot → hooks → UI.

---

## 4. Part 1: Types

**File: `types.ts`**

Before writing any logic, we define the shapes of our data. TypeScript types are like blueprints — they say "a Message looks like THIS" so every file agrees on the structure.

```ts
// What an encrypted message looks like going over the network
export interface EncryptedMessage {
  id: string;              // unique ID
  senderId: string;        // who sent it
  senderHandle: string;    // display name
  ciphertext: string;      // the scrambled message (base64)
  iv: string;              // the random number used to encrypt (base64)
  timestamp: number;       // when it was sent (milliseconds)
}
```

Why separate `ciphertext` and `iv`? Because the recipient needs BOTH to decrypt. The IV tells the algorithm "this specific message used this random seed." Without it, decryption fails.

```ts
// What a message looks like AFTER we've decrypted it
export interface DecryptedMessage {
  id: string;
  senderId: string;
  senderHandle: string;
  plaintext: string;       // ← the readable text! This only exists client-side
  timestamp: number;
  isBot?: boolean;         // was this from the demo bot?
  isOwn?: boolean;         // did WE send this?
}
```

Notice: `EncryptedMessage` has `ciphertext`. `DecryptedMessage` has `plaintext`. The server only ever sees the encrypted version. The decrypted version only exists in your browser.

```ts
// Every crypto operation we log for the observatory panel
export interface PipelineEvent {
  id: string;
  type: PipelineEventType;   // 'encrypt', 'decrypt', 'key-generate', etc.
  label: string;              // human-readable name
  detail: string;             // technical description
  timestamp: number;
  durationMs?: number;        // how long it took
  dataPreview?: string;       // truncated preview of the data
}
```

This is what powers the observatory. Every time we encrypt, decrypt, or exchange keys, we create one of these and push it to the log.

---

## 5. Part 2: The Crypto Engine

**File: `crypto.ts`**

This is the heart of the entire project. It's ~200 lines, but only 6 actual operations. Everything else is logging for the observatory.

### Import

```ts
import type { PipelineEvent } from './types';
```

That's it. No crypto library. No `npm install`. The Web Crypto API is built into the browser. We access it via the global `crypto.subtle` object — it's just there, like `console.log` or `document.querySelector`.

### Function 1: Generate a Key Pair

```ts
export async function generateKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },  // which algorithm + which curve
    true,                                      // extractable? yes, we need to share the public half
    ['deriveBits'],                            // what we'll use this key for
  );
  return { keyPair };
}
```

**Line by line:**
- `crypto.subtle.generateKey()` — asks the browser to make a key pair
- `{ name: 'ECDH', namedCurve: 'P-256' }` — use the ECDH algorithm with the P-256 curve. These are industry standards. P-256 means 256-bit security. You pick this the same way you'd pick "UTF-8" for text encoding — it's the standard.
- `true` — "extractable" means we can export the public key to send it to someone else
- `['deriveBits']` — tells the browser "we'll use this key to derive a shared secret later"

**What comes back:** `{ publicKey: CryptoKey, privateKey: CryptoKey }`. These are opaque objects — you can't see the raw numbers inside them. You can only pass them to other `crypto.subtle` functions.

**Why is it `async`?** Crypto operations can be slow. The browser runs them off the main thread so your UI doesn't freeze. That's why every crypto function uses `await`.

### Function 2: Export the Public Key

```ts
export async function exportPublicKey(key: CryptoKey) {
  const jwk = await crypto.subtle.exportKey('jwk', key);
  return { jwk };
}
```

The public key is a `CryptoKey` object — you can't just put it in a JSON message. `exportKey('jwk', ...)` converts it to a plain JavaScript object (JWK = JSON Web Key) that looks like this:

```json
{
  "kty": "EC",
  "crv": "P-256",
  "x": "f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU",
  "y": "x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0"
}
```

`x` and `y` are the actual public key coordinates on the elliptic curve. You don't need to understand what that means. You just need to know: this is what gets sent to the other person.

### Function 3: Import a Public Key

```ts
export async function importPublicKey(jwk: JsonWebKey) {
  const key = await crypto.subtle.importKey(
    'jwk',                                     // format we're importing from
    jwk,                                       // the key data
    { name: 'ECDH', namedCurve: 'P-256' },    // must match how it was generated
    true,                                      // extractable
    [],                                        // no usages — we only use it for deriveBits with OUR private key
  );
  return { key };
}
```

The reverse of export. Takes the JWK object we received from the other person and turns it back into a `CryptoKey` that `crypto.subtle` can use.

### Function 4: Derive the Shared Secret (THE KEY FUNCTION)

```ts
export async function deriveSharedKey(
  privateKey: CryptoKey,      // OUR private key
  peerPublicKey: CryptoKey,   // THEIR public key
) {
  // Step 1: Compute raw shared secret bits
  const bits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: peerPublicKey },
    privateKey,
    256,                      // we want 256 bits
  );

  // Step 2: Convert raw bits into a usable AES key
  const sharedKey = await crypto.subtle.importKey(
    'raw',                                  // importing raw bytes
    bits,                                   // the shared secret
    { name: 'AES-GCM', length: 256 },      // turn it into an AES-GCM key
    false,                                  // NOT extractable — no one can ever read this key
    ['encrypt', 'decrypt'],                 // this key can encrypt AND decrypt
  );

  return { sharedKey };
}
```

**This is the most important function in the entire project.**

Step 1: `deriveBits` does the Diffie-Hellman math. It takes YOUR private key + THEIR public key and outputs 256 bits of shared secret. The other person does the same with THEIR private key + YOUR public key and gets the EXACT same 256 bits. The secret was never sent over the network.

Step 2: Those raw 256 bits become an AES-GCM key. Notice `false` for extractable — once this key is created, it can never be exported, inspected, or copied. It can only be used to encrypt and decrypt. This is a security measure enforced by the browser itself.

### Function 5: Encrypt a Message

```ts
export async function encrypt(plaintext: string, key: CryptoKey) {
  // Convert text to bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  // "hello" → [104, 101, 108, 108, 111]

  // Generate a random IV (12 bytes for AES-GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));
  // Something like [29, 184, 73, 201, 55, 12, 88, 163, 7, 241, 99, 180]

  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,        // the shared secret
    data.buffer as ArrayBuffer,
  );
  // encrypted is now an ArrayBuffer of scrambled bytes

  // Convert to base64 so we can send it as text
  const ciphertext = toBase64(new Uint8Array(encrypted));
  const ivStr = toBase64(iv);

  return { ciphertext, iv: ivStr };
}
```

**Line by line:**
1. `TextEncoder().encode()` — turns your string into bytes. Encryption works on bytes, not strings.
2. `crypto.getRandomValues()` — fills a 12-byte array with random numbers. This is the IV. A new one is generated for EVERY message. This is what makes it so even if you send "hello" twice, the ciphertext is different both times.
3. `crypto.subtle.encrypt()` — the actual encryption. Takes the algorithm config (AES-GCM + IV), the key, and the data. Returns scrambled bytes.
4. `toBase64()` — converts raw bytes to a text string so it can travel in JSON.

**What gets sent over the network:** `{ ciphertext: "aX9kL2mQ8v...", iv: "Hbg5yTcM..." }`. The `iv` is public. The `ciphertext` is useless without the key. The key was never sent.

### Function 6: Decrypt a Message

```ts
export async function decrypt(ciphertext: string, ivStr: string, key: CryptoKey) {
  // Convert base64 back to bytes
  const data = fromBase64(ciphertext);
  const iv = fromBase64(ivStr);

  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    data.buffer as ArrayBuffer,
  );

  // Convert bytes back to text
  const plaintext = new TextDecoder().decode(decrypted);
  return { plaintext };
}
```

The exact reverse of encrypt:
1. Base64 → bytes
2. `crypto.subtle.decrypt()` with the same key and IV → original bytes
3. `TextDecoder` → readable string

If you use the wrong key, this function THROWS AN ERROR. It doesn't return garbage — it fails completely. AES-GCM includes an authentication tag that verifies the data wasn't tampered with. This is why it's called "authenticated encryption."

### Utility Functions

```ts
// Bytes → base64 text (for sending over JSON)
function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);  // btoa is a built-in browser function
}

// Base64 text → bytes (for receiving from JSON)
function fromBase64(str: string): Uint8Array {
  const binary = atob(str);  // atob is a built-in browser function
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Bytes → hex string (just for display in the observatory)
function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  // [255, 10, 0] → "ff0a00"
}
```

None of these are encryption. They're format converters:
- `toBase64` / `fromBase64` — for network transport
- `toHex` — for human-readable display in the observatory

---

## 6. Part 3: The Server

### The In-Memory Store

**File: `store.ts`**

This is our "database" — but it's just a JavaScript `Map`. Data lives in server memory and disappears on restart. For a portfolio demo, this is fine.

```ts
// This is the entire "database"
const rooms = new Map<string, Room>();
```

A `Map` is like a JavaScript object but better for dynamic keys. `rooms.set('abc123', roomData)` stores a room. `rooms.get('abc123')` retrieves it. `rooms.delete('abc123')` removes it.

```ts
interface Room {
  id: string;                              // "abc123"
  sessions: Map<string, StoredSession>;    // who's in the room
  messages: StoredMessage[];               // encrypted messages
  createdAt: number;                       // when it was made
}
```

The important thing: `messages` contains `StoredMessage` objects which have `ciphertext` and `iv` — the server NEVER has the decrypted text. It's just holding encrypted blobs for delivery.

### API Route: Create/Join a Room

**File: `room/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createRoom, joinRoom } from '../store';
```

`NextRequest` and `NextResponse` are Next.js's way of handling HTTP requests and responses. They're like Express's `req` and `res` if you've seen that.

```ts
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, roomId, handle } = body;

  if (action === 'create') {
    const room = createRoom();                    // makes a new room in the Map
    const session = joinRoom(room.id, handle);    // adds a session to it
    return NextResponse.json({
      roomId: room.id,
      sessionId: session.sessionId,
    });
  }

  if (action === 'join') {
    const session = joinRoom(roomId, handle);     // joins existing room
    return NextResponse.json({
      roomId,
      sessionId: session.sessionId,
    });
  }
}
```

This is a standard REST API endpoint. When the frontend calls `fetch('/api/echo/room', { method: 'POST', body: ... })`, this function runs on the server. It creates a room or joins one, and returns the IDs.

**Why `export async function POST`?** In Next.js App Router, you export functions named after HTTP methods. `POST` handles POST requests. `GET` handles GET requests. The file path (`/api/echo/room/route.ts`) becomes the URL path (`/api/echo/room`).

### API Route: Key Exchange

**File: `keys/route.ts`**

```ts
// POST: "here's my public key, store it"
export async function POST(req: NextRequest) {
  const { roomId, sessionId, publicKey } = await req.json();
  storePublicKey(roomId, sessionId, publicKey);
  return NextResponse.json({ ok: true });
}

// GET: "give me the other person's public key"
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId');
  const sessionId = searchParams.get('sessionId');

  const peer = getPeerPublicKey(roomId, sessionId);
  return NextResponse.json({ peer });
}
```

When you connect, your browser:
1. POSTs your public key to the server
2. GETs the other person's public key from the server

The server is just a mailbox. It holds public keys for exchange. Public keys are safe to share — that's the whole point of public-key cryptography.

### API Route: Messages

**File: `messages/route.ts`**

```ts
// POST: send an encrypted message
export async function POST(req: NextRequest) {
  const { roomId, sessionId, senderHandle, ciphertext, iv } = await req.json();
  const msg = pushMessage(roomId, sessionId, senderHandle, ciphertext, iv);
  return NextResponse.json({ messageId: msg.id });
}

// GET: check for new messages (polling)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId');
  const sessionId = searchParams.get('sessionId');
  const after = parseInt(searchParams.get('after') || '0');

  const messages = pollMessages(roomId, sessionId, after);
  return NextResponse.json({ messages });
}
```

The POST receives `ciphertext` and `iv` — never plaintext. The server stores the encrypted blob.

The GET returns encrypted messages newer than the `after` timestamp. The client then decrypts them locally.

**What is polling?** The client calls GET every 1 second to check for new messages. It's like refreshing your email. Not as instant as WebSockets, but much simpler to implement and understand.

---

## 7. Part 4: The Bot

**File: `bot.ts`**

The bot exists so a solo visitor can demo the app without needing a second person. The critical thing: **the bot uses real encryption.** It generates its own key pair, does a real key exchange, and encrypts/decrypts every message. The observatory shows genuine crypto operations, not faked ones.

```ts
import * as echoCrypto from './crypto';
```

The bot imports the same crypto functions the main app uses. It's a real participant in the encryption protocol.

```ts
export class EchoBot {
  private keyPair: CryptoKeyPair | null = null;     // bot's own keys
  private sharedKey: CryptoKey | null = null;        // shared secret with user

  async init() {
    const { keyPair } = await echoCrypto.generateKeyPair();
    this.keyPair = keyPair;
  }
```

On init, the bot generates its own ECDH key pair — just like a real user would.

```ts
  async deriveSharedKey(peerPublicJwk: JsonWebKey) {
    // Import the user's public key
    const { key: peerKey } = await echoCrypto.importPublicKey(peerPublicJwk);

    // Derive shared secret: bot's private + user's public = shared key
    const { sharedKey } = await echoCrypto.deriveSharedKey(
      this.keyPair.privateKey,
      peerKey,
    );
    this.sharedKey = sharedKey;
  }
```

Same Diffie-Hellman exchange. The bot takes the user's public key, combines it with its own private key, and derives the shared secret. The user did the reverse. Both sides now have the same key.

```ts
  async generateReply(plaintext: string) {
    // Pick a response based on what the user said
    let replyText = pickResponse(plaintext);

    // Encrypt it with the shared key
    const { ciphertext, iv } = await echoCrypto.encrypt(replyText, this.sharedKey);
    return { ciphertext, iv, replyText };
  }
```

The bot picks a canned response, then encrypts it with the shared key before "sending" it. The user's browser then decrypts it with the same shared key. Full round-trip encryption.

**Response selection** is just pattern matching — if the user says "hello", pick from a list of greetings. If they ask about encryption, pick from a list of explanations. No AI. Just an array of responses with regex triggers:

```ts
const BOT_RESPONSES = [
  {
    trigger: /^(hi|hello|hey)/i,
    replies: [
      'Hey. This channel is encrypted end-to-end.',
      'Welcome to ECHO. Everything here is encrypted.',
    ],
  },
  // ... more patterns ...
];
```

---

## 8. Part 5: The Session Hook

**File: `useEchoSession.ts`**

This is the orchestrator — it calls the crypto functions, hits the API, manages the bot, and exposes everything to the UI. It's a React custom hook.

```ts
'use client';
import { useState, useCallback, useRef } from 'react';
```

`'use client'` tells Next.js this code runs in the browser, not the server. Required because we use React hooks and browser APIs.

### The Connect Flow

This is the most complex function. Here's what happens when you click "Start Encrypted Session":

```ts
const connect = useCallback(async () => {
  setState('connecting');

  // STEP 1: Generate our key pair
  const { keyPair } = await echoCrypto.generateKeyPair();
  keyPairRef.current = keyPair;

  // STEP 2: Export our public key to shareable format
  const { jwk } = await echoCrypto.exportPublicKey(keyPair.publicKey);

  // STEP 3: Create a room on the server
  const res = await fetch('/api/echo/room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create', handle: 'you' }),
  });
  const { roomId, sessionId } = await res.json();

  // STEP 4: Upload our public key to the server
  await fetch('/api/echo/keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, sessionId, publicKey: jwk }),
  });

  // STEP 5: Initialize the bot
  const bot = new EchoBot();
  await bot.init();                                // bot generates its own keys

  // STEP 6: Get the bot's public key
  const { jwk: botJwk } = await bot.getPublicKey();

  // STEP 7: Key exchange — import bot's public key
  const { key: botPubKey } = await echoCrypto.importPublicKey(botJwk);

  // STEP 8: Derive shared secret (our private + bot's public)
  const { sharedKey } = await echoCrypto.deriveSharedKey(
    keyPair.privateKey,
    botPubKey,
  );
  sharedKeyRef.current = sharedKey;

  // STEP 9: Bot derives the same shared secret (bot's private + our public)
  await bot.deriveSharedKey(jwk);

  // Done! Both sides have the same shared key.
  setState('ready');
}, []);
```

**Why `useRef` instead of `useState` for keys?**

```ts
const keyPairRef = useRef<CryptoKeyPair | null>(null);
const sharedKeyRef = useRef<CryptoKey | null>(null);
```

`useState` triggers a re-render every time the value changes. We don't need to re-render when a key is generated — the key is used internally by the crypto functions, not displayed on screen. `useRef` stores a value without causing re-renders. It's like a box you can put things in and read later.

### Sending a Message

```ts
const sendMessage = useCallback(async (plaintext: string) => {
  // 1. Encrypt the message
  const { ciphertext, iv } = await echoCrypto.encrypt(
    plaintext,
    sharedKeyRef.current    // the shared secret
  );

  // 2. Add to our own message list (we know our own plaintext)
  setMessages(prev => [...prev, {
    plaintext: plaintext,
    isOwn: true,
    // ...
  }]);

  // 3. After a delay, bot decrypts, generates reply, encrypts it
  setTimeout(async () => {
    // Bot decrypts what we sent
    await bot.decryptMessage(ciphertext, iv);

    // Bot generates an encrypted reply
    const { ciphertext: replyCt, iv: replyIv, replyText } =
      await bot.generateReply(plaintext);

    // We decrypt the bot's reply (proves crypto works both ways)
    await echoCrypto.decrypt(replyCt, replyIv, sharedKeyRef.current);

    // Add bot's message to the list
    setMessages(prev => [...prev, {
      plaintext: replyText,
      isBot: true,
      // ...
    }]);
  }, 1000);   // 1 second delay to feel realistic
}, []);
```

The flow: encrypt → (network) → decrypt → generate reply → encrypt → (network) → decrypt. Full E2E both directions.

---

## 9. Part 6: The UI

### EchoApp.tsx — The Orchestrator

```ts
export default function EchoApp() {
  const session = useEchoSession();     // all the logic from Part 5

  // Before connecting: show landing page
  if (session.state === 'idle') {
    return <LandingScreen onStart={session.connect} />;
  }

  // After connecting: show two-panel layout
  return (
    <div className="echo-layout">
      <ChatPanel
        messages={session.messages}
        onSend={session.sendMessage}
      />
      <ObservatoryPanel
        events={session.pipeline.events}
      />
    </div>
  );
}
```

That's the essence of it. The hook does all the work. The component just passes data to child components.

### ChatPanel.tsx — The Chat

Standard React form:

```ts
export default function ChatPanel({ messages, onSend }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();                    // prevent page reload
    if (!input.trim()) return;             // don't send empty messages
    onSend(input);                         // call the hook's sendMessage
    setInput('');                           // clear the input
  };

  return (
    <div>
      {/* Render messages */}
      {messages.map(msg => (
        <div key={msg.id} className={msg.isOwn ? 'own' : 'other'}>
          <span>{msg.senderHandle}</span>
          <span>{msg.plaintext}</span>
        </div>
      ))}

      {/* Input form */}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={e => setInput(e.target.value)} />
        <button type="submit">SEND</button>
      </form>
    </div>
  );
}
```

If you've built any React form, this is identical. Nothing crypto-specific here.

### ObservatoryPanel.tsx — The Pipeline Display

```ts
export default function ObservatoryPanel({ events }) {
  return (
    <div>
      {events.map(event => (
        <div key={event.id}>
          <span className="badge">{event.type}</span>   {/* KEY, ENC, DEC, NET */}
          <span>{event.label}</span>                     {/* "Message Encrypted" */}
          <span>{event.detail}</span>                    {/* "AES-GCM · 5B → 21B" */}
          {event.durationMs && <span>{event.durationMs}ms</span>}
          {event.dataPreview && <span>{event.dataPreview}</span>}
        </div>
      ))}
    </div>
  );
}
```

Just maps over an array and renders each event. The events were created by the `makeEvent()` helper inside `crypto.ts` — every crypto function returns both its result AND a log event.

### InterceptorView.tsx — The Hacker's View

```ts
export default function InterceptorView({ rawMessages }) {
  return (
    <div>
      <p>What an eavesdropper sees. No keys. No plaintext. Just noise.</p>
      {rawMessages.map((msg, i) => (
        <div key={i}>
          <span>IV: {msg.iv}</span>              {/* random bytes */}
          <span>PAYLOAD: {msg.ciphertext}</span>  {/* scrambled garbage */}
        </div>
      ))}
    </div>
  );
}
```

This receives the raw encrypted data — the same `ciphertext` and `iv` that travel over the network. No decryption happens here. The visitor sees the same gibberish an attacker would see. The contrast with the readable chat on the left is the visual proof.

---

## 10. Full Flow: What Happens When You Send "hello"

1. You type "hello" and hit Send
2. `TextEncoder` converts `"hello"` → `[104, 101, 108, 108, 111]` (5 bytes)
3. Browser generates random IV: `[29, 184, 73, 201, 55, 12, 88, 163, 7, 241, 99, 180]`
4. `crypto.subtle.encrypt()` scrambles the bytes using AES-GCM + shared key + IV → 21 bytes of ciphertext
5. Ciphertext → base64: `"aX9kL2mQ8v7Bp3Kz..."` (so it can travel in JSON)
6. App sends `{ ciphertext: "aX9kL2mQ8v...", iv: "Hbg5yTcM..." }` to the server
7. Server stores it. **Server cannot read it.** It's just holding encrypted blobs.
8. Bot receives the ciphertext + IV
9. Bot calls `crypto.subtle.decrypt()` with the SAME shared key + the IV → gets back `[104, 101, 108, 108, 111]`
10. `TextDecoder` converts bytes → `"hello"`
11. Bot picks a response, encrypts it the same way, sends it back
12. Your browser decrypts the bot's response
13. Observatory logged every step. Interceptor shows only the ciphertext.

---

## 11. Glossary

| Term | What It Actually Is |
|------|-------------------|
| **ECDH** | Elliptic Curve Diffie-Hellman. The algorithm for key exchange. Two people swap public keys and independently derive the same shared secret. |
| **P-256** | A specific elliptic curve (think: a specific math formula). Industry standard. 256-bit security. |
| **AES-GCM** | Advanced Encryption Standard, Galois/Counter Mode. The algorithm that scrambles your messages. 256-bit key. Includes authentication (detects tampering). |
| **IV** | Initialization Vector. Random bytes generated per message so the same plaintext encrypts differently each time. Not secret. |
| **JWK** | JSON Web Key. A standard format for representing a crypto key as a plain JSON object. |
| **Base64** | A way to encode binary data as text characters. Not encryption. Just format conversion. |
| **Key Pair** | A public key (shareable) + private key (secret). Mathematically linked. |
| **Shared Secret** | The key both sides derive independently via Diffie-Hellman. Never transmitted. Used to encrypt/decrypt messages. |
| **Ciphertext** | Encrypted data. Unreadable without the key. |
| **Plaintext** | The original readable message. Only exists on the sender's and recipient's devices. |
| **E2E** | End-to-End encryption. Only the sender and recipient can read messages. The server in the middle cannot. |
| **MITM** | Man-In-The-Middle. An attacker sitting between two communicating parties, intercepting traffic. |
| **Web Crypto API** | Built-in browser API for cryptographic operations. No npm install needed. Accessed via `crypto.subtle`. |
| **Polling** | Repeatedly checking for new data on a timer (e.g., every 1 second). Simple alternative to WebSockets. |
| **`useRef`** | React hook that stores a value without triggering re-renders. Used for keys and timers. |
| **`useCallback`** | React hook that memoizes a function so it doesn't get recreated on every render. |
| **`useState`** | React hook that stores a value AND triggers a re-render when it changes. Used for UI data. |
