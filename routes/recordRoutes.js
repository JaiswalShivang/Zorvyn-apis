import express from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';
import { 
  createRecord, 
  getRecords, 
  updateRecord, 
  deleteRecord 
} from '../controllers/recordController.js';

const router = express.Router();

router.use(authenticateToken); 

router.get('/', authorizeRole('VIEWER', 'ANALYST', 'ADMIN'), getRecords);

router.post('/', authorizeRole('ADMIN'), createRecord);

router.put('/:id', authorizeRole('ANALYST', 'ADMIN'), updateRecord);

router.delete('/:id', authorizeRole('ADMIN'), deleteRecord);

export default router;