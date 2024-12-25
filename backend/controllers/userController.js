import UserModel from '../models/User.js';
import NeighborhoodModel from '../models/Neighborhood.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';

export const registerUser = async (req, res) => {
  const { name, email, password, neighborhoodId, profilePic, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    const neighborhood = await NeighborhoodModel.findById(neighborhoodId);
    if (!neighborhood) {
      return res.status(400).json({ message: 'Invalid neighborhood ID' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      neighborhoodId,
      profilePic,
      role,
    });

    neighborhood.members.push(user._id);
    await neighborhood.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.status(201).json({ message: 'User registered successfully', user, token });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};


export const loginUser = async (req, res) => {
  const { email, password, isAdmin } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user role matches the login route
    if ((isAdmin && user.role !== 'admin') || (!isAdmin && user.role !== 'user')) {
      return res.status(403).json({ message: 'Invalid credentials for this role' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // IMPORTANT: Ensure you're including all necessary info in the token
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' } // Optional: add an expiration
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        neighborhoodId: user.neighborhoodId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await UserModel.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};



export const getUsers = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      neighborhoodId, 
      role, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Create a dynamic filter object
    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (email) filter.email = { $regex: email, $options: 'i' };
    if (neighborhoodId) filter.neighborhoodId = neighborhoodId;
    if (role) filter.role = role;

    // Determine sort direction
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortDirection };

    // Pagination
    const skip = (page - 1) * limit;

    // Fetch users with filtering, sorting, and pagination
    const users = await UserModel.find(filter)
      .select('-password')
      .populate('neighborhoodId', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const totalUsers = await UserModel.countDocuments(filter);

    res.status(200).json({
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export const uploadProfilePic = upload.single('profilePic');

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id)
      .select('-password')
      .populate('neighborhoodId', 'name');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching user profile', 
      error: error.message 
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await UserModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic info
    if (name) user.name = name;
    if (email) user.email = email;

    // Handle password change
    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Handle profile picture upload
    if (req.file) {
      // Set new profile picture
      user.profilePic = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
      
      // Update profilePicUrl to point to the new profile picture endpoint
      user.profilePicUrl = `http://localhost:8000/api/users/profile/picture/${user._id}`;
    }

    await user.save();

    // Return updated user without password
    const updatedUser = {
      ...user.toObject(),
      password: undefined
    };

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating profile', 
      error: error.message 
    });
  }
};

// Get profile picture
export const getProfilePic = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.profilePic && user.profilePic.data) {
      res.set('Content-Type', user.profilePic.contentType);
      return res.send(user.profilePic.data);
    }

    // If no profile picture is set, redirect to default picture
    res.redirect('https://www.pngarts.com/files/10/Default-Profile-Picture-PNG-Free-Download.png');
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching profile picture', 
      error: error.message 
    });
  }
};