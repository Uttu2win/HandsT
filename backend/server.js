import dotenv from 'dotenv';
import express from "express";
import cors from "cors";

import connectDB from "./database/database.js";
import userRoutes from './routes/userRoutes.js';
import neighborhoodRoutes from './routes/neighborhoodRoutes.js';

import dashboardRoutes from './routes/dashboardRoutes.js';
import postRoutes from './routes/postRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();
const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));
//Middleware
app.use(express.json()); // To parse JSON requests
//Connection to Database 
connectDB();
// Test route to create a user
app.use('/api/users', userRoutes);

//To fetch neighborhoods from the database
app.use('/api/neighborhoods', neighborhoodRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, ()=>console.log(`Server started on PORT ${PORT}`))