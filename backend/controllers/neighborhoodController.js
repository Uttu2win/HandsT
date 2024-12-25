import NeighborhoodModel from "../models/Neighborhood.js";
import UserModel from "../models/User.js";

export const getAllNeighborhoods = async (req, res) => {
  try {
    // Populate members with their details
    const neighborhoods = await NeighborhoodModel.find({}).populate('members', 'name email');
    res.status(200).json(neighborhoods);
  } catch (error) {
    res.status(500).json({ message: "Error fetching neighborhoods", error: error.message });
  }
};

export const createNeighborhood = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Neighborhood name is required' });
  }

  try {
    const newNeighborhood = new NeighborhoodModel({ 
      name, 
      description: description || '' 
    });
    await newNeighborhood.save();
    res.status(201).json(newNeighborhood);
  } catch (error) {
    res.status(500).json({ message: 'Error creating neighborhood', error: error.message });
  }
};

export const deleteNeighborhood = async (req, res) => {
  const { neighborhoodId } = req.params;

  try {
    // First, remove all users associated with this neighborhood
    await UserModel.deleteMany({ neighborhoodId });

    // Then delete the neighborhood
    const neighborhood = await NeighborhoodModel.findByIdAndDelete(neighborhoodId);
    
    if (!neighborhood) {
      return res.status(404).json({ message: 'Neighborhood not found' });
    }

    res.status(200).json({ message: 'Neighborhood and associated users deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting neighborhood', error: error.message });
  }
};

export const updateNeighborhood = async (req, res) => {
  const { neighborhoodId } = req.params;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Neighborhood name is required' });
  }

  try {
    const updatedNeighborhood = await NeighborhoodModel.findByIdAndUpdate(
      neighborhoodId, 
      { name, description: description || '' }, 
      { new: true } // Return the updated document
    );

    if (!updatedNeighborhood) {
      return res.status(404).json({ message: 'Neighborhood not found' });
    }

    res.status(200).json(updatedNeighborhood);
  } catch (error) {
    res.status(500).json({ message: 'Error updating neighborhood', error: error.message });
  }
};


export const getNeighborhoodById = async (req, res) => {
  try {
    const { neighborhoodId } = req.params;
    
    if (!neighborhoodId) {
      return res.status(400).json({ message: 'Neighborhood ID is required' });
    }

    const neighborhood = await NeighborhoodModel.findById(neighborhoodId)
      .populate('members', 'name email');
      
    if (!neighborhood) {
      return res.status(404).json({ message: 'Neighborhood not found' });
    }

    res.status(200).json(neighborhood);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching neighborhood', 
      error: error.message 
    });
  }
};