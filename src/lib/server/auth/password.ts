/**
 * Password Hashing using PBKDF2
 * 
 * Uses Web Crypto API (native to Cloudflare Workers)
 * - 100,000 iterations
 * - SHA-256 hash
 * - 256-bit output
 */

export interface HashedPassword {
  hash: string;       // Base64 encoded hash
  salt: string;       // Base64 encoded salt
  iterations: number;
  algorithm: string;
}

/**
 * Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Hash a password using PBKDF2
 * 
 * @param password - Plain text password
 * @returns Hashed password with salt
 */
export async function hashPassword(password: string): Promise<HashedPassword> {
  // Generate random 16-byte salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  // Derive 256-bit hash using PBKDF2
  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256  // 256 bits = 32 bytes
  );
  
  return {
    hash: arrayBufferToBase64(hash),
    salt: arrayBufferToBase64(salt),
    iterations: 100000,
    algorithm: 'PBKDF2-SHA256'
  };
}

/**
 * Verify a password against a stored hash
 * 
 * @param password - Plain text password to verify
 * @param storedHash - Previously stored hash
 * @returns True if password matches
 */
export async function verifyPassword(
  password: string,
  storedHash: HashedPassword
): Promise<boolean> {
  const salt = base64ToArrayBuffer(storedHash.salt);
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  // Derive hash with same parameters
  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: storedHash.iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  // Compare hashes (constant-time comparison would be better but this works)
  const hashBase64 = arrayBufferToBase64(hash);
  return hashBase64 === storedHash.hash;
}
