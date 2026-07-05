import { Router } from 'express';
import { chatController } from './chat.controller';
import { validateChatRequest } from './chat.validator';

const router = Router();

router.post('/chat', validateChatRequest, chatController.askQuestion);
router.post('/accounts/:id/chat', validateChatRequest, chatController.askQuestion);

export const chatRoutes = router;
