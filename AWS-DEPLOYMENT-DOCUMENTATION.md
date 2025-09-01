# 🚀 NewsAreUs Backend - AWS Deployment Documentation

---

## 📋 Project Overview

**Framework:** NestJS v11 (TypeScript)  
**Database:** MySQL (AWS RDS)  
**Server:** AWS EC2 (Amazon Linux 2023)  
**Domain:** `api.newsareus.com`  
**SSL:** Let's Encrypt Certificate  
**Status:** ✅ **LIVE & PRODUCTION READY**

---

## 🛠️ Technical Stack

**Backend:** NestJS v11  
**Language:** TypeScript  
**Database:** MySQL 8.0  
**ORM:** TypeORM  
**Authentication:** JWT + Passport.js  
**File Upload:** Multer + Cloudinary  
**Validation:** class-validator  
**Documentation:** Swagger UI  
**SSL:** Let's Encrypt (Certbot)

---

## 🌐 Live URLs

### Production URLs:
**API Base URL:** `https://api.newsareus.com:3000`  
**Swagger Documentation:** `https://api.newsareus.com:3000/api`  
**Health Check:** `https://api.newsareus.com:3000`

### Direct IP URLs:
**API Base URL:** `https://54.90.147.163:3000`  
**Swagger Documentation:** `https://54.90.147.163:3000/api`

---

## 📡 API Endpoints

### Authentication Endpoints:
- **POST** `/auth/register` - User registration
- **POST** `/auth/login` - User login

### File Upload Endpoints:
- **POST** `/upload` - Upload file
- **GET** `/upload/my-uploads` - Get user uploads
- **DELETE** `/upload/:id` - Delete upload

### Health Check:
- **GET** `/` - Application health check

---

## 🏗️ AWS Infrastructure

### 1. EC2 Instance
**Instance Type:** t2.micro  
**OS:** Amazon Linux 2023  
**Public IP:** `54.90.147.163`  
**Security Group:** Port 22 (SSH), Port 3000 (HTTP), Port 80 (SSL)  
**Status:** ✅ Running

### 2. RDS Database
**Engine:** MySQL 8.0  
**Instance:** db.t3.micro  
**Endpoint:** `newsareus-backend-db.c8366w8sccxa.us-east-1.rds.amazonaws.com`  
**Database:** `file_upload_db`  
**Status:** ✅ Available

### 3. Route 53 DNS
**Domain:** `newsareus.com`  
**Subdomain:** `api.newsareus.com`  
**A Record:** `54.90.147.163`  
**Status:** ✅ Active

### 4. SSL Certificate
**Provider:** Let's Encrypt  
**Domain:** `api.newsareus.com`  
**Expiry:** November 28, 2025  
**Auto-renewal:** ✅ Enabled

---

## 📝 Deployment Steps Completed

### Phase 1: AWS Setup
1. ✅ **IAM User Created** - Access keys generated
2. ✅ **AWS CLI Configured** - Local setup complete
3. ✅ **RDS Database Created** - MySQL instance running
4. ✅ **EC2 Instance Launched** - Amazon Linux 2023
5. ✅ **Security Groups Configured** - Ports 22, 3000, 80 open

### Phase 2: Backend Deployment
6. ✅ **SSH Access Established** - Key pair configured
7. ✅ **Node.js Installed** - Version 20.19.4
8. ✅ **Project Cloned** - GitHub repository
9. ✅ **Dependencies Installed** - npm packages
10. ✅ **Environment Configured** - .env file setup
11. ✅ **Database Migrations** - Tables created
12. ✅ **Application Built** - TypeScript compiled

### Phase 3: Domain & SSL Setup
13. ✅ **Route 53 Hosted Zone** - Domain configured
14. ✅ **DNS Records Created** - A record pointing to EC2
15. ✅ **SSL Certificate Generated** - Let's Encrypt via Certbot
16. ✅ **HTTPS Configuration** - NestJS SSL setup
17. ✅ **Certificate Files Copied** - Local SSL directory
18. ✅ **HTTPS Backend Started** - SSL enabled

### Phase 4: Testing & Verification
19. ✅ **HTTP Access Tested** - Port 3000 working
20. ✅ **HTTPS Access Tested** - SSL working
21. ✅ **Domain Access Tested** - DNS propagation
22. ✅ **API Endpoints Tested** - All routes working
23. ✅ **Swagger Documentation** - API docs accessible

---

## 🔐 Security Configuration

### Database Security:
**Encryption:** At rest and in transit  
**Access:** EC2 security group only  
**Credentials:** Environment variables

### Application Security:
**HTTPS:** SSL/TLS encryption  
**CORS:** Configured for production  
**Validation:** Input sanitization  
**Authentication:** JWT tokens

### Server Security:
**Firewall:** AWS Security Groups  
**SSH:** Key-based authentication  
**Updates:** Automatic security patches

---

## 📊 Environment Variables

```
# Database Configuration
DB_HOST=newsareus-backend-db.c8366w8sccxa.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_USERNAME=admin
DB_PASSWORD=NewsareusBackend2025!
DB_DATABASE=file_upload_db

# JWT Configuration
JWT_SECRET=gOdFvYbGcmqwT4SLbtPXvFzWuf/ULOUDFAvEnto4Qhs=
JWT_EXPIRES_IN=24h

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dxsysd1rf
CLOUDINARY_API_KEY=438415246322471
CLOUDINARY_API_SECRET=kMRTLXY4mMeChsrSpwBBD0jcf70

# App Configuration
PORT=3000
```

---

## 🛠️ Maintenance Commands

### Backend Management:
```bash
# SSH to EC2
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163

# Check backend status
ps aux | grep node

# View logs
tail -f app.log

# Restart backend
pkill -f "node dist/main"
npm run start:prod

# Background process
nohup npm run start:prod > app.log 2>&1 &
```

### SSL Certificate Renewal:
```bash
# Check certificate expiry
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Restart backend after renewal
pkill -f "node dist/main"
npm run start:prod
```

### Database Management:
```bash
# Connect to database
mysql -h newsareus-backend-db.c8366w8sccxa.us-east-1.rds.amazonaws.com -u admin -p

# Check database status
SHOW DATABASES;
USE file_upload_db;
SHOW TABLES;
```

---

## 📈 Monitoring & Health Checks

### Application Health:
**URL:** `https://api.newsareus.com:3000`  
**Expected Response:** `"Hello World!"`

### Database Health:
**RDS Console:** Check "Available" status  
**Connection:** Test via EC2 instance

### SSL Certificate:
**Expiry:** November 28, 2025  
**Auto-renewal:** Enabled via Certbot

---

## 🚨 Troubleshooting

### Backend Not Accessible:
1. Check EC2 instance status
2. Verify security group rules
3. Check backend process: `ps aux | grep node`
4. View logs: `tail -f app.log`

### Database Connection Issues:
1. Check RDS instance status
2. Verify security group rules
3. Test connection from EC2
4. Check environment variables

### SSL Certificate Issues:
1. Check certificate expiry
2. Verify domain DNS settings
3. Renew certificate if needed
4. Restart backend after renewal

---

## 📞 Support Information

### AWS Resources:
**EC2 Instance ID:** `i-xxxxxxxxx`  
**RDS Instance ID:** `db-xxxxxxxxx`  
**Region:** us-east-1 (N. Virginia)

### Domain Information:
**Domain:** `newsareus.com`  
**Subdomain:** `api.newsareus.com`  
**DNS Provider:** AWS Route 53

### SSL Certificate:
**Provider:** Let's Encrypt  
**Domain:** `api.newsareus.com`  
**Expiry:** November 28, 2025

---

## ✅ Deployment Summary

**🎉 SUCCESS! Your NewsAreUs backend is now live and production-ready!**

### Key Achievements:
- ✅ **Full AWS deployment** completed
- ✅ **HTTPS enabled** with SSL certificate
- ✅ **Domain configured** and working
- ✅ **Database connected** and operational
- ✅ **All APIs functional** and tested
- ✅ **Documentation available** via Swagger
- ✅ **Security configured** for production
- ✅ **Monitoring setup** for maintenance

### Production URLs:
**API Base:** `https://api.newsareus.com:3000`  
**Documentation:** `https://api.newsareus.com:3000/api`

**Your backend is now ready for production use! 🚀**

---

## 📋 Quick Reference

### Essential Commands:
```bash
# SSH to server
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163

# Check backend status
ps aux | grep node

# View logs
tail -f app.log

# Restart backend
pkill -f "node dist/main" && npm run start:prod

# Background process
nohup npm run start:prod > app.log 2>&1 &
```

### Test URLs:
```bash
# Health check
curl -k https://api.newsareus.com:3000

# Swagger docs
curl -k https://api.newsareus.com:3000/api
```

### Emergency Contacts:
**AWS Support:** Available via AWS Console  
**Documentation:** Swagger UI at `/api` endpoint  
**Logs:** Available in `app.log` on EC2

---

**📅 Last Updated:** August 30, 2025  
**🔄 Status:** Production Ready  
**🔒 Security:** HTTPS Enabled  
**📊 Monitoring:** Active
