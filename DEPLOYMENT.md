# Deployment Guide

This guide explains how to deploy the Ignite Wellbeing UI application using Docker.

## Prerequisites

- Docker installed on your system ([Install Docker](https://docs.docker.com/get-docker/))
- Docker Compose (usually included with Docker Desktop)
- Your Supabase credentials (URL and publishable key)

## Quick Start with Docker Compose

This is the easiest way to deploy the application.

### 1. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

### 2. Build and Run

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at `http://localhost`.

## Manual Docker Build

If you prefer to build and run the Docker image manually:

### 1. Build the Image

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here \
  -t ignite-wellbeing-ui:latest .
```

### 2. Run the Container

```bash
docker run -d \
  -p 80:80 \
  --name ignite-wellbeing-ui \
  --restart unless-stopped \
  ignite-wellbeing-ui:latest
```

## Deployment Options

### Option 1: Docker on a VPS/Cloud Server

**Recommended for:**
- Full control over the deployment
- Cost-effective for small to medium traffic
- Custom domain requirements

**Steps:**
1. Set up a VPS (DigitalOcean, AWS EC2, Linode, etc.)
2. Install Docker and Docker Compose
3. Clone your repository
4. Set up environment variables
5. Run `docker-compose up -d`

**Advantages:**
- Full control
- Can handle custom domains easily
- Cost-effective
- Can scale with Docker Swarm or Kubernetes later

### Option 2: Docker Hub / Container Registry

**Recommended for:**
- CI/CD pipelines
- Multiple deployment environments
- Team collaboration

**Steps:**
1. Build and push to a registry:
   ```bash
   docker build -t yourusername/ignite-wellbeing-ui:latest .
   docker push yourusername/ignite-wellbeing-ui:latest
   ```
2. Pull and run on any server:
   ```bash
   docker pull yourusername/ignite-wellbeing-ui:latest
   docker run -d -p 80:80 yourusername/ignite-wellbeing-ui:latest
   ```

### Option 3: Platform-as-a-Service (PaaS)

**Recommended for:**
- Zero infrastructure management
- Automatic scaling
- Built-in CI/CD

**Popular options:**
- **Vercel**: Best for Vite/React apps, automatic deployments
- **Netlify**: Similar to Vercel, great for static sites
- **Railway**: Simple Docker deployments
- **Fly.io**: Global edge deployment
- **Render**: Easy Docker deployments

#### Vercel Deployment (Recommended for this app)

Since this is a Vite + React app, Vercel is an excellent choice:

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Deploy automatically on every push

**Note:** Vercel doesn't require Docker - it builds your app directly. But if you want Docker, use Railway or Render.

#### Railway Deployment

1. Connect your GitHub repository
2. Railway will detect the Dockerfile automatically
3. Add environment variables in the Railway dashboard
4. Deploy!

#### Render Deployment

1. Create a new Web Service
2. Connect your repository
3. Set build command: `docker build -t ignite-wellbeing-ui .`
4. Set start command: `docker run -p 80:80 ignite-wellbeing-ui`
5. Add environment variables
6. Deploy!

### Option 4: Kubernetes

**Recommended for:**
- Production at scale
- High availability requirements
- Multiple services

Create a Kubernetes deployment with the Docker image.

## Environment Variables

The application requires these environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anonymous/public key

These are baked into the build at build time (not runtime), so they must be provided during the Docker build process.

## Custom Domain Setup

1. Point your domain's A record to your server's IP address
2. Update the `nginx.conf` file to set the `server_name` directive
3. Rebuild the Docker image
4. (Optional) Set up SSL/TLS with Let's Encrypt using Certbot in a separate container

## Production Considerations

### 1. SSL/TLS (HTTPS)

For production, you should use HTTPS. You can:

- Use a reverse proxy (Traefik, Caddy, Nginx with Certbot)
- Use a platform that provides SSL (Vercel, Netlify, Railway)
- Use Cloudflare in front of your server

### 2. Monitoring

Add monitoring to track application health:
- Docker health checks are already configured
- Consider adding application monitoring (Sentry, LogRocket, etc.)

### 3. Scaling

To scale horizontally:
- Use Docker Swarm
- Use Kubernetes
- Use a load balancer (AWS ALB, Cloudflare, etc.)

### 4. Logging

View logs:
```bash
docker-compose logs -f
```

Or for manual Docker:
```bash
docker logs -f ignite-wellbeing-ui
```

## Troubleshooting

### Container won't start

Check logs:
```bash
docker-compose logs
```

### Build fails

Ensure environment variables are set correctly:
```bash
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_PUBLISHABLE_KEY
```

### Application not loading

1. Check if the container is running: `docker ps`
2. Check nginx logs: `docker exec ignite-wellbeing-ui nginx -t`
3. Verify port 80 is not already in use

### Environment variables not working

Remember: Vite environment variables are embedded at **build time**, not runtime. You must rebuild the Docker image if you change them.

## Why Docker?

Docker makes deployment easier because:

1. **Consistency**: Same environment everywhere (dev, staging, production)
2. **Portability**: Run on any platform that supports Docker
3. **Isolation**: App runs in its own container, won't conflict with other apps
4. **Easy scaling**: Can run multiple containers behind a load balancer
5. **Version control**: Tag different versions of your app
6. **Rollback**: Easy to revert to previous versions

## Next Steps

1. Set up your environment variables
2. Choose a deployment platform
3. Build and deploy!
4. Set up monitoring and logging
5. Configure a custom domain (optional)

For questions or issues, check the application logs or Docker documentation.

