# Event Management System `https://skailama-assignment-app.vercel.app/`

A full-stack Event Management System with multi-timezone support, built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- Multi-Profile Management - Create and manage user profiles
- Multi-Timezone Support - Automatic timezone conversion for events
- Event Management - CRUD operations with multi-user assignment
- Update History Tracking - Change logs with before/after values

## Tech Stack

- **Frontend**: React + Vite, vanilla CSS
- **Backend**: Express.js, Node.js
- **Database**: MongoDB
- **Libraries**: dayjs, axios
- **Deployment**: Vercel

## Quick Start

### Local Development

1. **Install dependencies**:

   ```bash
   npm install
   npm run install-all
   ```

2. **Set up environment**:
   Create `server/.env`:

   ```env
   MONGODB_URI=mongodb://localhost:27017/mern-app
   NODE_ENV=development
   ```

3. **Start MongoDB** (if using local):

   ```bash
   mongod --dbpath ~/data/db &
   ```

4. **Run development servers**:

   ```bash
   npm run dev
   ```

   - React app: `http://localhost:5173`
   - Express API: `http://localhost:3000`

## Available Scripts

| Script                | Description                             |
| --------------------- | --------------------------------------- |
| `npm run dev`         | Run both client and server concurrently |
| `npm run client`      | Run React dev server only               |
| `npm run server`      | Run Express server only                 |
| `npm run build`       | Build React for production              |
| `npm run install-all` | Install all dependencies                |

## Deploy to Vercel

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions.

**Quick Deploy**:

1. Push to GitHub
2. Import project in Vercel
3. Add `MONGODB_URI` environment variable (MongoDB Atlas)
4. Deploy!

## API Endpoints

### Profiles

- `GET /api/profiles` - Get all profiles
- `GET /api/profiles/:id` - Get single profile
- `POST /api/profiles` - Create new profile
- `PUT /api/profiles/:id` - Update profile

### Events

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Example Event Request

```json
{
  "title": "Team Meeting",
  "description": "Weekly sync",
  "profiles": ["profileId1", "profileId2"],
  "timezone": "America/New_York",
  "startDateTime": "2024-01-15T14:00:00.000Z",
  "endDateTime": "2024-01-15T15:00:00.000Z"
}
```

## Project Structure

```
skailama/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
├── server/                    # Express backend
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API routes
│   ├── controllers/          # Route handlers
│   ├── server.js
│   └── package.json
├── vercel.json
└── README.md
```

## Environment Variables

### Development (server/.env)

```env
MONGODB_URI=mongodb://localhost:27017/mern-app
NODE_ENV=development
```

### Production (Vercel)

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mern-app
NODE_ENV=production
```

## Troubleshooting

### Port Already in Use

```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### MongoDB Connection Issues

- Ensure MongoDB is running: `ps aux | grep mongod`
- Check connection string in `.env`
- For Atlas: whitelist IP `0.0.0.0/0`

### Build Errors

- Clear node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm run install-all`

## License

MIT

---

Made with ❤️ using MERN stack
