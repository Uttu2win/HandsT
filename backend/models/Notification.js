import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['post', 'like', 'comment', 'listing', 'join'],
    required: true
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  data: {
    postTitle: String,
    category: String,
    postId: mongoose.Schema.Types.ObjectId
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 432000 // 5 days in seconds
  }
});

const NotificationModel = mongoose.model('notifications', notificationSchema);
export default NotificationModel;