<!-- @format -->

# Netlify Deployment Guide for Social Media Backend

## Prerequisites

1. **Database Setup**: You need a cloud PostgreSQL database (recommended
   providers):

   - **Supabase** (Free tier available): https://supabase.com/
   - **ElephantSQL** (Free tier available): https://www.elephantsql.com/
   - **Aiven** (Free tier available): https://aiven.io/
   - **Neon** (Free tier available): https://neon.tech/

2. **Netlify Account**: Sign up at https://netlify.com/

## Step-by-Step Deployment

### Step 1: Set up Cloud Database

1. Choose a PostgreSQL provider (Supabase is recommended)
2. Create a new PostgreSQL database
3. Note down the connection details:
   - Host
   - Port
   - Database name
   - Username
   - Password

### Step 2: Run Database Migration

1. Update your `.env` file with the cloud database credentials
2. Run the database setup script:
   ```bash
   npm run setup:db
   ```

### Step 3: Deploy to Netlify

#### Option A: Git Integration (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**

   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**:

   - Go to https://app.netlify.com/
   - Click "New site from Git"
   - Choose your Git provider
   - Select your repository
   - Configure build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `public`
     - **Functions directory**: `netlify/functions`

3. **Set Environment Variables**:

   - Go to Site Settings → Environment Variables
   - Add the following variables:
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

4. **Deploy**: Click "Deploy site"

#### Option B: Manual Deploy

1. **Build locally**:

   ```bash
   npm run build
   ```

2. **Drag and drop**: Drag your entire project folder to Netlify deploy area

3. **Set environment variables** as described above

### Step 4: Verify Deployment

1. Your API will be available at: `https://your-site-name.netlify.app/api/`
2. Test the health endpoint: `https://your-site-name.netlify.app/api/health`
3. Your API endpoints will be:
   - Auth: `https://your-site-name.netlify.app/api/auth/`
   - Users: `https://your-site-name.netlify.app/api/users/`
   - Posts: `https://your-site-name.netlify.app/api/posts/`
   - Comments: `https://your-site-name.netlify.app/api/comments/`
   - Likes: `https://your-site-name.netlify.app/api/likes/`

## Important Notes

1. **Environment Variables**: Never commit production credentials to your
   repository
2. **Database**: Use a cloud database provider, not localhost
3. **JWT Secret**: Use a strong, unique secret for production
4. **CORS**: Update FRONTEND_URL with your actual frontend domain
5. **SSL**: Enable SSL for database connections in production

## Troubleshooting

1. **Function timeout**: Netlify functions have a 10-second timeout on the free
   plan
2. **Database connections**: Cloud databases may require SSL connections
3. **Environment variables**: Ensure all required variables are set in Netlify
4. **Build errors**: Check the deploy logs in Netlify dashboard

## Testing Your Deployed API

Use tools like Postman or curl to test your endpoints:

```bash
# Health check
curl https://your-site-name.netlify.app/api/health

# Register a user
curl -X POST https://your-site-name.netlify.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

## Free Tier Limitations

- **Netlify**: 125,000 function calls per month, 10-second timeout
- **Database providers**: Usually offer limited storage and connections on free
  tiers

## Custom Domain (Optional)

1. In Netlify dashboard, go to Domain Settings
2. Add your custom domain
3. Configure DNS settings as instructed
4. SSL certificate will be automatically provisioned

#### Option 1: Direct GitHub Deploy (Recommended)

1. **Push to GitHub**:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

2. **Connect to Netlify**:

   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select your repository
   - Build settings should auto-detect from `netlify.toml`

3. **Set Environment Variables** in Netlify Dashboard > Site Settings >
   Environment variables:
   ```
   DB_HOST=your-database-host
   DB_PORT=5432
   DB_NAME=your-database-name
   DB_USER=your-database-user
   DB_PASSWORD=your-database-password
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-domain.com
   ```

#### Option 2: Manual Deploy with Netlify CLI

1. **Install Netlify CLI**:

   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:

   ```bash
   netlify login
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

### Database Migration

Run your database setup script on your production database:

```sql
-- Copy and run the contents of sql/schema.sql on your production database
```

### Testing Your Deployment

After deployment, test these endpoints:

- `https://your-app-name.netlify.app/api/health` - Health check
- `https://your-app-name.netlify.app/api/auth/register` - User registration
- `https://your-app-name.netlify.app/api/posts` - Posts API

### Important Notes

1. **Cold Starts**: Netlify Functions have cold starts (~500ms-2s for first
   request)
2. **Execution Time**: Functions timeout after 10 seconds on free tier
3. **Database Connections**: Use connection pooling for PostgreSQL
4. **File Uploads**: Consider using external storage (AWS S3, Cloudinary) for
   file uploads

### Alternative Deployment Options

If Netlify Functions don't meet your needs, consider:

- **Vercel**: Better for Node.js apps, similar serverless approach
- **Railway**: Full backend hosting with PostgreSQL included
- **Heroku**: Traditional hosting platform
- **DigitalOcean App Platform**: Container-based deployment

### Troubleshooting

1. **Function Timeout**: Optimize database queries and connections
2. **Environment Variables**: Ensure all required variables are set in Netlify
3. **CORS Issues**: Update CORS settings in the Netlify function
4. **Database Connection**: Test database connectivity separately

### Support

For issues with this deployment setup, check:

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Express.js Documentation](https://expressjs.com/)
- Project repository issues
