/**
 * Key Rotation Script
 *
 * Re-encrypts all sensitive fields in the database from an old key to a new key.
 * Fields covered: ClientInteraction.payload, CustomerHealth.rootCauses, CustomerHealth.recommendedAction
 *
 * Usage:
 *   npx tsx src/scripts/rotateKeys.ts --old-key=<old-secret> --new-key=<new-secret> [--dry-run]
 *
 * Example:
 *   npx tsx src/scripts/rotateKeys.ts --old-key="myoldpassword" --new-key="mynewpassword"
 *   npx tsx src/scripts/rotateKeys.ts --old-key="myoldpassword" --new-key="mynewpassword" --dry-run
 */

import { prisma } from '../lib/prisma';
import { SecureCrypto, deriveKey } from '../ai/services/SecureCrypto';
import crypto from 'crypto';

// Parse CLI args
const args = process.argv.slice(2);
const getArg = (name: string) => {
  const match = args.find(a => a.startsWith(`--${name}=`));
  return match ? match.split('=').slice(1).join('=') : null;
};

const oldKeyRaw = getArg('old-key');
const newKeyRaw = getArg('new-key');
const isDryRun = args.includes('--dry-run');

if (!oldKeyRaw || !newKeyRaw) {
  console.error('Usage: npx tsx src/scripts/rotateKeys.ts --old-key=<x> --new-key=<y> [--dry-run]');
  process.exit(1);
}

const oldKey = deriveKey(oldKeyRaw);
const newKey = deriveKey(newKeyRaw);

function reEncrypt(ciphertext: string): { newCiphertext: string; changed: boolean } {
  const plaintext = SecureCrypto.decrypt(ciphertext, oldKey);
  // If decrypt returned the same text, it's either legacy plaintext or already on the new key
  const isLegacyPlaintext = plaintext === ciphertext && !ciphertext.includes(':');
  const isAlreadyOnNewKey = plaintext !== ciphertext && oldKey.equals(newKey);

  if (isAlreadyOnNewKey) {
    // Same key, already encrypted — nothing to do
    return { newCiphertext: ciphertext, changed: false };
  }

  const newCiphertext = SecureCrypto.encrypt(plaintext, newKey);
  return { newCiphertext, changed: true };
}

async function rotateInteractions(): Promise<number> {
  console.log('\n[rotateKeys] Rotating ClientInteraction.payload...');
  const interactions = await prisma.clientInteraction.findMany({ select: { id: true, payload: true } });

  let changed = 0;
  for (const record of interactions) {
    const { newCiphertext, changed: didChange } = reEncrypt(record.payload);
    if (didChange) {
      if (!isDryRun) {
        await prisma.clientInteraction.update({
          where: { id: record.id },
          data: { payload: newCiphertext },
        });
      }
      changed++;
      console.log(`  ${isDryRun ? '[DRY-RUN] Would update' : 'Updated'} interaction ${record.id}`);
    }
  }
  console.log(`[rotateKeys] ${changed}/${interactions.length} interaction records re-encrypted.`);
  return changed;
}

async function rotateHealthChecks(): Promise<number> {
  console.log('\n[rotateKeys] Rotating CustomerHealth.rootCauses + .recommendedAction...');
  const checks = await prisma.customerHealth.findMany({
    select: { id: true, rootCauses: true, recommendedAction: true },
  });

  let changed = 0;
  for (const record of checks) {
    const { newCiphertext: newCauses, changed: causesChanged } = reEncrypt(record.rootCauses);
    const { newCiphertext: newAction, changed: actionChanged } = reEncrypt(record.recommendedAction);

    if (causesChanged || actionChanged) {
      if (!isDryRun) {
        await prisma.customerHealth.update({
          where: { id: record.id },
          data: { rootCauses: newCauses, recommendedAction: newAction },
        });
      }
      changed++;
      console.log(`  ${isDryRun ? '[DRY-RUN] Would update' : 'Updated'} health record ${record.id}`);
    }
  }
  console.log(`[rotateKeys] ${changed}/${checks.length} health records re-encrypted.`);
  return changed;
}

async function main() {
  console.log(`\n=== RetainGraph Key Rotation ===`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes written)' : 'LIVE (writing to database)'}`);
  console.log(`Old key fingerprint: ${crypto.createHash('md5').update(oldKeyRaw!).digest('hex').slice(0, 8)}...`);
  console.log(`New key fingerprint: ${crypto.createHash('md5').update(newKeyRaw!).digest('hex').slice(0, 8)}...`);

  const interactionsRotated = await rotateInteractions();
  const healthRotated = await rotateHealthChecks();

  console.log(`\n=== Rotation Complete ===`);
  console.log(`Interactions rotated: ${interactionsRotated}`);
  console.log(`Health records rotated: ${healthRotated}`);
  if (isDryRun) {
    console.log('\n[DRY-RUN] No changes were written. Remove --dry-run to apply.');
  } else {
    console.log('\n✅ Done. Update ENCLAVE_SECRET_KEY in your environment to the new key.');
  }
}

main()
  .catch(err => {
    console.error('Key rotation failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
