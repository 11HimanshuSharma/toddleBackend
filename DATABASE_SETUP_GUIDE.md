<!-- @format -->

# How to Get Database Credentials for Production

## 🎯 Quick Setup Guide

### Option 1: Supabase (Recommended)

1. **Visit**: https://supabase.com/
2. **Sign up** with your email/GitHub
3. **Create new project**:
   - Project name: `social-media-backend`
   - Database password: `create a strong password`
   - Region: `choose closest to you`
4. **Wait 2 minutes** for project setup
5. **Get credentials**:
   - Go to **Settings** → **Database**
   - Copy **Connection parameters**:
     ```
     Host: db.abcdefghijklmnop.supabase.co
     Port: 5432
     Database: postgres
     Username: postgres
     Password: [your-password]
     ```

### Option 2: ElephantSQL (Free Tier)

1. **Visit**: https://www.elephantsql.com/
2. **Sign up** and verify email
3. **Create new instance**:
   - Name: `social-media-db`
   - Plan: `Tiny Turtle (Free)`
   - Region: `choose closest`
4. **Get credentials** from instance details:
   ```
   Server: silly-elephant-01.db.elephantsql.com
   User & Default database: [auto-generated]
   Password: [auto-generated]
   ```

### Option 3: Neon (Serverless PostgreSQL)

1. **Visit**: https://neon.tech/
2. **Sign up** with GitHub/Google
3. **Create project**:
   - Project name: `social-media-backend`
   - Region: `choose closest`
4. **Get connection string** from dashboard
5. **Extract credentials** from the connection string

## 🔧 How to Use These Credentials

### Step 1: Update .env.production

Replace the placeholder values in `.env.production` with your actual
credentials:

```bash
# Example with Supabase
DB_HOST=db.abcdefghijklmnop.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-actual-supabase-password
DB_NAME=postgres
```

### Step 2: Test Connection Locally

1. **Temporarily update your `.env`** file with cloud credentials
2. **Test the connection**:
   ```bash
   npm run setup:db
   ```
3. **If successful, revert `.env`** back to localhost for development

### Step 3: Set in Netlify

**Don't put production credentials in your code!** Instead:

1. **In Netlify dashboard**:
   - Go to **Site Settings** → **Environment Variables**
   - Add each variable individually:
     - `DB_HOST` = `db.abcdefghijklmnop.supabase.co`
     - `DB_PORT` = `5432`
     - `DB_USER` = `postgres`
     - `DB_PASSWORD` = `your-actual-password`
     - `DB_NAME` = `postgres`

## 🚨 Important Security Notes

1. **Never commit** real credentials to Git
2. **Keep `.env.production`** as a template only
3. **Set real values** only in Netlify dashboard
4. **Use strong passwords** for production databases

## 💡 Pro Tips

1. **Supabase** also provides a built-in admin panel
2. **ElephantSQL** free tier has 20MB storage limit
3. **Neon** has automatic scaling and branching features
4. **Always test** your database connection before deploying

## 🆘 Need Help?

If you're stuck, I can help you:

1. Set up any of these database providers
2. Configure the connection
3. Run the database migrations
4. Deploy to Netlify

Just let me know which provider you choose!
