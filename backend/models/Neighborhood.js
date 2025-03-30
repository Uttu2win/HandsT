import mongoose from "mongoose";

const neighborhoodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  { timestamps: true }
);

const NeighborhoodModel = mongoose.model("neighborhoods", neighborhoodSchema);
export default NeighborhoodModel;