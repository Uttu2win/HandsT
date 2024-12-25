import express from 'express';
import { 
  getAllNeighborhoods, 
  createNeighborhood,
  deleteNeighborhood, 
  updateNeighborhood,
  getNeighborhoodById 
} from '../controllers/neighborhoodController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllNeighborhoods);
router.get('/:neighborhoodId', protect, getNeighborhoodById); // Add this new route
router.post('/', protect, admin, createNeighborhood);
router.put('/:neighborhoodId', protect, admin, updateNeighborhood);
router.delete('/:neighborhoodId', protect, admin, deleteNeighborhood);

export default router;