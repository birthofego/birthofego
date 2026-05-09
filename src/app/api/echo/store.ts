// ── ECHO In-Memory Store ──
// Module-scoped Maps survive across requests in the same process.

interface StoredSession {
  id: string;
  token: string;
  handle: string;
  publicKey?: JsonWebKey;
  lastPoll: number;
}

interface StoredMessage {
  id: string;
  senderId: string;
  senderHandle: string;
  ciphertext: string;
  iv: string;
  timestamp: number;
}

interface Room {
  id: string;
  sessions: Map<string, StoredSession>;
  messages: StoredMessage[];
  createdAt: number;
}

const rooms = new Map<string, Room>();

function generateId(len = 8): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Room Operations ──

export function createRoom(): Room {
  const id = generateId(4); // short room codes
  const room: Room = { id, sessions: new Map(), messages: [], createdAt: Date.now() };
  rooms.set(id, room);
  return room;
}

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

export function joinRoom(roomId: string, handle: string): { sessionId: string; token: string } | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  const sessionId = generateId(8);
  const token = generateId(16);
  room.sessions.set(sessionId, {
    id: sessionId,
    token,
    handle,
    lastPoll: Date.now(),
  });
  return { sessionId, token };
}

// ── Key Exchange ──

export function storePublicKey(roomId: string, sessionId: string, publicKey: JsonWebKey): boolean {
  const room = rooms.get(roomId);
  if (!room) return false;
  const session = room.sessions.get(sessionId);
  if (!session) return false;
  session.publicKey = publicKey;
  return true;
}

export function getPeerPublicKey(roomId: string, sessionId: string): { key: JsonWebKey; peerId: string; peerHandle: string } | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  for (const [id, session] of room.sessions) {
    if (id !== sessionId && session.publicKey) {
      return { key: session.publicKey, peerId: id, peerHandle: session.handle };
    }
  }
  return null;
}

// ── Messages ──

export function pushMessage(
  roomId: string,
  senderId: string,
  senderHandle: string,
  ciphertext: string,
  iv: string,
): StoredMessage | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  const msg: StoredMessage = {
    id: generateId(8),
    senderId,
    senderHandle,
    ciphertext,
    iv,
    timestamp: Date.now(),
  };
  room.messages.push(msg);
  // Cap stored messages at 200
  if (room.messages.length > 200) {
    room.messages = room.messages.slice(-200);
  }
  return msg;
}

export function pollMessages(roomId: string, sessionId: string, after: number): StoredMessage[] {
  const room = rooms.get(roomId);
  if (!room) return [];
  const session = room.sessions.get(sessionId);
  if (session) session.lastPoll = Date.now();
  return room.messages.filter(m => m.timestamp > after && m.senderId !== sessionId);
}

export function getRoomSessionCount(roomId: string): number {
  const room = rooms.get(roomId);
  if (!room) return 0;
  return room.sessions.size;
}

// ── Cleanup: remove stale rooms (>30 min inactive) ──
setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [id, room] of rooms) {
    let lastActivity = room.createdAt;
    for (const session of room.sessions.values()) {
      if (session.lastPoll > lastActivity) lastActivity = session.lastPoll;
    }
    if (lastActivity < cutoff) rooms.delete(id);
  }
}, 60_000);
