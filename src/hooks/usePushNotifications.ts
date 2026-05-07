import { useState, useEffect, useCallback } from 'react';
import { 
  NotificationSubscription, 
  PushNotificationPayload,
  Notification as AppNotification
} from '../types/notifications';

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  subscription: NotificationSubscription | null;
  permission: NotificationPermission;
  isLoading: boolean;
  error: string | null;
  subscribe: () => Promise<NotificationSubscription>;
  unsubscribe: () => Promise<void>;
  sendNotification: (payload: PushNotificationPayload) => Promise<void>;
  requestPermission: () => Promise<NotificationPermission>;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<NotificationSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 
                       'PushManager' in window && 
                       'Notification' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  // Register service worker
  useEffect(() => {
    if (!isSupported) return;

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        setServiceWorkerRegistration(registration);
        
        // Check for existing subscription
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          const sub: NotificationSubscription = {
            endpoint: existingSubscription.endpoint,
            keys: {
              p256dh: arrayBufferToBase64(existingSubscription.getKey('p256dh')!),
              auth: arrayBufferToBase64(existingSubscription.getKey('auth')!)
            }
          };
          setSubscription(sub);
          setIsSubscribed(true);
        }
      } catch (err) {
        console.error('Service worker registration failed:', err);
        setError('Failed to register service worker');
      }
    };

    registerServiceWorker();
  }, [isSupported]);

  // Convert ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Convert Base64 to ArrayBuffer
  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      return permission;
    } catch (err) {
      const errorMessage = 'Failed to request notification permission';
      setError(errorMessage);
      console.error(errorMessage, err);
      return 'denied';
    }
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<NotificationSubscription> => {
    if (!isSupported || !serviceWorkerRegistration) {
      throw new Error('Push notifications are not supported or service worker not registered');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request permission if not granted
      if (permission !== 'granted') {
        const newPermission = await requestPermission();
        if (newPermission !== 'granted') {
          throw new Error('Notification permission denied');
        }
      }

      // Subscribe to push service
      const pushSubscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '')
      });

      const subscription: NotificationSubscription = {
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(pushSubscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(pushSubscription.getKey('auth')!)
        }
      };

      setSubscription(subscription);
      setIsSubscribed(true);

      // Save subscription to server
      await saveSubscriptionToServer(subscription);

      return subscription;
    } catch (err) {
      const errorMessage = 'Failed to subscribe to push notifications';
      setError(errorMessage);
      console.error(errorMessage, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, serviceWorkerRegistration, permission, requestPermission]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<void> => {
    if (!serviceWorkerRegistration) return;

    setIsLoading(true);
    setError(null);

    try {
      const pushSubscription = await serviceWorkerRegistration.pushManager.getSubscription();
      if (pushSubscription) {
        await pushSubscription.unsubscribe();
        
        // Remove subscription from server
        if (subscription) {
          await removeSubscriptionFromServer(subscription);
        }
      }

      setSubscription(null);
      setIsSubscribed(false);
    } catch (err) {
      const errorMessage = 'Failed to unsubscribe from push notifications';
      setError(errorMessage);
      console.error(errorMessage, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [serviceWorkerRegistration, subscription]);

  // Send push notification
  const sendNotification = useCallback(async (payload: PushNotificationPayload): Promise<void> => {
    if (!isSubscribed || !subscription) {
      throw new Error('Not subscribed to push notifications');
    }

    try {
      // Send notification via server
      await fetch('/api/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          payload
        })
      });
    } catch (err) {
      const errorMessage = 'Failed to send push notification';
      setError(errorMessage);
      console.error(errorMessage, err);
      throw err;
    }
  }, [isSubscribed, subscription]);

  // Save subscription to server
  const saveSubscriptionToServer = async (sub: NotificationSubscription): Promise<void> => {
    try {
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sub)
      });
    } catch (err) {
      console.error('Failed to save subscription to server:', err);
      // Don't throw error here as subscription can still work locally
    }
  };

  // Remove subscription from server
  const removeSubscriptionFromServer = async (sub: NotificationSubscription): Promise<void> => {
    try {
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sub)
      });
    } catch (err) {
      console.error('Failed to remove subscription from server:', err);
      // Don't throw error here as subscription can still work locally
    }
  };

  // Convert URL base64 to Uint8Array (for VAPID key)
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return {
    isSupported,
    isSubscribed,
    subscription,
    permission,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    sendNotification,
    requestPermission
  };
};
