# NewsAreUs Backend - Deployment Guide

## 🚀 Quick Deployment Procedure

### Prerequisites
- AWS CLI configured
- SSH access to EC2 instance
- Git repository access

### Step 1: Local Changes
```bash
# Make your changes locally
# Test your changes
npm run build
npm run start:dev
```

### Step 2: Commit & Push
```bash
# Add all changes
git add .

# Commit with descriptive message
git commit -m "Add new feature: [describe your changes]"

# Push to main branch
git push origin main
```

### Step 3: Deploy to AWS
```bash
# SSH to AWS server and deploy
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "cd /home/ec2-user/newsareus-backend && git pull origin main && npm install && npm run build && pkill -f 'node dist/main' && nohup npm run start:prod > app.log 2>&1 &"
```

### Step 4: Verify Deployment
```bash
# Test health endpoint
curl -k https://api.newsareus.com:3000

# Test new endpoints
curl -k https://api.newsareus.com:3000/api
```

## 📋 Detailed Deployment Steps

### 1. Local Development
```bash
# Start development server
npm run start:dev

# Build for production
npm run build

# Test production build locally
npm run start:prod
```

### 2. Code Quality Checks
```bash
# Run linting
npm run lint

# Run tests
npm run test

# Run e2e tests
npm run test:e2e
```

### 3. Git Workflow
```bash
# Check status
git status

# Add changes
git add .

# Commit with message
git commit -m "feat: add new bidding system"
# or
git commit -m "fix: resolve upload validation issue"
# or
git commit -m "docs: update API documentation"

# Push to repository
git push origin main
```

### 4. AWS Deployment
```bash
# Method 1: Single command deployment
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "cd /home/ec2-user/newsareus-backend && git pull origin main && npm install && npm run build && pkill -f 'node dist/main' && nohup npm run start:prod > app.log 2>&1 &"

# Method 2: Step by step
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163
cd /home/ec2-user/newsareus-backend
git pull origin main
npm install
npm run build
pkill -f 'node dist/main'
nohup npm run start:prod > app.log 2>&1 &
exit
```

### 5. Verification
```bash
# Check if application is running
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "ps aux | grep node"

# Check application logs
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "tail -f /home/ec2-user/newsareus-backend/app.log"

# Test endpoints
curl -k https://api.newsareus.com:3000
curl -k https://api.newsareus.com:3000/api
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill existing process
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "pkill -f 'node dist/main'"
# Wait 2 seconds
sleep 2
# Start new process
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "cd /home/ec2-user/newsareus-backend && nohup npm run start:prod > app.log 2>&1 &"
```

#### 2. SSL Certificate Issues
```bash
# Check certificate status
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "sudo certbot certificates"

# Renew certificate if needed
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "sudo certbot renew"
```

#### 3. Build Errors
```bash
# Check for TypeScript errors
npm run build

# Check for missing dependencies
npm install

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Database Connection Issues
```bash
# Check database status
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "mysql -h newsareus-backend-db.c8366w8sccxa.us-east-1.rds.amazonaws.com -u admin -p"
```

## 📊 Monitoring

### Check Application Status
```bash
# Check if app is running
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "ps aux | grep node"

# Check memory usage
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "free -h"

# Check disk space
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "df -h"
```

### View Logs
```bash
# View recent logs
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "tail -20 /home/ec2-user/newsareus-backend/app.log"

# Follow logs in real-time
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "tail -f /home/ec2-user/newsareus-backend/app.log"
```

## 🌐 Live URLs

- **API Base**: https://api.newsareus.com:3000
- **Swagger Documentation**: https://api.newsareus.com:3000/api
- **Health Check**: https://api.newsareus.com:3000

## 📝 Quick Commands Reference

```bash
# Quick deployment (one command)
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "cd /home/ec2-user/newsareus-backend && git pull origin main && npm install && npm run build && pkill -f 'node dist/main' && nohup npm run start:prod > app.log 2>&1 &"

# Check status
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "ps aux | grep node"

# View logs
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "tail -f /home/ec2-user/newsareus-backend/app.log"

# Test API
curl -k https://api.newsareus.com:3000
```

## 🚨 Emergency Procedures

### Restart Application
```bash
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "pkill -f 'node dist/main' && cd /home/ec2-user/newsareus-backend && nohup npm run start:prod > app.log 2>&1 &"
```

### Rollback to Previous Version
```bash
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "cd /home/ec2-user/newsareus-backend && git log --oneline -5"
# Note the commit hash you want to rollback to
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "cd /home/ec2-user/newsareus-backend && git reset --hard [COMMIT_HASH] && npm run build && pkill -f 'node dist/main' && nohup npm run start:prod > app.log 2>&1 &"
```

---

**Note**: Always test your changes locally before deploying to production!
