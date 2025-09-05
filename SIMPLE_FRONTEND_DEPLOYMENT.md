# Simple Frontend Deployment - No Nginx, No SSL

## 🎯 **Goal:**
- **Frontend**: `newsareus.com:80` (HTTP)
- **Backend**: `api.newsareus.com:3000` (HTTPS)
- **Simple Node.js serve**

## 🚀 **Step 1: Build React App Locally**

```bash
# Navigate to your React project
cd /path/to/your/react/project

# Install dependencies
npm install

# Build for production
npm run build
```

## 📤 **Step 2: Upload to EC2**

```bash
# Create frontend directory on EC2
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "mkdir -p /home/ec2-user/frontend"

# Upload build files
scp -i newsareus-backend-key.pem -r build/* ec2-user@54.90.147.163:/home/ec2-user/frontend/
```

## 🔧 **Step 3: Install Serve Package**

```bash
# Install serve globally on EC2
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "npm install -g serve"
```

## 🚀 **Step 4: Start Frontend Server**

```bash
# Start React app on port 80
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "cd /home/ec2-user/frontend && sudo serve -s . -l 80"
```

## 🌐 **Step 5: Update Security Group**

```bash
# In AWS EC2 Security Group, add rule:
# Port 80 (HTTP) - 0.0.0.0/0
```

## 🔄 **Step 6: Update DNS (if needed)**

```bash
# In Route 53, ensure A record exists:
# newsareus.com -> 54.90.147.163
```

## 📝 **Complete One-Command Deployment**

```bash
# Build and deploy in one go
npm run build && scp -i newsareus-backend-key.pem -r build/* ec2-user@54.90.147.163:/home/ec2-user/frontend/ && ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "cd /home/ec2-user/frontend && sudo serve -s . -l 80"
```

## 🔄 **Update Frontend (Future Deployments)**

```bash
# Quick update process
npm run build && scp -i newsareus-backend-key.pem -r build/* ec2-user@54.90.147.163:/home/ec2-user/frontend/ && ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "pkill -f serve && cd /home/ec2-user/frontend && sudo serve -s . -l 80"
```

## 🚨 **Troubleshooting**

### **Port 80 Permission Issue**
```bash
# If port 80 requires sudo
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "sudo serve -s /home/ec2-user/frontend -l 80"
```

### **Check if Frontend is Running**
```bash
# Check processes
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "ps aux | grep serve"

# Test locally on EC2
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "curl http://localhost"
```

### **Kill Existing Process**
```bash
# Kill existing serve process
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "pkill -f serve"
```

## 📊 **Final URLs**

- **Frontend**: http://newsareus.com
- **Backend API**: https://api.newsareus.com:3000
- **API Documentation**: https://api.newsareus.com:3000/api

## 🎯 **Quick Commands Reference**

```bash
# Deploy frontend
npm run build && scp -i newsareus-backend-key.pem -r build/* ec2-user@54.90.147.163:/home/ec2-user/frontend/ && ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "sudo serve -s /home/ec2-user/frontend -l 80"

# Check status
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "ps aux | grep serve"

# Kill and restart
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "pkill -f serve && cd /home/ec2-user/frontend && sudo serve -s . -l 80"
```

---

**Note**: Make sure your React app is configured to use the correct API base URL: `https://api.newsareus.com:3000`


