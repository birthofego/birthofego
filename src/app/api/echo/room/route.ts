import { NextRequest, NextResponse } from 'next/server';
import { createRoom, getRoom, joinRoom, getRoomSessionCount } from '../store';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, roomId, handle } = body as {
    action: 'create' | 'join';
    roomId?: string;
    handle?: string;
  };

  const displayHandle = handle || 'anon';

  if (action === 'create') {
    const room = createRoom();
    const session = joinRoom(room.id, displayHandle);
    if (!session) {
      return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
    }
    return NextResponse.json({
      roomId: room.id,
      sessionId: session.sessionId,
      sessionToken: session.token,
      sessionCount: 1,
    });
  }

  if (action === 'join') {
    if (!roomId) {
      return NextResponse.json({ error: 'roomId required' }, { status: 400 });
    }
    const room = getRoom(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    const session = joinRoom(roomId, displayHandle);
    if (!session) {
      return NextResponse.json({ error: 'Failed to join' }, { status: 500 });
    }
    return NextResponse.json({
      roomId,
      sessionId: session.sessionId,
      sessionToken: session.token,
      sessionCount: getRoomSessionCount(roomId),
    });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
