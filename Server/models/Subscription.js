import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  endpoint: {
    type: String,
    required: true,
    unique: true
  },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true }
  },
  cityName: {
    type: String,
    default: 'London'
  },
  latitude: {
    type: Number,
    default: 51.5074
  },
  longitude: {
    type: Number,
    default: -0.1278
  },
  notificationTime: {
    type: String, // HH:mm format, e.g. "08:00"
    default: '08:00'
  },
  lastNotifiedDate: {
    type: String, // YYYY-MM-DD to avoid duplicate daily sends
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Subscription', SubscriptionSchema);
