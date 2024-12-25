import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number,
    required: true
  },
  category: { 
    type: String, 
    enum: ['paid', 'free'],
    required: true 
  },
  image: {
    data: Buffer,
    contentType: String
  },
  imageUrl: { 
    type: String,
    validate: {
      validator: function(v) {
        // Either imageUrl or image should be present, but not both
        return !(this.image && this.image.data && v);
      },
      message: 'Cannot have both image upload and image URL'
    }
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users', 
    required: true 
  },
  neighborhoodId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'neighborhoods', 
    required: true 
  }
}, { 
  timestamps: true 
});

// Virtual field to display price based on category
listingSchema.virtual('displayPrice').get(function() {
  return this.category === 'free' ? 'Free' : `$${this.price}`;
});

const ListingModel = mongoose.model('listings', listingSchema);
export default ListingModel;