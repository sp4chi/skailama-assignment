# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier)
- GitHub account
- Vercel account (free tier)

## Local Development Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd skaiLama
```

### 2. Install dependencies

```bash
npm install
npm run install-all
```

### 3. Set up environment variables

Create `server/.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/mern-app
NODE_ENV=development
PORT=3000
```

### 4. Start MongoDB locally (optional)

```bash
mongod --dbpath ~/data/db
```

Or use MongoDB Atlas connection string in `.env`

### 5. Run the application

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Production Deployment (Vercel)

### 1. Set up MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Create a free cluster (M0 Sandbox)
3. Create database user with username and password
4. Add IP address `0.0.0.0/0` to Network Access
5. Get connection string from "Connect" → "Connect your application"
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/mern-app
   ```

### 2. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 3. Deploy to Vercel

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Configure project:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: (leave default)

### 4. Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |

Apply to: Production, Preview, Development (all environments)

### 5. Deploy

Click "Deploy" - Vercel will automatically build and deploy your application.

Your live URL: `https://your-project.vercel.app`

## Vercel Configuration

The project includes `vercel.json` which configures:

- Backend: Serverless functions from `server/server.js`
- Frontend: Static build from `client/dist`
- API routes: All `/api/*` requests routed to backend
- Static files: All other requests serve React app

## Environment Variables Explained

- `MONGODB_URI`: MongoDB connection string (Atlas for production, local for dev)
- `NODE_ENV`: Environment mode (development/production)
- `PORT`: Server port (auto-assigned by Vercel in production)

## Testing the Deployment

After deployment, test these endpoints:

1. Health check: `https://your-app.vercel.app/api/health`
2. Get profiles: `https://your-app.vercel.app/api/profiles`
3. Get events: `https://your-app.vercel.app/api/events`

## Troubleshooting

### Build fails on Vercel

- Check if `npm run build` works locally
- Verify all dependencies are in `package.json`
- Check Vercel build logs for specific errors

### MongoDB connection fails

- Verify connection string is correct
- Check if IP `0.0.0.0/0` is whitelisted in MongoDB Atlas
- Ensure database user credentials are correct

### API routes return 404

- Verify `vercel.json` configuration
- Check that routes match `/api/*` pattern
- Review Vercel function logs

### Frontend shows but API fails

- Check environment variables are set in Vercel
- Verify MongoDB Atlas is accessible
- Check Vercel function logs for errors

## Redeployment

Vercel automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update"
git push
```

## Local Testing of Production Build

```bash
npm run build
cd client
npm run preview
```

Then test API separately:

```bash
cd server
node server.js
```
