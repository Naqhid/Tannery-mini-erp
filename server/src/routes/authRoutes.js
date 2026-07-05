import { Router } from 'express';
import * as ctrl from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/login', ctrl.login);

// Protected routes
router.get('/me', requireAuth, ctrl.me);
router.post('/change-password', requireAuth, ctrl.changePassword);
router.post('/logout', requireAuth, ctrl.logout);

export default router;
