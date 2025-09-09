# Firebase Configuration Guide

## Quick Fix for Current Error

The Firebase initialization error occurs because the environment variables are not set. The application will now run without FCM notifications if Firebase is not configured.

## To Enable FCM Notifications

### 1. Create/Update your `.env` file

Add these Firebase environment variables to your `.env` file:

```env
# Firebase Configuration for FCM (Optional - FCM will be disabled if not set)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_firebase_private_key_here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_CLIENT_ID=your_firebase_client_id
FIREBASE_CLIENT_X509_CERT_URL=your_firebase_client_x509_cert_url
```

### 2. Get Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Extract the values from the JSON and add them to your `.env` file

### 3. Example JSON to Environment Variables Mapping

If your Firebase service account JSON looks like this:
```json
{
  "type": "service_account",
  "project_id": "my-project-123",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xyz@my-project-123.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs/firebase-adminsdk-xyz%40my-project-123.iam.gserviceaccount.com"
}
```

Your `.env` file should have:
```env
FIREBASE_PROJECT_ID=my-project-123
FIREBASE_PRIVATE_KEY_ID=abc123...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@my-project-123.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789012345678901
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs/firebase-adminsdk-xyz%40my-project-123.iam.gserviceaccount.com
```

## Current Status

✅ **Application will start successfully** - FCM is now optional
✅ **All other features work** - Authentication, bidding, uploads, etc.
⚠️ **FCM notifications disabled** - Until Firebase is configured
✅ **Graceful degradation** - No errors if Firebase is not set up

## Testing Without Firebase

You can test all the application features without Firebase:
- User registration/login
- Company registration/login
- Media uploads
- Bidding system
- Admin panel

FCM tokens will be stored in the database but notifications won't be sent until Firebase is configured.

## After Setting Up Firebase

1. Restart your application
2. You should see: `Firebase Admin SDK initialized successfully`
3. FCM notifications will start working automatically
4. Test by uploading media and placing bids
