# Focus Flow - Wellness Companion

## Project info

A wellness companion app with gamified challenges, progress tracking, and AI wellness coach support.

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

You can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Docker Deployment (Recommended for Production)

This application is containerized and ready to deploy using Docker. See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for comprehensive deployment instructions.

**Quick Start:**
```bash
# 1. Create .env file with your Supabase credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here

# 2. Build and run with Docker Compose
docker-compose up -d

# Application will be available at http://localhost
```

**Why Docker?**
- ✅ Consistent environment across all platforms
- ✅ Easy to deploy anywhere (VPS, cloud, Kubernetes)
- ✅ Isolated from your system
- ✅ Simple scaling and version management
- ✅ Production-ready with nginx

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions, deployment options, and production considerations.
