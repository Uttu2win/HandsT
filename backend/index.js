import mongoose from "mongoose";
import dotenv from "dotenv";
import PostModel from "./models/Post.js";  
import connectDB from "./database/database.js";  

dotenv.config();  // Ensure environment variables are loaded

// Connect to MongoDB
connectDB();

// Create dummy posts
const createDummyPosts = async () => {
  try {
    // Dummy post 1
    const post1 = new PostModel({
      title: "Community Event in JP Nagarrr!....",
      content: "Join us for a fun-filled community event this weekend in JP Nagara! There will be games, food, and a lot of fun activities for the whole family.",
      category: "Events",
      imageUrl: "https://woodroseclub.com/wp-content/uploads/2023/06/The-Woodrose-Party-Hall-in-JP-Nagar.jpg",
      likes: 10,
      comments: [
        {
          text: "Looking forward to it!",
          userId: new mongoose.Types.ObjectId("675a7bcb88062e2d12cc3031"),
        }
      ],
      neighborhoodId: new mongoose.Types.ObjectId("6759d0a917d1c2b24903df8e"),
    });

    // Dummy post 2
    const post2 = new PostModel({
      title: "Lost Dog in JP Nagar",
      content: "A dog has been lost in the JP Nagar neighborhood. Please contact us if you find it!",
      category: "LostAndFound",
      likes: 5,
      comments: [
        {
          text: "I saw a dog that matches the description near the park.",
          userId: new mongoose.Types.ObjectId("675a7bcb88062e2d12cc3031"),
        }
      ],
      neighborhoodId: new mongoose.Types.ObjectId("6759d0a917d1c2b24903df8e"),
    });

    // Save the posts to the database
    await post1.save();
    await post2.save();

    console.log("Dummy posts created successfully!");
  } catch (error) {
    console.error("Error creating dummy posts:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Call the function to create the posts
createDummyPosts();
