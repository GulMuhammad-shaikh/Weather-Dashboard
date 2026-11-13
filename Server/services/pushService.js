import webpush from 'web-push';
import Subscription from '../models/Subscription.js';

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const mailto = process.env.VAPID_MAILTO || 'mailto:admin@weatherpulse.local';

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(mailto, publicVapidKey, privateVapidKey);
} else {
  console.warn('⚠️ VAPID keys are missing. Push notifications will not send.');
}

export function getPublicVapidKey() {
  return process.env.VAPID_PUBLIC_KEY;
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
      await Subscription.deleteOne({ endpoint: subscriptionDoc.endpoint });
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
    body: `${current.weatherText} • ${current.temperature}°C (Feels like ${current.apparentTemperature}°C). High ${weatherData.daily[0]?.maxTemp}°C / Low ${weatherData.daily[0]?.minTemp}°C. Have a wonderful day!`,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: {
      url: '/',
      cityName: locationName,
      timestamp: Date.now()
    }
  };

  return sendPush(subscriptionDoc, payload);
}

// Send instant test notification
export async function sendTestWeatherNotification(subscriptionDoc) {
  const payload = {
    title: `⚡ WeatherPulse Alert: ${subscriptionDoc.cityName || 'Alert'}`,
    body: `Push notifications are active! You will receive daily morning forecasts for ${subscriptionDoc.cityName || 'your city'}.`,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: {
      url: '/',
      cityName: subscriptionDoc.cityName,
      timestamp: Date.now()
    }
  };

  return sendPush(subscriptionDoc, payload);
}
