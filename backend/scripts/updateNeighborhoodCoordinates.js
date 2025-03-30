import mongoose from 'mongoose';
import NeighborhoodModel from '../models/Neighborhood.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure dotenv with the correct path
dotenv.config({ path: path.join(__dirname, '../.env') });

const neighborhoods = [
  {
    name: 'Koramangala',
    coordinates: {
      latitude: 12.9354775,
      longitude: 77.6218927
    }
  },
  {
    name: 'Basavangudi',
    coordinates: {
      latitude: 12.9423863,
      longitude: 77.5532454
    }
  },
  {
    name: 'JP Nagar',
    coordinates: {
      latitude: 12.889695,
      longitude: 77.5368752
    }
  },
  {
    name: 'Banashankari',
    coordinates: {
      latitude: 12.9347127,
      longitude: 77.5116432
    }
  },
  {
    name: 'Jayanagar',
    coordinates: {
      latitude: 12.9304642,
      longitude: 77.5750152
    }
  },
  {
    name: 'Whitefield',
    coordinates: {
      latitude: 12.9645675,
      longitude: 77.7365327
    }
  }
];

const updateNeighborhoodCoordinates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    for (const neighborhood of neighborhoods) {
      const result = await NeighborhoodModel.findOneAndUpdate(
        { name: neighborhood.name },
        { 
          $set: { 
            name: neighborhood.name,
            coordinates: neighborhood.coordinates,
            description: `${neighborhood.name} is a vibrant neighborhood in Bangalore.`
          } 
        },
        { 
          new: true,
          upsert: true // This will create the document if it doesn't exist
        }
      );

      if (result) {
        console.log(`Updated/Created coordinates for ${neighborhood.name}`);
      }
    }

    console.log('All neighborhoods updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating neighborhoods:', error);
    process.exit(1);
  }
};

updateNeighborhoodCoordinates(); 