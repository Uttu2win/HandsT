import mongoose from 'mongoose';
import NeighborhoodModel from '../models/Neighborhood.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const listNeighborhoods = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const neighborhoods = await NeighborhoodModel.find({});
    console.log('\nExisting neighborhoods:');
    neighborhoods.forEach(n => {
      console.log(`- ${n.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error listing neighborhoods:', error);
    process.exit(1);
  }
};

listNeighborhoods(); 