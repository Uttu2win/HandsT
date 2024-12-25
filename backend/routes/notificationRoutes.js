import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import NotificationModel from '../models/Notification.js';
import { createNotification } from '../services/notificationService.js';

const router = express.Router();

// Get notifications for a user
router.get('/', protect, async (req, res) => {
  try {
    console.log('Fetching notifications for user:', req.user._id);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 5); // Last 5 days

    const notifications = await NotificationModel.find({
      recipient: req.user._id,
      createdAt: { $gte: cutoffDate }
    })
    .populate('actor', 'name')
    .sort({ createdAt: -1 });

    console.log('Found notifications:', notifications);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      message: 'Error fetching notifications', 
      error: error.message 
    });
  }
});

// Delete a notification
router.delete('/:notificationId', protect, async (req, res) => {
  try {
    const notification = await NotificationModel.findOneAndDelete({
      _id: req.params.notificationId,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting notification', 
      error: error.message 
    });
  }
});

export default router;