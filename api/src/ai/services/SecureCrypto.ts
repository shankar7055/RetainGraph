import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV for GCM

const getSecretKey = (): Buffer => {
  const secret = process.env.ENCLAVE_SECRET_KEY || 'default-fallback-ret-graph-sec-key-32-bytes';
  return crypto.createHash('sha256').update(secret).digest();
};

// Derive a key from an explicit secret string (used for key rotation)
export const deriveKey = (secret: string): Buffer =>
  crypto.createHash('sha256').update(secret).digest();

export class SecureCrypto {
  /**
   * Encrypts a plaintext string to a ciphertext token: iv:authTag:ciphertext
   */
  public static encrypt(text: string, key: Buffer = getSecretKey()): string {
    if (!text) return '';
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypts a ciphertext token back to plaintext.
   * Falls back to raw text for legacy unencrypted records.
   */
  public static decrypt(cipherText: string, key: Buffer = getSecretKey()): string {
    if (!cipherText || !cipherText.includes(':')) return cipherText;

    const parts = cipherText.split(':');
    if (parts.length !== 3) return cipherText;

    const [ivHex, authTagHex, encryptedHex] = parts;
    if (!ivHex || !authTagHex || !encryptedHex) return cipherText;

    try {
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8') as string;
      decrypted += decipher.final('utf8') as string;
      return decrypted;
    } catch {
      console.warn('[SecureCrypto] Decryption failed — invalid key or tampered ciphertext. Returning raw.');
      return cipherText;
    }
  }

  /**
   * Emit a structured ENCLAVE AUDIT log line every time sensitive data is decrypted.
   * Required for SOC 2 / compliance access trails.
   */
  public static audit(tenantId: string, field: string, reason: string): void {
    console.log(
      JSON.stringify({
        logType: 'enclave_audit',
        tenantId,
        field,
        reason,
        timestamp: new Date().toISOString(),
      })
    );
  }
}
