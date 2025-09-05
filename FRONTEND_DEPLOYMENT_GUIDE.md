# NewsAreUs Frontend - Deployment Guide

## 🎯 **Goal:**
- **Frontend**: `newsareus.com` (Port 80/443)
- **Backend**: `api.newsareus.com:3000` (Port 3000)
- **Nginx**: Reverse proxy + SSL

## 📋 **Prerequisites:**
- React project ready locally
- AWS EC2 access
- Domain configured in Route 53

## 🚀 **Step 1: Prepare React Project**

### **1.1 Build React App Locally**
```bash
# Navigate to your React project
cd /path/to/your/react/project

# Install dependencies
npm install

# Build for production
npm run build
```

### **1.2 Check Build Output**
```bash
# Verify build folder is created
ls -la build/
# Should contain: index.html, static/, etc.
```

## 🔧 **Step 2: Setup Nginx on EC2**

### **2.1 Install Nginx**
```bash
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "sudo yum update -y && sudo yum install nginx -y"
```

### **2.2 Create Nginx Configuration**
```bash
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "sudo tee /etc/nginx/conf.d/newsareus.com.conf << 'EOF'
server {
    listen 80;
    server_name newsareus.com www.newsareus.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name newsareus.com www.newsareus.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.newsareus.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.newsareus.com/privkey.pem;
    
    # Frontend (React build files)
    root /var/www/newsareus.com;
    index index.html;
    
    # Serve React app
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy to backend
    location /api/ {
        proxy_pass https://api.newsareus.com:3000/;
        proxy_ssl_verify off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF"
```

### **2.3 Create Frontend Directory**
```bash
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "sudo mkdir -p /var/www/newsareus.com && sudo chown ec2-user:ec2-user /var/www/newsareus.com"
```

### **2.4 Start Nginx**
```bash
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "sudo systemctl start nginx && sudo systemctl enable nginx"
```

## 📤 **Step 3: Deploy React Build**

### **3.1 Upload Build Files**
```bash
# From your local machine, upload build folder
scp -i newsareus-backend-key.pem -r build/* ec2-user@54.90.147.163:/var/www/newsareus.com/
```

### **3.2 Set Proper Permissions**
```bash
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "sudo chown -R nginx:nginx /var/www/newsareus.com && sudo chmod -R 755 /var/www/newsareus.com"
```

## 🌐 **Step 4: Configure Domain**

### **4.1 Update Route 53 DNS**
```bash
# In AWS Route 53, add/update A records:
# newsareus.com -> 54.90.147.163
# www.newsareus.com -> 54.90.147.163
```

### **4.2 Update Security Group**
```bash
# In AWS EC2 Security Group, add rules:
# Port 80 (HTTP) - 0.0.0.0/0
# Port 443 (HTTPS) - 0.0.0.0/0
```

## 🔧 **Step 5: SSL Certificate for Frontend**

### **5.1 Generate SSL Certificate for Main Domain**
```bash
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "sudo certbot --nginx -d newsareus.com -d www.newsareus.com"
```

### **5.2 Update Nginx Config (if needed)**
```bash
# Certbot will automatically update nginx config
# Verify the configuration
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "sudo nginx -t"
```

## 🚀 **Step 6: Test Deployment**

### **6.1 Test Frontend**
```bash
# Test HTTP (should redirect to HTTPS)
curl -I http://newsareus.com

# Test HTTPS
curl -I https://newsareus.com
```

### **6.2 Test API Integration**
```bash
# Test API calls from frontend
curl -k https://newsareus.com/api/
```

## 📝 **Complete Deployment Script**

### **One-Command Deployment (After React Build)**
```bash
# 1. Build React app locally
npm run build

# 2. Upload to EC2
scp -i newsareus-backend-key.pem -r build/* ec2-user@54.90.147.163:/var/www/newsareus.com/

# 3. Set permissions and restart nginx
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "sudo chown -R nginx:nginx /var/www/newsareus.com && sudo chmod -R 755 /var/www/newsareus.com && sudo systemctl restart nginx"
```

## 🔄 **Update Frontend (Future Deployments)**

### **Quick Update Process**
```bash
# 1. Build new version
npm run build

# 2. Upload to EC2
scp -i newsareus-backend-key.pem -r build/* ec2-user@54.90.147.163:/var/www/newsareus.com/

# 3. Restart nginx
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "sudo systemctl restart nginx"
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Nginx Not Starting**
```bash
# Check nginx status
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "sudo systemctl status nginx"

# Check nginx config
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "sudo nginx -t"

# View nginx logs
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "sudo tail -f /var/log/nginx/error.log"
```

#### **2. SSL Certificate Issues**
```bash
# Check certificate status
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "sudo certbot certificates"

# Renew certificate
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "sudo certbot renew"
```

#### **3. Permission Issues**
```bash
# Fix permissions
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "sudo chown -R nginx:nginx /var/www/newsareus.com && sudo chmod -R 755 /var/www/newsareus.com"
```

## 📊 **Final URLs**

- **Frontend**: https://newsareus.com
- **Backend API**: https://api.newsareus.com:3000
- **API Documentation**: https://api.newsareus.com:3000/api

## 🎯 **Quick Commands Reference**

```bash
# Deploy frontend
npm run build && scp -i newsareus-backend-key.pem -r build/* ec2-user@54.90.147.163:/var/www/newsareus.com/ && ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "sudo systemctl restart nginx"

# Check nginx status
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "sudo systemctl status nginx"

# View nginx logs
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "sudo tail -f /var/log/nginx/error.log"
```

---

**Note**: Make sure your React app is configured to use the correct API base URL: `https://api.newsareus.com:3000`


