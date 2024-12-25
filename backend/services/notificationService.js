import NotificationModel from '../models/Notification.js';

export const createNotification = async ({
  type,
  actorId,
  recipientId,
  data = {}
}) => {
  try {
    const notification = new NotificationModel({
      type,
      actor: actorId,
      recipient: recipientId,
      data
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const createNeighborhoodNotification = async ({
  type,
  actorId,
  neighborhoodId,
  excludeUserId,
  data = {}
}) => {
  try {
    const UserModel = (await import('../models/User.js')).default;
    
    // Get all users in the neighborhood except the actor
    const recipients = await UserModel.find({
      neighborhoodId,
      _id: { $ne: excludeUserId }
    });

    // Create notifications for each recipient
    const notifications = await Promise.all(
      recipients.map(recipient =>
        createNotification({
          type,
          actorId,
          recipientId: recipient._id,
          data
        })
      )
    );

    return notifications;
  } catch (error) {
    console.error('Error creating neighborhood notifications:', error);
    throw error;
  }
};