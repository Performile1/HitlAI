# Quick Start: GitHub + Docker Setup

Fast setup guide to get your code on GitHub and test with Docker.

---

## ✅ Step 1: GitHub Setup (5 minutes)

### **1. Initialize Git**
```bash
cd c:\Users\A\Documents\Develop\HitlAI
git init
git add .
git commit -m "Initial commit: HitlAI platform"
```

### **2. Create GitHub Repository**
1. Go to https://github.com/new
2. Repository name: `HitlAI`
3. Private repository
4. **Don't** initialize with README
5. Click "Create repository"

### **3. Push to GitHub**
```bash
git remote add origin https://github.com/YOUR_USERNAME/HitlAI.git
git branch -M main
git push -u origin main
```

**If using 2FA**: Use Personal Access Token as password
- GitHub → Settings → Developer settings → Personal access tokens → Generate new token
- Select `repo` scope
- Use token as password

---

## ✅ Step 2: Test Docker Locally (10 minutes)

### **2.1 Test Crawl4AI Service**

```bash
# Build Crawl4AI image
docker build -f Dockerfile.crawl4ai -t hitlai-crawl4ai .

# Run service
docker run -d -p 8001:8001 \
  -e OPENAI_API_KEY=your-key \
  -e ANTHROPIC_API_KEY=your-key \
  --name crawl4ai \
  hitlai-crawl4ai

# Check health
curl http://localhost:8001/health

# View logs
docker logs crawl4ai

# Test crawl
curl -X POST http://localhost:8001/crawl \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### **2.2 Test with Docker Compose (Easier)**

```bash
# Start both services (Crawl4AI + Next.js)
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Test Crawl4AI
curl http://localhost:8001/health

# Test Next.js
curl http://localhost:3000

# Stop services
docker-compose down
```

---

## ✅ Step 3: Deploy to Railway (5 minutes)

### **3.1 Connect Railway to GitHub**
1. Go to https://railway.app
2. Sign in with GitHub
3. New Project → Deploy from GitHub repo
4. Select `HitlAI` repository
5. Railway auto-detects `Dockerfile.crawl4ai`

### **3.2 Set Environment Variables**
In Railway dashboard → Variables:
```
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
```

### **3.3 Deploy**
Railway auto-deploys. Wait ~5 minutes.

### **3.4 Get URL**
Railway → Settings → Domains → Generate Domain

Copy URL: `https://hitlai-production-xxxx.up.railway.app`

### **3.5 Test**
```bash
curl https://your-railway-url.railway.app/health
```

---

## ✅ Step 4: Deploy Next.js to Vercel (5 minutes)

### **4.1 Install Vercel CLI**
```bash
npm install -g vercel
```

### **4.2 Login**
```bash
vercel login
```

### **4.3 Deploy**
```bash
vercel --prod
```

### **4.4 Set Environment Variables**
Vercel dashboard → Your project → Settings → Environment Variables

Add:
```
CRAWL4AI_SERVICE_URL=https://your-railway-url.railway.app
```

All other variables are already in `vercel.json`.

### **4.5 Redeploy**
```bash
vercel --prod
```

---

## 🎯 Verification Checklist

- [ ] Code pushed to GitHub
- [ ] Docker builds locally (`docker build -f Dockerfile.crawl4ai .`)
- [ ] Crawl4AI service runs (`docker run` or `docker-compose up`)
- [ ] Health check passes (`curl http://localhost:8001/health`)
- [ ] Railway deployment successful
- [ ] Railway health check passes
- [ ] Vercel deployment successful
- [ ] Vercel can reach Railway service

---

## 🐛 Troubleshooting

### **Git Push Fails**
```bash
# If using 2FA, need Personal Access Token
# GitHub → Settings → Developer settings → Tokens
# Use token as password
```

### **Docker Build Fails**
```bash
# Check Docker is running
docker --version

# Clean build
docker system prune -a
docker build -f Dockerfile.crawl4ai -t hitlai-crawl4ai .
```

### **Crawl4AI Health Check Fails**
```bash
# Check logs
docker logs crawl4ai

# Common issue: Playwright not installed
# Rebuild image (it installs Playwright automatically)
```

### **Railway Deployment Fails**
- Check Railway logs in dashboard
- Verify environment variables set
- Ensure Dockerfile.crawl4ai is in repo root

### **Vercel Can't Reach Railway**
- Verify Railway URL is correct
- Check Railway service is running
- Test Railway URL directly: `curl https://your-url.railway.app/health`

---

## 📝 Commands Reference

### **Git**
```bash
git status                    # Check status
git add .                     # Stage all changes
git commit -m "message"       # Commit
git push                      # Push to GitHub
git log --oneline            # View history
```

### **Docker**
```bash
docker build -f Dockerfile.crawl4ai -t hitlai-crawl4ai .  # Build
docker run -d -p 8001:8001 --name crawl4ai hitlai-crawl4ai  # Run
docker ps                     # List running containers
docker logs crawl4ai          # View logs
docker stop crawl4ai          # Stop container
docker rm crawl4ai            # Remove container
docker system prune -a        # Clean everything
```

### **Docker Compose**
```bash
docker-compose up -d          # Start all services
docker-compose ps             # Check status
docker-compose logs -f        # View logs
docker-compose down           # Stop all services
docker-compose restart        # Restart services
```

### **Vercel**
```bash
vercel login                  # Login
vercel --prod                 # Deploy to production
vercel env ls                 # List environment variables
vercel logs                   # View logs
```

---

## 🚀 You're Done!

Your platform is now:
- ✅ Version controlled on GitHub
- ✅ Tested with Docker locally
- ✅ Crawl4AI deployed to Railway
- ✅ Next.js deployed to Vercel
- ✅ Production ready!

**Next**: Test the full flow by creating a test request.
