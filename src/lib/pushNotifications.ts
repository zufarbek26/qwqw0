// Push Notification utilities for PWA

export const isPushSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
};

export const getNotificationPermission = () => {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return 'denied';
  }
  
  const permission = await Notification.requestPermission();
  return permission;
};

export const showLocalNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }
  
  // Use service worker for notification if available
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        ...options,
      });
    });
  } else {
    // Fallback to regular notification
    new Notification(title, {
      icon: '/pwa-192x192.png',
      ...options,
    });
  }
};

// Schedule daily challenge reminder
export const scheduleDailyReminder = () => {
  const now = new Date();
  const reminderTime = new Date();
  
  // Set reminder for 9:00 AM
  reminderTime.setHours(9, 0, 0, 0);
  
  // If it's already past 9 AM, schedule for tomorrow
  if (now > reminderTime) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }
  
  const timeUntilReminder = reminderTime.getTime() - now.getTime();
  
  // Store the scheduled time
  localStorage.setItem('dailyReminderScheduled', reminderTime.toISOString());
  
  // Schedule the notification
  setTimeout(() => {
    showLocalNotification('Ежедневное задание ждёт! 🎯', {
      body: 'Не забудьте выполнить ежедневное задание и получить награду!',
      tag: 'daily-challenge',
      data: { url: '/daily-challenge' },
    });
    
    // Reschedule for next day
    scheduleDailyReminder();
  }, timeUntilReminder);
};

// Check and enable daily reminders
export const enableDailyReminders = async (): Promise<boolean> => {
  const permission = await requestNotificationPermission();
  
  if (permission === 'granted') {
    scheduleDailyReminder();
    localStorage.setItem('dailyRemindersEnabled', 'true');
    return true;
  }
  
  return false;
};

export const disableDailyReminders = () => {
  localStorage.removeItem('dailyRemindersEnabled');
  localStorage.removeItem('dailyReminderScheduled');
};

export const areDailyRemindersEnabled = () => {
  return localStorage.getItem('dailyRemindersEnabled') === 'true';
};
