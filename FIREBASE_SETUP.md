# Firebase Cloud Messaging (FCM) Setup Guide

This guide will help you set up Firebase Cloud Messaging for push notifications in your application.

## 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Cloud Messaging in the Firebase console

## 2. Service Account Setup

1. In Firebase Console, go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file containing your service account credentials

## 3. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Firebase Configuration for FCM
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_firebase_private_key_here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_CLIENT_ID=your_firebase_client_id
FIREBASE_CLIENT_X509_CERT_URL=your_firebase_client_x509_cert_url
```

## 4. Database Migration

Run the migration to add FCM token columns to your database:

```bash
npm run typeorm:migration:run
```

## 5. Features Implemented

### FCM Token Management
- ✅ FCM token field added to User and Company entities
- ✅ FCM token included in login/signup request bodies
- ✅ FCM tokens stored and updated on every login

### Notification Triggers
- ✅ **New Bid Notifications**: Users receive notifications when companies place bids on their media
- ✅ **Bid Status Change Notifications**: Companies receive notifications when their bids are accepted or declined
- ✅ **New Media Notifications**: All companies receive notifications when new media is uploaded

### API Endpoints Updated
- `POST /auth/register` - Now accepts `fcmToken` field
- `POST /auth/login` - Now accepts `fcmToken` field
- `POST /companies/register` - Now accepts `fcmToken` field
- `POST /companies/login` - Now accepts `fcmToken` field

## 6. Notification Types

### New Bid Notification
- **Recipient**: User who uploaded the media
- **Trigger**: When a company places a bid
- **Content**: Company name, bid amount, and media title

### Bid Status Change Notification
- **Recipient**: Company that placed the bid
- **Trigger**: When user accepts or declines a bid
- **Content**: Bid amount, media title, and new status

### New Media Notification
- **Recipient**: All active companies
- **Trigger**: When new media is uploaded
- **Content**: Media type, title, and availability for bidding

## 7. Testing

To test the FCM implementation:

1. Set up your Firebase project and add the environment variables
2. Register/login with a valid FCM token
3. Upload media as a user
4. Place bids as a company
5. Accept/decline bids as a user

## 8. Troubleshooting

### Common Issues

1. **Firebase initialization fails**: Check your environment variables and service account credentials
2. **Notifications not received**: Verify FCM tokens are valid and not expired
3. **Invalid token errors**: FCM tokens can become invalid; the system handles this gracefully

### Logs

Check the application logs for FCM-related errors:
- Firebase initialization status
- Notification sending success/failure
- Invalid token handling

## 9. Security Notes

- Keep your Firebase service account credentials secure
- Never commit the actual private key to version control
- Use environment variables for all sensitive configuration
- Regularly rotate your service account keys

## 10. Production Considerations

- Set up proper error monitoring for FCM failures
- Implement retry logic for failed notifications
- Monitor FCM token validity and cleanup expired tokens
- Consider implementing notification preferences for users
