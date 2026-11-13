import mongoose from 'mongoose';

const FavoriteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    default: ''
  },
  admin1: {
    type: String,
    default: ''
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  timezone: {
    type: String,
    default: 'auto'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Composite index to avoid duplicate favorites
FavoriteSchema.index({ name: 1, latitude: 1, longitude: 1 }, { unique: true });

export default mongoose.model('Favorite', FavoriteSchema);
