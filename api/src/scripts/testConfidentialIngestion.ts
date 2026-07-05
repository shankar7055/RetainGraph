import { prisma } from '../lib/prisma';
import { SecureCrypto } from '../ai/services/SecureCrypto';
import { memoryService } from '../ai/services/MemoryService';

const TEST_TENANT_ID = 'demo-tenant-123';
const TEST_PAYLOAD = 'CONFIDENTIAL SECRETS: CTO Johnathan Wick is leaving to competitor RelateGraph due to api gateway timeouts.';

async function runTest() {
  console.log('--- STARTING CONFIDENTIAL INGESTION TEST ---');
  
  // 1. Encrypt and save to database
  console.log('1. Encrypting test payload...');
  const encrypted = SecureCrypto.encrypt(TEST_PAYLOAD);
  console.log(`   Ciphertext: ${encrypted}`);
  
  console.log('2. Inserting encrypted interaction into SQLite...');
  const interaction = await prisma.clientInteraction.create({
    data: {
      tenantId: TEST_TENANT_ID,
      payload: encrypted,
    }
  });
  console.log(`   Created interaction ID: ${interaction.id}`);

  // 3. Verify it is encrypted in DB
  console.log('3. Fetching raw database record to verify encryption...');
  const dbRecord = await prisma.clientInteraction.findUnique({
    where: { id: interaction.id }
  });
  
  if (!dbRecord) {
    throw new Error('Failed to find created record in database.');
  }

  console.log(`   Raw DB payload: ${dbRecord.payload}`);
  const isEncrypted = dbRecord.payload.includes(':') && !dbRecord.payload.includes('Wick');
  
  if (isEncrypted) {
    console.log('✅ Success: Transcript is successfully encrypted at-rest in SQLite!');
  } else {
    throw new Error('❌ Failure: Transcript was saved in plaintext or incorrectly formatted!');
  }

  // 4. Verify decryption
  console.log('4. Decrypting payload using SecureCrypto...');
  const decrypted = SecureCrypto.decrypt(dbRecord.payload);
  console.log(`   Decrypted text: ${decrypted}`);
  
  if (decrypted === TEST_PAYLOAD) {
    console.log('✅ Success: Ciphertext decrypted back to original plaintext!');
  } else {
    throw new Error('❌ Failure: Decrypted text does not match original plaintext.');
  }

  // 5. Verify transparent decryption in MemoryService
  console.log('5. Fetching via memoryService.getRecentInteractions...');
  const recent = await memoryService.getRecentInteractions(TEST_TENANT_ID);
  const fetchedInteraction = recent.find(i => i.id === interaction.id);
  
  if (!fetchedInteraction) {
    throw new Error('Failed to retrieve interaction via memoryService.');
  }

  console.log(`   MemoryService returned payload: ${fetchedInteraction.payload}`);
  
  if (fetchedInteraction.payload === TEST_PAYLOAD) {
    console.log('✅ Success: MemoryService transparently decrypted the payload!');
  } else {
    throw new Error('❌ Failure: MemoryService returned encrypted or mismatched payload.');
  }

  // 6. Cleanup
  console.log('6. Cleaning up test record...');
  await prisma.clientInteraction.delete({
    where: { id: interaction.id }
  });
  console.log('✅ Cleanup finished.');
  console.log('--- TEST PASSED SUCCESSFULLY ---');
}

runTest().catch((err) => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
