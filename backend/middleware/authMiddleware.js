import jwt from 'jsonwebtoken';
import UserModel from '../models/User.js';

export const protect = async (req, res, next) => {
  // Detailed logging of authorization
  console.log('Full Authorization Headers:', req.headers.authorization);

  // Check if authorization header exists and starts with Bearer
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
    return res.status(401).json({ 
      message: 'Not authorized, no token',
      details: 'Authorization header is missing or invalid' 
    });
  }

  try {
    // Extract token from header
    const token = req.headers.authorization.split(' ')[1];
    console.log('Extracted Token:', token);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded);

    // Find user by ID
    const user = await UserModel.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ 
        message: 'User not found',
        details: 'No user associated with this token' 
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Token Verification Error:', error);
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token',
        details: 'Token verification failed' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        details: 'Authentication token has expired' 
      });
    }

    return res.status(401).json({ 
      message: 'Not authorized, token failed', 
      error: error.message 
    });
  }
};

export const admin = (req, res, next) => {
  // Ensure user exists and has admin role
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Not authorized as an admin',
      details: 'Requires admin privileges' 
    });
  }
};