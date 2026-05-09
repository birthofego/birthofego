import { NextRequest, NextResponse } from 'next/server';
import { pushMessage, pollMessages } from '../store';

// POST: send an encrypted message
export async function POST(req: NextRequest) {
  const { roomId, sessionId, senderHandle, ciphertext, iv } = await req.json();

  if (!roomId || !sessionId || !ciphertext || !iv) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const msg = pushMessage(roomId, sessionId, senderHandle || 'anon', ciphertext, iv);
  if (!msg) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  return NextResponse.json({ messageId: msg.id, timestamp: msg.timestamp });
}

// GET: poll for new messages
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId');
  const sessionId = searchParams.get('sessionId');
  const after = parseInt(searchParams.get('after') || '0', 10);

  if (!roomId || !sessionId) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const messages = pollMessages(roomId, sessionId, after);

  return NextResponse.json({ messages });
}
