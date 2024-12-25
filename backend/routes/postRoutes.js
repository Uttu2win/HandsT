import express from 'express';
import PostModel from '../models/Post.js';
import { protect,admin } from '../middleware/authMiddleware.js';
import mongoose from 'mongoose';
import multer from 'multer';
import { createNotification,createNeighborhoodNotification } from '../services/notificationService.js';

const router = express.Router();
const upload = multer();

router.use(protect);
// Get posts for a specific neighborhood
router.get('/', async (req, res) => {
  try {
    const { category, neighborhoodId } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (neighborhoodId) filter.neighborhoodId = neighborhoodId;

    const posts = await PostModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('createdBy', 'name profilePic')
      .populate('likes', 'name')
      .populate({
        path: 'comments.userId',
        select: 'name profilePic'
      });
    
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to fetch posts", 
      details: error.message 
    });
  }
});

  
// Get post image
router.get('/:id/image', protect, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post || !post.image || !post.image.data) {
      return res.status(404).send('No image found');
    }
    
    // Add CORS headers
    res.set('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Content-Type', post.image.contentType);
    res.send(post.image.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching image', error: error.message });
  }
});

// Create a new post
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const postData = {
      ...req.body,
      createdBy: req.user._id,
      neighborhoodId: req.user.neighborhoodId
    };

    // Handle image upload if present
    if (req.file) {
      postData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
      delete postData.imageUrl; // Remove imageUrl if file is uploaded
    }

    const newPost = new PostModel(postData);
    await newPost.save();

    await createNeighborhoodNotification({
      type: 'post',
      actorId: req.user._id,
      neighborhoodId: req.user.neighborhoodId,
      excludeUserId: req.user._id,
      data: {
        category: newPost.category,
        postId: newPost._id,
        postTitle: newPost.title
      }
    });

    const populatedPost = await PostModel.findById(newPost._id)
      .populate('createdBy', 'name profilePic')
      .populate('likes', 'name');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Full post creation error:', error);
    res.status(500).json({ 
      message: 'Error creating post', 
      fullError: error.message 
    });
  }
});
  
//Add a comment to a post
router.post('/:id/comment', async (req, res) => {
  try {
    const postId = req.params.id;
    const { text } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;
    const post = await PostModel.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.createdBy.toString() !== req.user._id.toString()) {
      await createNotification({
        type: 'comment',
        actorId: req.user._id,
        recipientId: post.createdBy,
        data: {
          postId: post._id,
          postTitle: post.title
        }
      });
    }
    post.comments.push({ 
      text, 
      userId, 
      userName 
    });
    await post.save();
    // Populate comments with user details
    const populatedPost = await PostModel.findById(post._id)
      .populate('createdBy', 'name email profilePicUrl')
      .populate('likes', 'name email profilePicUrl')
      .populate({
        path: 'comments.userId',
        select: 'name email profilePicUrl'
      });

    res.status(200).json(populatedPost);
  } catch (error) {
    res.status(500).json({ 
      message: "Error adding comment", 
      error: error.message 
    });
  }
});

// Like/Unlike a post
router.post('/:id/like', protect, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    
    const post = await PostModel.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    // Ensure likes is always an array
    post.likes = post.likes || [];
    // Check if user has already liked the post
    const likeIndex = post.likes.findIndex(like => 
      // Handle both ObjectId and string comparisons
      like.toString() === userId.toString()
    );
    
    if (likeIndex > -1) {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
    } else {
      // Like the post
      post.likes.push(userId);
      
      // Create notification only if the post creator is not the same as the liker
      if (post.createdBy.toString() !== userId.toString()) {
        await createNotification({
          type: 'like',
          actorId: userId,
          recipientId: post.createdBy,
          data: {
            postId: post._id,
            postTitle: post.title
          }
        });
      }
    }
    
    await post.save();
    // Fully populate likes with user details
    const populatedPost = await PostModel.findById(post._id)
      .populate('createdBy', 'name email profilePicUrl')
      .populate('likes', 'name email profilePicUrl')
      .populate({
        path: 'comments.userId',
        select: 'name email profilePicUrl'
      });
    
    res.status(200).json(populatedPost);
  } catch (error) {
    console.error('Like Post Error:', error);
    res.status(500).json({
      message: "Error liking/unliking post",
      error: error.message
    });
  }
});

// Delete a post
router.delete('/:id', admin, async (req, res) => {
  try {
    const post = await PostModel.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error });
  }
});

export default router;

