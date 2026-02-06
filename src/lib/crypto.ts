/**
 * Cryptography utilities using Web Crypto API
 * Used for encrypting sensitive data (email) in localStorage
 * 
 * Algorithm: AES-GCM (Galois/Counter Mode)
 * - Authenticated encryption
 * - Built-in integrity check
 * - Industry standard
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits recommended for GCM

/**
 * Generate a new encryption key
 * Key is stored in sessionStorage (cleared when tab closes)
 */
export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Export key to storable format (JWK)
 */
async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('jwk', key);
  return JSON.stringify(exported);
}

/**
 * Import key from JWK string
 */
async function importKey(keyString: string): Promise<CryptoKey> {
  const keyData = JSON.parse(keyString);
  return crypto.subtle.importKey(
    'jwk',
    keyData,
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Get or create session encryption key
 * Key is stored in sessionStorage (ephemeral)
 */
export async function getSessionKey(): Promise<CryptoKey> {
  const stored = sessionStorage.getItem('quiz-encryption-key');
  
  if (stored) {
    try {
      return await importKey(stored);
    } catch (error) {
      console.warn('Failed to import stored key, generating new one:', error);
    }
  }
  
  // Generate new key
  const key = await generateKey();
  const exported = await exportKey(key);
  sessionStorage.setItem('quiz-encryption-key', exported);
  
  return key;
}

/**
 * Encrypt string data
 * Returns base64-encoded encrypted data with IV prepended
 */
export async function encrypt(data: string): Promise<string> {
  const key = await getSessionKey();
  
  // Generate random IV (initialization vector)
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  // Encode data to bytes
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);
  
  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv,
    },
    key,
    dataBytes
  );
  
  // Combine IV + encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  // Convert to base64
  return btoa(String.fromCharCode(...Array.from(combined)));
}

/**
 * Decrypt encrypted string
 * Expects base64-encoded data with IV prepended
 */
export async function decrypt(encryptedData: string): Promise<string> {
  try {
    const key = await getSessionKey();
    
    // Decode base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract IV and ciphertext
    const iv = combined.slice(0, IV_LENGTH);
    const ciphertext = combined.slice(IV_LENGTH);
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      ciphertext
    );
    
    // Decode bytes to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch {
    throw new Error('Decryption failed');
  }
}

/**
 * Clear session encryption key
 * Call this on logout or when clearing quiz data
 */
export function clearSessionKey(): void {
  sessionStorage.removeItem('quiz-encryption-key');
}
