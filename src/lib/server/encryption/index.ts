/**
 * AES-256-GCM Encryption Service for Cloudflare Workers
 * 
 * Uses Web Crypto API (native to Cloudflare Workers runtime)
 * - 256-bit key (32 bytes)
 * - 96-bit IV (12 bytes) - recommended for GCM mode
 * - 128-bit authentication tag (16 bytes)
 */

export interface EncryptedData {
  ciphertext: string;  // Base64 encoded encrypted data
  iv: string;          // Base64 encoded initialization vector (12 bytes)
  tag: string;         // Base64 encoded authentication tag (16 bytes)
}

/**
 * Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
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
 * Import a raw key string into a CryptoKey object for AES-GCM
 */
async function importKey(keyString: string): Promise<CryptoKey> {
  // Decode base64 key to ArrayBuffer
  const keyBuffer = base64ToArrayBuffer(keyString);
  
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM' },
    false,  // not extractable for security
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt plaintext using AES-256-GCM
 * 
 * @param plaintext - The text to encrypt
 * @param keyString - Base64 encoded 32-byte encryption key
 * @returns Encrypted data with ciphertext, iv, and tag
 */
export async function encrypt(
  plaintext: string,
  keyString: string
): Promise<EncryptedData> {
  // Generate random 96-bit IV (recommended for GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Import the encryption key
  const key = await importKey(keyString);
  
  // Encode plaintext to bytes
  const encoded = new TextEncoder().encode(plaintext);
  
  // Encrypt using AES-GCM
  const encrypted = await crypto.subtle.encrypt(
    { 
      name: 'AES-GCM', 
      iv: iv, 
      tagLength: 128  // 128-bit authentication tag
    },
    key,
    encoded
  );
  
  // Split ciphertext and tag (last 16 bytes is the tag)
  const encryptedBuffer = new Uint8Array(encrypted);
  const tagStart = encryptedBuffer.length - 16;
  
  return {
    ciphertext: arrayBufferToBase64(encryptedBuffer.slice(0, tagStart)),
    iv: arrayBufferToBase64(iv),
    tag: arrayBufferToBase64(encryptedBuffer.slice(tagStart))
  };
}

/**
 * Decrypt ciphertext using AES-256-GCM
 * Supports key rotation by trying multiple keys
 * 
 * @param encrypted - The encrypted data object
 * @param keyString - Current encryption key (base64)
 * @param previousKeyString - Optional previous key for rotation support
 * @returns Decrypted plaintext
 */
export async function decrypt(
  encrypted: EncryptedData,
  keyString: string,
  previousKeyString?: string
): Promise<string> {
  // Decode base64 values
  const iv = base64ToArrayBuffer(encrypted.iv);
  const ciphertext = base64ToArrayBuffer(encrypted.ciphertext);
  const tag = base64ToArrayBuffer(encrypted.tag);
  
  // Combine ciphertext and tag for decryption
  const combined = new Uint8Array(ciphertext.byteLength + tag.byteLength);
  combined.set(new Uint8Array(ciphertext), 0);
  combined.set(new Uint8Array(tag), ciphertext.byteLength);
  
  // Try current key first
  try {
    const key = await importKey(keyString);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv, tagLength: 128 },
      key,
      combined
    );
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    // If we have a previous key, try it (for key rotation)
    if (previousKeyString) {
      try {
        const previousKey = await importKey(previousKeyString);
        const decrypted = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: iv, tagLength: 128 },
          previousKey,
          combined
        );
        return new TextDecoder().decode(decrypted);
      } catch (e2) {
        throw new Error('Decryption failed with all keys');
      }
    }
    throw new Error('Decryption failed');
  }
}

/**
 * Generate a new encryption key (for setup)
 * Returns a base64 encoded 32-byte key
 */
export function generateEncryptionKey(): string {
  const key = crypto.getRandomValues(new Uint8Array(32));
  return arrayBufferToBase64(key);
}
