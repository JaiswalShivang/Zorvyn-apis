import express from 'express';
const router = express.Router();
import { signup, login } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

router.post('/signup', signup);
router.post('/login', login);

router.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: 'Protected route accessed', user: req.user });
});

export default router;