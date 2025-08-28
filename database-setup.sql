-- Database Setup Script for File Upload Backend
-- Run this script in your MySQL database

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS file_upload_db;
USE file_upload_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create uploads table
CREATE TABLE IF NOT EXISTS uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    fileUrl TEXT NOT NULL,
    fileType ENUM('image', 'video') NOT NULL,
    fileSize BIGINT,
    cloudinaryPublicId VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_uploads_userId ON uploads(userId);
CREATE INDEX idx_uploads_createdAt ON uploads(createdAt);

-- Insert a test admin user (password: admin123)
-- Note: In production, use the registration endpoint instead
-- INSERT INTO users (username, email, password, role) VALUES 
-- ('admin', 'admin@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8O', 'admin');
