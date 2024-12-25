import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },  // Title of the post
  content: { type: String, required: true }, // Content of the post
  category: { 
    type: String, 
    enum: ['Events', 'Announcements', 'News', 'ForSaleFree', 'LostAndFound', 'Services'],
    required: true 
  }, // Category of the post
  image: { 
    data: Buffer,
    contentType: String
  },
  imageUrl: { 
    type: String,
    validate: {
      validator: function(v) {
        // Either imageUrl or image should be present, but not both
        return !(this.image && this.image.data && v);
      },
      message: 'Cannot have both image upload and image URL'
    }
  },
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users' 
  }], // Number of likes for the post
  comments: [
    {
      text: { type: String, required: true }, // Comment text
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }, // User who made the comment
      userName: { type: String, required: true },
      createdAt: { type: Date, default: Date.now } // Timestamp for comment
    }
  ],
  neighborhoodId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'neighborhoods', 
    required: true 
  }, // Neighborhood this post belongs to
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users', 
    required: true 
  }, // User who created the post
  createdAt: { 
    type: Date, 
    default: Date.now 
  }, // Timestamp for when the post was created
});

const PostModel = mongoose.model('posts', postSchema);
export default PostModel;
