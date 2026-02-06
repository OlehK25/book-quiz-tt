/**
 * Secure localStorage wrapper with TTL and validation
 * Features:
 * - Automatic expiration (TTL)
 * - Data validation with Zod
 * - Encryption support for sensitive data
 * - Auto-cleanup of expired items
 */

import { z } from 'zod';
import { encrypt, decrypt } from './crypto';

interface StorageItem<T> {
  value: T;
  expiresAt: number; // Unix timestamp
  encrypted?: boolean;
}

interface SetOptions {
  ttl?: number; // Time-to-live in milliseconds
  encrypt?: boolean; // Encrypt value
}

interface GetOptions {
  decrypt?: boolean; // Decrypt value
  validate?: z.ZodSchema; // Zod schema for validation
}

/**
 * Default TTL values (in milliseconds)
 */
export const TTL = {
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
  ONE_MONTH: 30 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Set item in localStorage with TTL and optional encryption
 */
export async function setSecure<T>(
  key: string,
  value: T,
  options: SetOptions = {}
): Promise<void> {
  const { ttl, encrypt: shouldEncrypt } = options;
  
  let processedValue: T | string = value;
  
  // Encrypt if requested
  if (shouldEncrypt && typeof value === 'string') {
    processedValue = await encrypt(value);
  }
  
  const item: StorageItem<typeof processedValue> = {
    value: processedValue,
    expiresAt: ttl ? Date.now() + ttl : Number.MAX_SAFE_INTEGER,
    encrypted: shouldEncrypt,
  };
  
  try {
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error(`Failed to store item "${key}":`, error);
    throw new Error('Storage quota exceeded or localStorage unavailable');
  }
}

/**
 * Get item from localStorage with validation and decryption
 */
export async function getSecure<T>(
  key: string,
  options: GetOptions = {}
): Promise<T | null> {
  const { decrypt: shouldDecrypt, validate } = options;
  
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;
  
  try {
    const item: StorageItem<T> = JSON.parse(itemStr);
    
    // Check expiration
    if (Date.now() > item.expiresAt) {
      console.info(`Item "${key}" expired, removing`);
      localStorage.removeItem(key);
      return null;
    }
    
    let value = item.value;
    
    // Decrypt if needed
    if (shouldDecrypt && item.encrypted && typeof value === 'string') {
      try {
        value = (await decrypt(value)) as T;
      } catch {
        console.warn(`Failed to decrypt "${key}", clearing storage.`);
        localStorage.removeItem(key);
        return null;
      }
    }
    
    // Validate if schema provided
    if (validate) {
      try {
        value = validate.parse(value) as T;
      } catch {
        console.warn(`Validation failed for "${key}", resetting.`);
        localStorage.removeItem(key);
        return null;
      }
    }
    
    return value;
  } catch (error) {
    console.error(`Failed to parse item "${key}":`, error);
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Remove item from localStorage
 */
export function removeSecure(key: string): void {
  localStorage.removeItem(key);
}

/**
 * Cleanup all expired items
 * Call this on app initialization
 */
export function cleanupExpired(): void {
  const now = Date.now();
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) continue;
      
      const item: StorageItem<unknown> = JSON.parse(itemStr);
      
      if (now > item.expiresAt) {
        keysToRemove.push(key);
      }
    } catch {
      // Invalid JSON, skip
      continue;
    }
  }
  
  // Remove expired items
  keysToRemove.forEach(key => {
    console.info(`Removing expired item: ${key}`);
    localStorage.removeItem(key);
  });
  
  if (keysToRemove.length > 0) {
    console.info(`Cleaned up ${keysToRemove.length} expired items`);
  }
}

/**
 * Clear all quiz-related data
 * Call this on logout or retake quiz
 */
export function clearAllQuizData(): void {
  const quizKeys = Object.keys(localStorage).filter(key => 
    key.startsWith('quiz-') || key.startsWith('holywater-')
  );
  
  quizKeys.forEach(key => localStorage.removeItem(key));
  
  console.info(`Cleared ${quizKeys.length} quiz items`);
}

/**
 * Get storage size (for debugging)
 */
export function getStorageSize(): { used: number; limit: number } {
  let used = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    const value = localStorage.getItem(key);
    if (value) {
      // Rough estimate: key + value length in bytes (UTF-16)
      used += (key.length + value.length) * 2;
    }
  }
  
  // Most browsers: 5-10MB limit
  const limit = 5 * 1024 * 1024; // 5MB
  
  return { used, limit };
}
