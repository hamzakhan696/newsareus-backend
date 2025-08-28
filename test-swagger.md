# Testing Swagger Documentation

## Prerequisites
1. Make sure your application is running: `npm run start:dev`
2. Ensure your database is configured and running
3. Configure your `.env` file with proper credentials

## Accessing Swagger UI

1. Open your browser and navigate to: **http://localhost:3000/api**
2. You should see the Swagger UI interface with your API documentation

## Testing Authentication Endpoints

### 1. Register a New User
1. In Swagger UI, find the `POST /auth/register` endpoint
2. Click "Try it out"
3. Enter the following JSON in the request body:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```
4. Click "Execute"
5. You should receive a success response with a JWT token

### 2. Login User
1. Find the `POST /auth/login` endpoint
2. Click "Try it out"
3. Enter the following JSON in the request body:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
4. Click "Execute"
5. Copy the JWT token from the response

## Testing File Upload Endpoints

### 1. Authorize with JWT
1. Click the "Authorize" button at the top of the Swagger UI
2. Enter your JWT token in the format: `Bearer <your_jwt_token>`
3. Click "Authorize"
4. Close the authorization dialog

### 2. Upload a File
1. Find the `POST /upload` endpoint
2. Click "Try it out"
3. Click "Choose File" and select an image (JPG, PNG) or video (MP4, MOV, AVI)
4. Click "Execute"
5. You should receive a success response with file details

### 3. Get User Uploads
1. Find the `GET /upload/my-uploads` endpoint
2. Click "Try it out"
3. Click "Execute"
4. You should see a list of your uploaded files

### 4. Delete an Upload
1. Find the `DELETE /upload/{id}` endpoint
2. Click "Try it out"
3. Enter the upload ID you want to delete
4. Click "Execute"
5. You should receive a success response

## Features to Test

### File Validation
- Try uploading files larger than 100MB (should fail)
- Try uploading unsupported file types (should fail)
- Try uploading valid files (should succeed)

### Authentication
- Try accessing protected endpoints without JWT (should fail)
- Try accessing protected endpoints with invalid JWT (should fail)
- Try accessing protected endpoints with valid JWT (should succeed)

### Error Handling
- Try registering with existing email/username (should fail)
- Try logging in with wrong credentials (should fail)
- Try deleting non-existent upload (should fail)

## Expected Behavior

### Successful Responses
All endpoints should return responses in this format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Responses
Error responses should include:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Error details"
}
```

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure MySQL is running and credentials are correct
2. **Cloudinary Configuration**: Ensure Cloudinary credentials are set in `.env`
3. **JWT Token**: Make sure to include "Bearer " prefix when authorizing
4. **File Upload**: Ensure file size is under 100MB and type is supported

### Logs
Check the console output for any error messages or connection issues.
