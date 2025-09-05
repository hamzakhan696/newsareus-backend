#!/bin/bash

# NewsAreUs Backend - Auto Deployment Script
set -e  # Exit on any error

echo "🚀 Starting NewsAreUs Backend Deployment..."

# Step 1: Push to GitHub
echo "📤 Pushing changes to GitHub..."
git add .
git commit -m "Auto deploy: $(date)"
git push origin main

# Step 2: Deploy to AWS
echo "☁️ Deploying to AWS..."
ssh -i newsareus-backend-key.pem ec2-user@54.90.147.163 "cd /home/ec2-user/newsareus-backend && git config pull.rebase false && git pull origin main && npm install && npm run build && pkill -f 'node dist/main' && HOST=0.0.0.0 nohup npm run start:prod > app.log 2>&1 &"

# Step 3: Wait and test
echo "⏳ Waiting for deployment..."
sleep 5

# Step 4: Test API
echo "🧪 Testing API..."
curl -k https://api.newsareus.com:3000

echo "✅ Deployment Complete!"
echo "🌐 API: https://api.newsareus.com:3000"
echo "📚 Docs: https://api.newsareus.com:3000/api"
