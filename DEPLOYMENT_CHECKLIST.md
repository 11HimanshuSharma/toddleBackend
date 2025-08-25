<!-- @format -->

# Netlify Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Database Setup

- [ ] Set up a cloud PostgreSQL database (Supabase, ElephantSQL, Neon, etc.)
- [ ] Run database migrations on your cloud database
- [ ] Test database connection with cloud credentials

### 2. Environment Configuration

- [ ] Update `.env.production` with cloud database credentials
- [ ] Generate a strong JWT secret for production
- [ ] Set NODE_ENV to "production"
- [ ] Configure FRONTEND_URL with your frontend domain

### 3. Code Preparation

- [ ] Test your API locally with production-like settings
- [ ] Ensure all routes work correctly
- [ ] Verify error handling is working
- [ ] Check that all dependencies are in package.json

### 4. Git Repository

- [ ] Push all changes to your Git repository
- [ ] Ensure `.env` file is in `.gitignore` (never commit secrets!)
- [ ] Verify `netlify.toml` is configured correctly
- [ ] Confirm `netlify/functions/api.js` is set up

## 🚀 Deployment Steps

### Option A: Git Integration (Recommended)

1. **Connect Repository to Netlify**

   - Go to https://app.netlify.com/
   - Click "New site from Git"
   - Connect your GitHub/GitLab/Bitbucket account
   - Select your repository

2. **Configure Build Settings**

   - Build command: `npm run build`
   - Publish directory: `public`
   - Functions directory: `netlify/functions`

3. **Set Environment Variables in Netlify**

   ```
   DB_HOST=your-cloud-db-host
   DB_PORT=5432
   DB_USER=your-cloud-db-user
   DB_PASSWORD=your-cloud-db-password
   DB_NAME=your-cloud-db-name
   JWT_SECRET=your-super-secure-jwt-secret
   NODE_ENV=production
   LOG_LEVEL=info
   DB_SSL=true
   FRONTEND_URL=https://your-frontend-domain.netlify.app
   ```

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete

### Option B: Manual Deployment

1. **Prepare for Upload**

   ```bash
   npm run build
   ```

2. **Manual Upload**
   - Drag and drop your project folder to Netlify
   - Set environment variables in Site Settings
   - Deploy

## 🧪 Post-Deployment Testing

### 1. Health Check

Test: `https://your-site-name.netlify.app/api/health`

### 2. API Endpoints

- Auth: `https://your-site-name.netlify.app/api/auth/`
- Users: `https://your-site-name.netlify.app/api/users/`
- Posts: `https://your-site-name.netlify.app/api/posts/`
- Comments: `https://your-site-name.netlify.app/api/comments/`
- Likes: `https://your-site-name.netlify.app/api/likes/`

### 3. Test with Frontend

- Update frontend API base URL to your Netlify domain
- Test user registration, login, and core features
- Verify CORS is working correctly

## 🔧 Common Issues & Solutions

### Database Connection Issues

- Ensure SSL is enabled for cloud databases
- Check firewall settings on database provider
- Verify connection strings are correct

### Function Timeout

- Netlify free tier has 10-second timeout
- Optimize database queries
- Consider upgrading to Pro plan if needed

### CORS Issues

- Set FRONTEND_URL correctly in environment variables
- Check CORS configuration in api.js

### Build Failures

- Check build logs in Netlify dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

## 📊 Monitoring & Logs

1. **Netlify Dashboard**

   - Monitor function invocations
   - Check error logs
   - Review analytics

2. **Database Monitoring**
   - Monitor connection pool usage
   - Check query performance
   - Review database logs

## 🔄 Updates & Maintenance

1. **Code Updates**

   - Push changes to Git repository
   - Netlify will auto-deploy (if Git integration is set up)

2. **Environment Variables**

   - Update in Netlify Site Settings
   - Redeploy if needed

3. **Database Migrations**
   - Run migrations on production database
   - Test thoroughly before deploying code changes

## 🎯 Your Hosted API URL

Once deployed, your API will be available at:
**`https://your-site-name.netlify.app/api/`**

Replace `your-site-name` with the actual name Netlify assigns to your site.
