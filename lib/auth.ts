import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE_NAME, SESSION_DURATION_MS } from '@/lib/constants';

const encoder = new TextEncoder();

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

export async function createSessionToken(): Promise<string> {
  const payloadBytes = encoder.encode(JSON.stringify({ exp: Date.now() + SESSION_DURATION_MS }));
  const key = await getSecretKey();
  const signature = await crypto.subtle.sign('HMAC', key, payloadBytes);
  return `${toBase64Url(payloadBytes)}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [payloadPart, signaturePart] = token.split('.');
  if (!payloadPart || !signaturePart) return false;

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
    if (!isValid) return false;

    const { exp } = JSON.parse(new TextDecoder().decode(payloadBytes));
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

/** Call at the top of every mutating Server Action - Proxy alone is not a security boundary. */
export async function requireSession(): Promise<void> {
  const cookieStore = await cookies();
  const isValid = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!isValid) {
    redirect('/login');
  }
}
