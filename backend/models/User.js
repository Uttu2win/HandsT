import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    neighborhoodId: { type: mongoose.Schema.Types.ObjectId, ref: 'neighborhoods' },
    profilePic: {
      data: Buffer,
      contentType: String
    },
    profilePicUrl: { 
      type: String, 
      default: 'https://www.pngarts.com/files/10/Default-Profile-Picture-PNG-Free-Download.png' 
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("users", userSchema);
export default UserModel;