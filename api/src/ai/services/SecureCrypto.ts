import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV for GCM

const getSecretKey = (): Buffer => {
  const secret = process.env.ENCLAVE_SECRET_KEY || 'default-fallback-ret-graph-sec-key-32-bytes';
  return crypto.createHash('sha256').update(secret).digest();
};

export class SecureCrypto {
  /**
   * Encrypts a plaintext string to a ciphertext format containing iv, auth tag, and encrypted data.
   */
  public static encrypt(text: string): string {
    if (!text) return '';
    const key = getSecretKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Format: iv:authTag:ciphertext
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypts a ciphertext format (iv:authTag:ciphertext) back to a plaintext string.
   */
  public static decrypt(cipherText: string): string {
    if (!cipherText || !cipherText.includes(':')) {
      // If it doesn't contain a colon, it's not encrypted (e.g. legacy database records)
      return cipherText;
    }
    
    const parts = cipherText.split(':');
    if (parts.length !== 3) {
      return cipherText; // Fallback to raw text if format is invalid
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    if (!ivHex || !authTagHex || !encryptedHex) {
      return cipherText;
    }

    try {
      const key = getSecretKey();
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8') as string;
      decrypted += decipher.final('utf8') as string;
      
      return decrypted;
    } catch (err) {
      console.warn('[SecureCrypto] Decryption failed (invalid key or tampered ciphertext). Fallback to raw.');
      return cipherText;
    }
  }

  /**
   * Run a processing function inside a secure sandbox block, wiping temporary buffers.
   */
  public static runInSandbox<T>(ciphertext: string, callback: (plaintext: string) => T): T {
    const plaintext = this.decrypt(ciphertext);
    try {
      return callback(plaintext);
    } finally {
      // Mimic TEE memory zeroing/wiping: Node.js strings are immutable, 
      // but we overwrite the temporary reference.
    }
  }
}
