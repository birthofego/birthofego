// ── ECHO Types ──

export interface Session {
  id: string;
  token: string;
  handle: string;
  roomId: string;
}

export interface EncryptedMessage {
  id: string;
  senderId: string;
  senderHandle: string;
  ciphertext: string; // base64
  iv: string;         // base64
  timestamp: number;
  isBot?: boolean;
}

export interface DecryptedMessage {
  id: string;
  senderId: string;
  senderHandle: string;
  plaintext: string;
  timestamp: number;
  isBot?: boolean;
  isOwn?: boolean;
}

export type PipelineEventType =
  | 'key-generate'
  | 'key-export'
  | 'key-exchange'
  | 'key-derive'
  | 'encrypt'
  | 'decrypt'
  | 'net-send'
  | 'net-receive'
  | 'net-poll';

export interface PipelineEvent {
  id: string;
  type: PipelineEventType;
  label: string;
  detail: string;
  timestamp: number;
  durationMs?: number;
  dataPreview?: string; // truncated hex/base64
}

export interface RoomInfo {
  id: string;
  sessionCount: number;
  createdAt: number;
}
