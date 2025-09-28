# Kenya Energy Dashboard - Deployment Guide

## Overview

This guide covers deploying the Kenya Energy Dashboard to production environments, including both frontend (Vercel/Netlify) and backend (Heroku/Railway) deployments.

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+ and pip
- Git repository access
- Deployment platform accounts

## Frontend Deployment

### Option 1: Vercel Deployment

1. **Prepare the Frontend**
```bash
cd frontend
npm install
npm run build
```

2. **Deploy to Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts and select:
# - Build Command: npm run build
# - Output Directory: dist
# - Install Command: npm install
```

3. **Environment Variables**
Set in Vercel dashboard:
```
VITE_API_URL=https://your-backend-url.herokuapp.com
```

4. **Custom Domain** (Optional)
- Add custom domain in Vercel dashboard
- Configure DNS records as instructed

### Option 2: Netlify Deployment

1. **Connect Repository**
- Log in to Netlify
- Click "New site from Git"
- Connect your GitHub repository
- Select the `frontend` folder as base directory

2. **Build Settings**
```
Build command: npm run build
Publish directory: frontend/dist
```

3. **Environment Variables**
Add in Netlify dashboard:
```
VITE_API_URL=https://your-backend-url.herokuapp.com
```

## Backend Deployment

### Option 1: Heroku Deployment

1. **Prepare Backend**
```bash
cd backend
pip freeze > requirements.txt
```

2. **Create Procfile**
```bash
echo "web: uvicorn app.main:app --host 0.0.0.0 --port \$PORT" > Procfile
```

3. **Deploy to Heroku**
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-energy-api

# Add Python buildpack
heroku buildpacks:set heroku/python

# Deploy
git subtree push --prefix backend heroku main
```

4. **Configure CORS**
Update `backend/app/main.py` to include your frontend URL:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-domain.vercel.app",
        "https://your-custom-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Option 2: Railway Deployment

1. **Connect Repository**
- Sign up at Railway.app
- Connect your GitHub repository
- Select the backend directory

2. **Configuration**
Railway will auto-detect Python and install dependencies.

3. **Environment Variables**
Set in Railway dashboard if needed.

## Docker Deployment (Alternative)

### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://localhost:8000

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - CORS_ORIGINS=http://localhost:3000
```

## Environment Configuration

### Frontend Environment Variables
```bash
# .env.production
VITE_API_URL=https://your-backend-domain.com
VITE_APP_NAME="Kenya Energy Dashboard"
VITE_VERSION=1.0.0
```

### Backend Environment Variables
```bash
# .env
CORS_ORIGINS=https://your-frontend-domain.com,https://custom-domain.com
API_VERSION=1.0.0
DEBUG=False
```

## SSL/HTTPS Configuration

### Automatic SSL (Recommended)
Both Vercel and Netlify provide automatic HTTPS certificates.

### Custom SSL
If using custom domains:
1. Configure DNS to point to deployment platform
2. Platform will automatically provision SSL certificate
3. Verify HTTPS is working

## Monitoring and Analytics

### Backend Monitoring
Add health check endpoint monitoring:
```python
# Add to main.py
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }
```

### Frontend Analytics
Add Google Analytics or similar:
```javascript
// Add to index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

## Performance Optimization

### Frontend Optimization
1. **Code Splitting**: Already configured with Vite
2. **Image Optimization**: Use WebP format for images
3. **Caching**: Configure proper cache headers
4. **CDN**: Use Vercel/Netlify CDN automatically

### Backend Optimization
1. **Caching**: Implement Redis for API caching
2. **Database**: Add PostgreSQL for production data
3. **Rate Limiting**: Implement API rate limiting
4. **Compression**: Enable gzip compression

## Security Considerations

### Frontend Security
1. **Environment Variables**: Never commit sensitive data
2. **HTTPS Only**: Ensure all traffic uses HTTPS
3. **CSP Headers**: Configure Content Security Policy

### Backend Security
1. **CORS**: Properly configure allowed origins
2. **API Keys**: Implement authentication for production
3. **Rate Limiting**: Prevent API abuse
4. **Input Validation**: Validate all user inputs

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Build process verified
- [ ] Dependencies up to date

### Post-Deployment
- [ ] Health checks passing
- [ ] Frontend loading correctly
- [ ] API endpoints responding
- [ ] Real-time features working
- [ ] Mobile responsiveness verified
- [ ] SSL certificate active

### Monitoring Setup
- [ ] Uptime monitoring configured
- [ ] Error tracking implemented
- [ ] Performance monitoring active
- [ ] Log aggregation setup

## Troubleshooting

### Common Deployment Issues

**CORS Errors**
```
Access to fetch at 'API_URL' from origin 'FRONTEND_URL' has been blocked by CORS policy
```
Solution: Update CORS settings in backend to include frontend domain.

**Build Failures**
```
Module not found or Build failed
```
Solution: Check package.json dependencies and Node.js version compatibility.

**API Connection Issues**
```
Network Error or 500 Internal Server Error
```
Solution: Verify API URL and backend deployment status.

### Debugging Steps
1. Check deployment logs
2. Verify environment variables
3. Test API endpoints directly
4. Check network connectivity
5. Review error tracking tools

## Rollback Procedures

### Frontend Rollback
```bash
# Vercel
vercel --prod --force

# Netlify - use dashboard to rollback to previous deployment
```

### Backend Rollback
```bash
# Heroku
heroku rollback v$(($HEROKU_RELEASE_VERSION-1))
```

## Contact and Support

- **Documentation**: docs/
- **Issues**: GitHub Issues
- **Support**: support@energy-dashboard.com
- **Status**: status.energy-dashboard.com

---

*Last updated: January 2024*