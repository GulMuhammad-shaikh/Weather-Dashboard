import express from 'express';
import Subscription from '../models/Subscription.js';
import { getPublicVapidKey, sendTestWeatherNotification } from '../services/pushService.js';

const router = express.Router();

// Get public VAPID key for client registration
router.get('/vapid-public-key', (req, res) => {
  const key = getPublicVapidKey();
  if (!key) {
    return res.status(500).json({ error: 'VAPID public key is not configured' });
  }
  res.json({ publicKey: key });
});

// Save or update a push subscription
router.post('/subscribe', async (req, res) => {
  try {
    const { subscription, cityName, latitude, longitude, notificationTime } = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'Valid push subscription object required' });
    }

    const { endpoint, keys } = subscription;

    const updated = await Subscription.findOneAndUpdate(
      { endpoint },
      {
        endpoint,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth
        },
        cityName: cityName || 'London',
        latitude: latitude !== undefined ? latitude : 51.5074,
        longitude: longitude !== undefined ? longitude : -0.1278,
        notificationTime: notificationTime || '08:00'
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      message: 'Subscribed to morning weather alerts successfully',
      subscriptionId: updated._id
    });
  } catch (error) {
    console.error('Subscription error:', error.message);
    res.status(500).json({ error: 'Failed to save push subscription' });
  }
});

// Send an immediate test notification to verify push works
router.post('/test', async (req, res) => {
  try {
    const { subscription, cityName } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Push subscription required' });
    }

    const subDoc = {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      cityName: cityName || 'WeatherPulse'
    };

    const result = await sendTestWeatherNotification(subDoc);

    if (result.success) {
      res.json({ success: true, message: 'Test notification sent successfully!' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Test notification error:', error.message);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

// Unsubscribe
router.post('/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint required' });
    }

    await Subscription.deleteOne({ endpoint });
    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Unsubscribe error:', error.message);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

export default router;
