# Dairy Farm Management System

A modern web application for managing dairy farm operations, built with Next.js and deployed on Vercel.

## Tech Stack

- **Framework**: Next.js (JavaScript)
- **Styling**: TailwindCSS
- **Font**: Kanit
- **Database**: MongoDB with Mongoose
- **Deployment**: Vercel
- **PWA**: Progressive Web App enabled

## Getting Started

### Prerequisites

- Node.js (version 20.9.0 or higher recommended)
- MongoDB instance (local or cloud)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env.local` file with:
   ```
   MONGODB_URI=mongodb://localhost:27017/dairy-farm
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.js
│   └── page.js
└── lib/
    └── mongodb.js
public/
├── manifest.json
└── [PWA icons]
```

## Features

- ✅ Next.js App Router
- ✅ TailwindCSS styling
- ✅ Kanit font integration
- ✅ MongoDB database connection
- ✅ PWA capabilities
- ✅ Vercel deployment ready

## Deployment

This project is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set your environment variables in Vercel dashboard
4. Deploy automatically

## PWA Features

The application includes Progressive Web App features:
- Installable on mobile devices
- Offline capabilities (when service worker is implemented)
- App-like experience

## Environment Variables

- `MONGODB_URI` - MongoDB connection string

## License

ISC