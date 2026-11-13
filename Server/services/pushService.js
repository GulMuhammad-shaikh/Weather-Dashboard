import webpush from 'web-push';
import Subscription from '../models/Subscription.js';

// Default VAPID keys for zero-config fallback if env variables omitted on Vercel
const DEFAULT_VAPID_PUBLIC = 'BHqN9CRJ1UlbAn-ZhyCVONrR7T-oFWP_sbL7Fl0IfdVEmoq3cPsiQKj-OiDaq8f4UwAcFXTTbKJ-PHsa1pIiqa8';
const DEFAULT_VAPID_PRIVATE = 'Pnx1fVmKcWgEkyx5fRGr5FzOww46Lir2TVa7veqC-C8';

const publicVapidKey = process.env.VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || DEFAULT_VAPID_PRIVATE;
const mailto = process.env.VAPID_MAILTO || 'mailto:admin@weatherpulse.local';

try {
  webpush.setVapidDetails(mailto, publicVapidKey, privateVapidKey);
} catch (e) {
  console.warn('⚠️ Could not set VAPID details:', e.message);
}

export function getPublicVapidKey() {
  return publicVapidKey;
}

// Send push notification helper
export async function sendPush(subscriptionDoc, payload) {
  const pushSubscription = {
    endpoint: subscriptionDoc.endpoint,
    keys: {
      p256dh: subscriptionDoc.keys.p256dh,
      auth: subscriptionDoc.keys.auth
    }
  };

  const payloadString = JSON.stringify(payload);

  try {
    await webpush.sendNotification(pushSubscription, payloadString);
    return { success: true };
  } catch (err) {
    console.error('Error sending push notification:', err.statusCode, err.message);
    // If subscription is expired or unsubscribed (410 Gone or 404 Not Found), purge it
    if (err.statusCode === 410 || err.statusCode === 404) {
      console.log('Purging expired subscription:', subscriptionDoc.endpoint);
      try {
        await Subscription.deleteOne({ endpoint: subscriptionDoc.endpoint });
      } catch {}
    }
    return { success: false, error: err.message, statusCode: err.statusCode };
  }
}

// Send weather update notification
export async function sendDailyWeatherNotification(subscriptionDoc, weatherData) {
  const current = weatherData.current;
  const locationName = subscriptionDoc.cityName || weatherData.location?.name || 'Your City';

  const payload = {
    title: `🌤️ Morning Weather for ${locationName}`,
    body: `Today: ${current.weatherText}, ${current.temperature}°C (Feels ${current.apparentTemperature}°C). Wind: ${current.windSpeed} km/h. Rain chance: ${current.precipitation > 0 ? 'High' : 'Low'}.`,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: {
      url: `/?city=${encodeURIComponent(locationName)}`
    }
  };

  return await sendPush(subscriptionDoc, payload);
}

// Send immediate test alert to verify notification pipeline
export async function sendTestWeatherNotification(subscription, cityName = 'Your City') {
  const payload = {
    title: `🌤️ WeatherPulse Test Alert`,
    body: `Push alerts are working correctly for ${cityName}! You will receive daily morning weather summaries here.`,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: '/' }
  };

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth
    }
  };

  return await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
}
