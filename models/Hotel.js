
import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 4.5
  },
  images: [{
    type: String // URLs to images
  }],
  amenities: [{
    type: String
  }]
}, {
  timestamps: true
});

const Hotel = mongoose.model('Hotel', hotelSchema);
export default Hotel;
