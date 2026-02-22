#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# WedBliss Backend — EC2 Initial Setup Script
# Run this on a fresh EC2 instance (Amazon Linux 2023 or Ubuntu 22.04)
# ─────────────────────────────────────────────────────────────────────────────

set -e

echo "🚀 WedBliss Backend Setup Starting..."

# ── 1. Install Node.js 20 ──────────────────────────────────────────────────
echo "📦 Installing Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash - 2>/dev/null || \
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - 2>/dev/null
sudo yum install -y nodejs 2>/dev/null || sudo apt-get install -y nodejs 2>/dev/null

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# ── 2. Install PM2 globally ────────────────────────────────────────────────
echo "📦 Installing PM2..."
sudo npm install -g pm2

# ── 3. Install Nginx ───────────────────────────────────────────────────────
echo "📦 Installing Nginx..."
sudo yum install -y nginx 2>/dev/null || sudo apt-get install -y nginx 2>/dev/null

# ── 4. Clone repository ────────────────────────────────────────────────────
echo "📥 Cloning WedBliss repository..."
cd ~
if [ -d "wedbliss" ]; then
    echo "Repository already exists, pulling latest..."
    cd wedbliss && git pull origin main
else
    git clone https://github.com/YOUR_USERNAME/wedbliss.git
    cd wedbliss
fi

# ── 5. Install backend dependencies ────────────────────────────────────────
echo "📦 Installing backend dependencies..."
cd backend
npm install --production

# ── 6. Create environment file ─────────────────────────────────────────────
if [ ! -f .env ]; then
    echo "📝 Creating .env file (you'll need to fill in values)..."
    cat > .env << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GMAIL_USER=your_gmail
GMAIL_APP_PASSWORD=your_app_password
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
CLOUDFRONT_DISTRIBUTION_ID=your_cf_dist_id
PORT=4000
EOF
    echo "⚠️  Don't forget to edit ~/wedbliss/backend/.env with real values!"
fi

# ── 7. Update server.js to use local .env ───────────────────────────────────
# Backend on EC2 uses its own .env, not ../.env.local

# ── 8. Start with PM2 ──────────────────────────────────────────────────────
echo "🚀 Starting backend with PM2..."
pm2 delete wedbliss-api 2>/dev/null || true
pm2 start server.js --name wedbliss-api
pm2 save
pm2 startup

# ── 9. Configure Nginx reverse proxy ───────────────────────────────────────
echo "🔧 Configuring Nginx..."
sudo tee /etc/nginx/conf.d/wedbliss-api.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name api.wedbliss.co;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo ""
echo "✅ WedBliss Backend Setup Complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Edit ~/wedbliss/backend/.env with real credentials"
echo "  2. pm2 restart wedbliss-api"
echo "  3. Point api.wedbliss.co DNS to this EC2 IP"
echo "  4. Install SSL: sudo certbot --nginx -d api.wedbliss.co"
echo ""
echo "Health check: curl http://localhost:4000/health"
