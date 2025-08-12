// Notification service for user updates
export interface NotificationData {
  userId: string;
  complaintId: string;
  status: string;
  message: string;
  timestamp: Date;
}

export class NotificationService {
  private notifications: NotificationData[] = [];

  // Send text notification (SMS simulation)
  async sendTextNotification(userId: string, complaintId: string, status: string, message: string): Promise<void> {
    const notification: NotificationData = {
      userId,
      complaintId,
      status,
      message,
      timestamp: new Date()
    };

    this.notifications.push(notification);
    
    // In production, integrate with SMS service like Twilio
    console.log(`SMS to user ${userId}: ${message}`);
    
    // Show browser notification for demo
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('KuralAI Update', {
        body: message,
        icon: '/favicon.ico'
      });
    }
  }

  // Send voice notification (TTS simulation)
  async sendVoiceNotification(userId: string, message: string, language: string = 'english'): Promise<void> {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      
      // Set language for TTS
      const languageMap: { [key: string]: string } = {
        'tamil': 'ta-IN',
        'hindi': 'hi-IN',
        'english': 'en-US'
      };
      
      utterance.lang = languageMap[language] || 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      window.speechSynthesis.speak(utterance);
    }
    
    console.log(`Voice notification to user ${userId}: ${message}`);
  }

  // Get notifications for a user
  getUserNotifications(userId: string): NotificationData[] {
    return this.notifications.filter(n => n.userId === userId);
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
}

export const notificationService = new NotificationService();