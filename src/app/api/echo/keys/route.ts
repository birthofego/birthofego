import { NextRequest, NextResponse } from 'next/server';
import { storePublicKey, getPeerPublicKey } from '../store';

// POST: publish this session's public key
export async function POST(req: NextRequest) {
  const { roomId, sessionId, publicKey } = await req.json();

  if (!roomId || !sessionId || !publicKey) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const ok = storePublicKey(roomId, sessionId, publicKey);
  if (!ok) {
    return NextResponse.json({ error: 'Room or session not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

// GET: fetch peer's public key
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId');
  const sessionId = searchParams.get('sessionId');

  if (!roomId || !sessionId) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const peer = getPeerPublicKey(roomId, sessionId);
  if (!peer) {
    return NextResponse.json({ peer: null }, { status: 200 });
  }

  return NextResponse.json({
    peer: {
      publicKey: peer.key,
      peerId: peer.peerId,
      peerHandle: peer.peerHandle,
    },
  });
}
