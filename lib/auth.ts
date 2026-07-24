import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE_NAME, SESSION_DURATION_MS } from '@/lib/constants';

const scrypt = promisify(scryptCallback);
const encoder = new TextEncoder();

const SCRYPT_KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, SCRYPT_KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hashHex] = stored.split(':');
  if (!salt || !hashHex) return false;

  const derivedKey = (await scrypt(password, salt, SCRYPT_KEY_LENGTH)) as Buffer;
  const storedBytes = Buffer.from(hashHex, 'hex');
  if (storedBytes.length !== derivedKey.length) return false;

  return timingSafeEqual(derivedKey, storedBytes);
}

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not set');
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// Proxy defaults to the Node.js runtime in Next.js 16, and Server Actions
// already run on Node, so Buffer is available everywhere this is used.
function toBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64url');
}

function fromBase64Url(value: string): Uint8Array {
  const buf = Buffer.from(value, 'base64url');
  const out = new Uint8Array(buf.length);
  out.set(buf);
  return out;
}

export type SessionPayload = {
  exp: number;
  userId: number;
  name: string;
  isAdmin: boolean;
};

export async function createSessionToken(user: { userId: number; name: string; isAdmin: boolean }): Promise<string> {
  const payload: SessionPayload = { ...user, exp: Date.now() + SESSION_DURATION_MS };
  const payloadBytes = encoder.encode(JSON.stringify(payload));
  const key = await getSecretKey();
  const signature = await crypto.subtle.sign('HMAC', key, payloadBytes);
  return `${toBase64Url(payloadBytes)}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const [payloadPart, signaturePart] = token.split('.');
  if (!payloadPart || !signaturePart) return null;

  try {
    const key = await getSecretKey();
    const payloadBytes = fromBase64Url(payloadPart);
    const signatureBytes = fromBase64Url(signaturePart);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as BufferSource,
      payloadBytes as BufferSource
    );
    if (!isValid) return null;

    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as Partial<SessionPayload>;
    const isWellFormed =
      typeof payload.exp === 'number' &&
      typeof payload.userId === 'number' &&
      typeof payload.name === 'string' &&
      typeof payload.isAdmin === 'boolean';

    if (!isWellFormed || payload.exp! <= Date.now()) return null;
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

/** Call at the top of every mutating Server Action - Proxy alone is not a security boundary. */
export async function requireSession(): Promise<SessionPayload> {
  const cookieStore = await cookies();
  const payload = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!payload) {
    redirect('/login');
  }
  return payload;
}
