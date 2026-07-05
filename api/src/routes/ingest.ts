import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { cogneeService } from '../services/cognee';
import { authenticate } from '../middleware/tenant';

export const ingestRouter = Router();

const ingestPayloadSchema = z.object({
  payload: z.string().min(1, "Payload cannot be empty"),
});

// POST endpoint to ingest unstructured client data
ingestRouter.post('/interactions/ingest', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const result = ingestPayloadSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }

    const { payload } = result.data;

    // Save to Prisma DB linked to the specific tenant ID
    const interaction = await prisma.clientInteraction.create({
      data: {
        payload,
        tenantId,
      },
    });

    // Auto-trigger Cognee processing asynchronously
    cogneeService.processInteraction(interaction).catch(err => {
      console.error('Background Cognee processing failed:', err);
    });

    res.status(201).json({ message: 'Interaction ingested successfully', interaction });
  } catch (error) {
    console.error('Error ingesting interaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST endpoint for manual trigger of pending interactions
ingestRouter.post('/interactions/process', authenticate, async (req: Request, res: Response) => {
  try {
    // Fire off the batch process in the background
    cogneeService.processPendingInteractions().catch(err => {
      console.error('Manual trigger background processing failed:', err);
    });

    res.status(202).json({ message: 'Batch processing of pending interactions has been initiated' });
  } catch (error) {
    console.error('Error triggering processing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
