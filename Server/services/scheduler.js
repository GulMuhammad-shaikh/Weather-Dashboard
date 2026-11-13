import cron from 'node-cron';
import Subscription from '../models/Subscription.js';
import { fetchWeatherData } from './weatherService.js';
import { sendDailyWeatherNotification } from './pushService.js';

export function initScheduler() {
  console.log('⏰ WeatherPulse Push Notification Scheduler initialized (runs every minute).');

  // Runs every minute to check if any user has scheduled morning notifications
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Pad single digits
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${hours}:${minutes}`;

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      // Find subscriptions due right now
      const dueSubscriptions = await Subscription.find({
        notificationTime: currentTimeStr,
        lastNotifiedDate: { $ne: todayStr }
      });

      if (dueSubscriptions.length === 0) return;

      console.log(`🚀 Dispatching ${dueSubscriptions.length} scheduled morning notifications for ${currentTimeStr}`);

      for (const sub of dueSubscriptions) {
        try {
          const weather = await fetchWeatherData(sub.latitude, sub.longitude, sub.cityName);
          await sendDailyWeatherNotification(sub, weather);
          sub.lastNotifiedDate = todayStr;
          await sub.save();
        } catch (subErr) {
          console.error(`Failed to dispatch notification to ${sub.cityName}:`, subErr.message);
        }
      }
    } catch (err) {
      console.error('Error in notification cron loop:', err.message);
    }
  });
}
