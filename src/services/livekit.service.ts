import { AccessToken } from 'livekit-server-sdk';

const LIVEKIT_URL = process.env.LIVEKIT_URL ?? '';
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY ?? '';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET ?? '';

export function isLiveKitConfigured(): boolean {
  return !!(LIVEKIT_URL && LIVEKIT_API_KEY && LIVEKIT_API_SECRET);
}

export function getLiveKitUrl(): string {
  return LIVEKIT_URL;
}

export async function generateRoomToken(
  roomName: string,
  participantIdentity: string,
  participantName: string,
  isTeacher: boolean,
): Promise<string> {
  if (!isLiveKitConfigured()) {
    throw new Error('LiveKit is not configured');
  }
  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantIdentity,
    name: participantName,
  });
  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: isTeacher,
    canSubscribe: true,
    canPublishData: true,
  });
  return await token.toJwt();
}
