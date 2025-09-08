import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  private firebaseApp: admin.app.App;

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      // Check if Firebase environment variables are set
      const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
      const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
      const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');

      if (!projectId || !privateKey || !clientEmail) {
        this.logger.warn('Firebase environment variables not set. FCM notifications will be disabled.');
        this.logger.warn('Please set the following environment variables:');
        this.logger.warn('- FIREBASE_PROJECT_ID');
        this.logger.warn('- FIREBASE_PRIVATE_KEY');
        this.logger.warn('- FIREBASE_CLIENT_EMAIL');
        this.logger.warn('- FIREBASE_PRIVATE_KEY_ID');
        this.logger.warn('- FIREBASE_CLIENT_ID');
        this.logger.warn('- FIREBASE_CLIENT_X509_CERT_URL');
        return; // Don't throw error, just disable FCM
      }

      // Initialize Firebase Admin SDK
      const serviceAccount = {
        type: 'service_account',
        project_id: projectId,
        private_key_id: this.configService.get<string>('FIREBASE_PRIVATE_KEY_ID'),
        private_key: privateKey.replace(/\\n/g, '\n'),
        client_email: clientEmail,
        client_id: this.configService.get<string>('FIREBASE_CLIENT_ID'),
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: this.configService.get<string>('FIREBASE_CLIENT_X509_CERT_URL'),
      };

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        projectId: projectId,
      });

      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK:', error);
      this.logger.warn('FCM notifications will be disabled. Please check your Firebase configuration.');
      // Don't throw error, just disable FCM
    }
  }

  /**
   * Send notification to a single device
   */
  async sendToDevice(token: string, payload: NotificationPayload): Promise<boolean> {
    try {
      if (!this.firebaseApp) {
        this.logger.warn('Firebase not initialized, skipping notification');
        return false;
      }

      if (!token) {
        this.logger.warn('FCM token is empty, skipping notification');
        return false;
      }

      const message = {
        token,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        android: {
          priority: 'high' as const,
          notification: {
            sound: 'default',
            priority: 'high' as const,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Notification sent successfully: ${response}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send notification to token ${token}:`, error);
      
      // Handle invalid token errors
      if (error.code === 'messaging/invalid-registration-token' || 
          error.code === 'messaging/registration-token-not-registered') {
        this.logger.warn(`Invalid or unregistered token: ${token}`);
        return false;
      }
      
      return false;
    }
  }

  /**
   * Send notification to multiple devices
   */
  async sendToMultipleDevices(tokens: string[], payload: NotificationPayload): Promise<{ successCount: number; failureCount: number }> {
    if (!this.firebaseApp) {
      this.logger.warn('Firebase not initialized, skipping notifications');
      return { successCount: 0, failureCount: tokens?.length || 0 };
    }

    if (!tokens || tokens.length === 0) {
      return { successCount: 0, failureCount: 0 };
    }

    try {
      const validTokens = tokens.filter(token => token && token.trim() !== '');
      let successCount = 0;
      let failureCount = 0;

      // Send notifications individually for better error handling
      for (const token of validTokens) {
        try {
          const message = {
            token,
            notification: {
              title: payload.title,
              body: payload.body,
            },
            data: payload.data || {},
            android: {
              priority: 'high' as const,
              notification: {
                sound: 'default',
                priority: 'high' as const,
              },
            },
            apns: {
              payload: {
                aps: {
                  sound: 'default',
                  badge: 1,
                },
              },
            },
          };

          await admin.messaging().send(message);
          successCount++;
        } catch (error) {
          failureCount++;
          this.logger.warn(`Failed to send notification to token ${token}:`, error);
        }
      }
      
      this.logger.log(`Multicast notification sent: ${successCount} successful, ${failureCount} failed`);
      
      return {
        successCount,
        failureCount,
      };
    } catch (error) {
      this.logger.error('Failed to send multicast notification:', error);
      return { successCount: 0, failureCount: tokens.length };
    }
  }

  /**
   * Send notification to a topic
   */
  async sendToTopic(topic: string, payload: NotificationPayload): Promise<boolean> {
    try {
      if (!this.firebaseApp) {
        this.logger.warn('Firebase not initialized, skipping topic notification');
        return false;
      }
      const message = {
        topic,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        android: {
          priority: 'high' as const,
          notification: {
            sound: 'default',
            priority: 'high' as const,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Topic notification sent successfully: ${response}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send notification to topic ${topic}:`, error);
      return false;
    }
  }

  /**
   * Subscribe tokens to a topic
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<boolean> {
    try {
      if (!this.firebaseApp) {
        this.logger.warn('Firebase not initialized, skipping topic subscription');
        return false;
      }
      const response = await admin.messaging().subscribeToTopic(tokens, topic);
      this.logger.log(`Successfully subscribed ${response.successCount} tokens to topic ${topic}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic ${topic}:`, error);
      return false;
    }
  }

  /**
   * Unsubscribe tokens from a topic
   */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<boolean> {
    try {
      if (!this.firebaseApp) {
        this.logger.warn('Firebase not initialized, skipping topic unsubscription');
        return false;
      }
      const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
      this.logger.log(`Successfully unsubscribed ${response.successCount} tokens from topic ${topic}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from topic ${topic}:`, error);
      return false;
    }
  }
}
