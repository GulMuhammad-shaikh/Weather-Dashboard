import { useState, useEffect } from 'react';
import { getVapidPublicKey, subscribeToPush, sendTestPushNotification } from '../services/api';
import { urlBase64ToUint8Array } from '../utils/helpers';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificationTime, setNotificationTime] = useState(() => localStorage.getItem('weatherpulse_push_time') || localStorage.getItem('weatherboard_push_time') || '08:00');
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, []);

  async function checkExistingSubscription() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(Boolean(sub));
    } catch (e) {
      console.warn('Could not check push subscription:', e);
    }
  }

  const subscribeUser = async (currentLocation, time = notificationTime) => {
    if (!isSupported) {
      setStatusMessage({ type: 'error', text: 'Push notifications are not supported in this browser.' });
      return false;
    }

    try {
      setLoading(true);
      setStatusMessage(null);

      // Request permission
      const permResult = await Notification.requestPermission();
      setPermission(permResult);

      if (permResult !== 'granted') {
        setStatusMessage({ type: 'error', text: 'Notification permission was denied.' });
        return false;
      }

      // Fetch VAPID Public Key from server
      const vapidPublicKey = await getVapidPublicKey();
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      const reg = await navigator.serviceWorker.ready;
      let subscription = await reg.pushManager.getSubscription();

      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
      }

      // Send subscription to backend
      const cityName = currentLocation?.name || 'London';
      const lat = currentLocation?.latitude || 51.5074;
      const lon = currentLocation?.longitude || -0.1278;

      await subscribeToPush(subscription, cityName, lat, lon, time);

      setIsSubscribed(true);
      setNotificationTime(time);
      localStorage.setItem('weatherpulse_push_time', time);
      setStatusMessage({ type: 'success', text: `Morning weather alerts scheduled for ${time} daily!` });
      return true;
    } catch (err) {
      console.error('Subscription failed:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to activate push notifications.' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const triggerTestAlert = async (currentLocation) => {
    try {
      setLoading(true);
      setStatusMessage(null);

      const reg = await navigator.serviceWorker.ready;
      let subscription = await reg.pushManager.getSubscription();

      if (!subscription) {
        // Attempt to subscribe first
        const success = await subscribeUser(currentLocation);
        if (!success) return;
        subscription = await reg.pushManager.getSubscription();
      }

      if (subscription) {
        const cityName = currentLocation?.name || 'Your City';
        await sendTestPushNotification(subscription, cityName);
        setStatusMessage({ type: 'success', text: '⚡ Test notification dispatched! Check your screen or notification center.' });
      }
    } catch (err) {
      console.error('Test notification failed:', err);
      setStatusMessage({ type: 'error', text: 'Failed to send test alert: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    notificationTime,
    setNotificationTime,
    statusMessage,
    setStatusMessage,
    subscribeUser,
    triggerTestAlert
  };
}
