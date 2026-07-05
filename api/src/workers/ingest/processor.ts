import { cogneeGateway } from '../../ai/gateways/CogneeGateway';
import { ClientInteraction } from '@prisma/client';
import { prisma } from '../../shared/config/prisma';

export class IngestProcessor {
  public async process(interaction: ClientInteraction) {
    console.log(`[IngestProcessor] Processing interaction ${interaction.id}...`);
    try {
      await cogneeGateway.addInteraction(interaction.id, interaction.payload, interaction.tenantId);
      await cogneeGateway.cognify(interaction.tenantId);

      await prisma.clientInteraction.update({
        where: { id: interaction.id },
        data: { processed: true },
      });
      console.log(`[IngestProcessor] Successfully processed ${interaction.id}`);
    } catch (e) {
      console.error(`[IngestProcessor] Error processing ${interaction.id}:`, e);
    }
  }
}

export const ingestProcessor = new IngestProcessor();
