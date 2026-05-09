'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import * as echoCrypto from './crypto';
import { EchoBot } from './bot';
import { usePipeline } from './usePipeline';
import type { DecryptedMessage, PipelineEvent } from './types';

type SessionState = 'idle' | 'connecting' | 'ready' | 'error';

export function useEchoSession() {
  const [state, setState] = useState<SessionState>('idle');
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [handle, setHandle] = useState('you');
  const [botMode, setBotMode] = useState(true);
  const [rawMessages, setRawMessages] = useState<{ ciphertext: string; iv: string; sender: string }[]>([]);

  const pipeline = usePipeline();
  const keyPairRef = useRef<CryptoKeyPair | null>(null);
  const sharedKeyRef = useRef<CryptoKey | null>(null);
  const botRef = useRef<EchoBot | null>(null);
  const publicJwkRef = useRef<JsonWebKey | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPollTs = useRef(0);
  const msgIdCounter = useRef(0);

  // ── Initialize session: create room, generate keys, set up bot ──
  const connect = useCallback(async (displayHandle?: string) => {
    setState('connecting');
    const h = displayHandle || 'you';
    setHandle(h);

    try {
      // 1. Generate key pair
      const { keyPair, event: genEvent } = await echoCrypto.generateKeyPair();
      keyPairRef.current = keyPair;
      pipeline.push(genEvent);

      // 2. Export public key
      const { jwk, event: exportEvent } = await echoCrypto.exportPublicKey(keyPair.publicKey);
      publicJwkRef.current = jwk;
      pipeline.push(exportEvent);

      // 3. Create room via API
      const roomRes = await fetch('/api/echo/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', handle: h }),
      });
      const roomData = await roomRes.json();
      setRoomId(roomData.roomId);
      setSessionId(roomData.sessionId);

      pipeline.push({
        id: `pe-room-${Date.now()}`,
        type: 'net-send',
        label: 'Room Created',
        detail: `Room ${roomData.roomId} · Session ${roomData.sessionId.slice(0, 8)}...`,
        timestamp: Date.now(),
      });

      // 4. Publish our public key
      await fetch('/api/echo/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: roomData.roomId,
          sessionId: roomData.sessionId,
          publicKey: jwk,
        }),
      });

      // 5. Initialize bot (demo mode)
      const bot = new EchoBot();
      const botInitEvents = await bot.init();
      pipeline.pushMany(botInitEvents);

      const { jwk: botJwk, events: botExportEvents } = await bot.getPublicKey();
      pipeline.pushMany(botExportEvents);

      // 6. Key exchange with bot
      const { key: botPubKey, event: importEvent } = await echoCrypto.importPublicKey(botJwk);
      pipeline.push(importEvent);

      const { sharedKey, event: deriveEvent } = await echoCrypto.deriveSharedKey(
        keyPair.privateKey,
        botPubKey,
      );
      sharedKeyRef.current = sharedKey;
      pipeline.push(deriveEvent);

      // Bot derives shared key from our public key
      const botDeriveEvents = await bot.deriveSharedKey(jwk);
      pipeline.pushMany(botDeriveEvents);

      botRef.current = bot;
      setBotMode(true);
      setState('ready');
      lastPollTs.current = Date.now();

      // Add system message
      setMessages([{
        id: `msg-sys-0`,
        senderId: 'system',
        senderHandle: 'ECHO',
        plaintext: 'Encrypted channel established. Key exchange complete. Type a message.',
        timestamp: Date.now(),
        isBot: false,
        isOwn: false,
      }]);
    } catch (err) {
      console.error('Echo connect error:', err);
      setState('error');
    }
  }, [pipeline]);

  // ── Send a message ──
  const sendMessage = useCallback(async (plaintext: string) => {
    if (!sharedKeyRef.current || !botRef.current) return;

    const trimmed = plaintext.trim();
    if (!trimmed) return;

    // Encrypt
    const { ciphertext, iv, event: encEvent } = await echoCrypto.encrypt(trimmed, sharedKeyRef.current);
    pipeline.push(encEvent);

    // Log network send
    pipeline.push({
      id: `pe-netsend-${Date.now()}`,
      type: 'net-send',
      label: 'Message Sent',
      detail: `${ciphertext.length} chars ciphertext · IV: ${iv.slice(0, 12)}...`,
      timestamp: Date.now(),
      dataPreview: ciphertext.slice(0, 40) + '...',
    });

    // Track raw message for interceptor view
    setRawMessages(prev => [...prev, { ciphertext, iv, sender: handle }]);

    // Add to local messages
    const userMsg: DecryptedMessage = {
      id: `msg-${++msgIdCounter.current}`,
      senderId: 'player',
      senderHandle: handle,
      plaintext: trimmed,
      timestamp: Date.now(),
      isOwn: true,
    };
    setMessages(prev => [...prev, userMsg]);

    // Bot receives, decrypts, responds (with realistic delay)
    setTimeout(async () => {
      const bot = botRef.current;
      if (!bot) return;

      // Bot decrypts our message
      const { events: decryptEvents } = await bot.decryptMessage(ciphertext, iv);
      pipeline.pushMany(decryptEvents);

      // Bot generates reply
      const { ciphertext: replyCt, iv: replyIv, replyText, events: replyEvents } = await bot.generateReply(trimmed);
      pipeline.pushMany(replyEvents);

      // Log network receive
      pipeline.push({
        id: `pe-netrecv-${Date.now()}`,
        type: 'net-receive',
        label: 'Message Received',
        detail: `${replyCt.length} chars ciphertext · IV: ${replyIv.slice(0, 12)}...`,
        timestamp: Date.now(),
        dataPreview: replyCt.slice(0, 40) + '...',
      });

      // Track raw for interceptor
      setRawMessages(prev => [...prev, { ciphertext: replyCt, iv: replyIv, sender: 'echo-bot' }]);

      // We decrypt the bot's reply (proves the crypto works both directions)
      const { event: ourDecrypt } = await echoCrypto.decrypt(replyCt, replyIv, sharedKeyRef.current!);
      pipeline.push(ourDecrypt);

      const botMsg: DecryptedMessage = {
        id: `msg-${++msgIdCounter.current}`,
        senderId: 'bot',
        senderHandle: 'echo-bot',
        plaintext: replyText,
        timestamp: Date.now(),
        isBot: true,
      };
      setMessages(prev => [...prev, botMsg]);
    }, 800 + Math.random() * 1200); // 0.8-2s delay
  }, [handle, pipeline]);

  // ── Disconnect ──
  const disconnect = useCallback(() => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    keyPairRef.current = null;
    sharedKeyRef.current = null;
    botRef.current = null;
    setMessages([]);
    setRawMessages([]);
    setRoomId(null);
    setSessionId(null);
    setState('idle');
    pipeline.clear();
  }, [pipeline]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  return {
    state,
    messages,
    rawMessages,
    roomId,
    sessionId,
    handle,
    botMode,
    pipeline,
    connect,
    sendMessage,
    disconnect,
  };
}
