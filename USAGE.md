# Blog Usage Guide

## Local Dev

```bash
# install deps (first time)
npm install

# run dev server (requires hugo installed locally)
npm run dev
# site at http://localhost:1313

# or use docker
docker build -t blog . && docker run -p 8080:80 blog
# site at http://localhost:8080
```

## Writing Posts

```bash
# create new post (if hugo installed)
hugo new posts/my-post-title.md

# or manually create content/posts/my-post-title.md:
```

```yaml
---
title: "My Post Title"
date: 2026-01-22
draft: true      # set false to publish
tags: ["go", "web"]
description: "Brief description for previews/SEO"
---

Your markdown content here...
```

## Publishing

```bash
# build production site
npm run build

# generate search index
npm run build:search

# output in public/ directory
```

## Deploy

### First time setup

1. edit `docker-compose.yml`:
   - change `ghcr.io/YOUR_USERNAME/blog` to your github username
   - change `blog.example.com` to your domain

2. add github secrets (Settings > Secrets > Actions):
   - `SERVER_HOST` - server IP or domain
   - `SERVER_USER` - ssh username
   - `SERVER_SSH_KEY` - private key for ssh

3. on server:
   ```bash
   mkdir -p /opt/blog
   cd /opt/blog
   # copy docker-compose.yml here
   # ensure traefik network exists: docker network create traefik
   ```

### Deploying

push to main branch - github actions handles the rest

```bash
git add .
git commit -m "new post"
git push
```

## Config

### Site settings - `hugo.toml`

```toml
baseURL = "https://yourdomain.com/"
title = "Your Blog Name"

[params]
  description = "your tagline"
  author = "Your Name"
```

### Menu - `hugo.toml`

```toml
[[menus.main]]
  name = "Link Name"
  url = "/path/"
  weight = 4  # order
```

### Syntax highlighting style

change `style = "dracula"` in hugo.toml to any [chroma style](https://xyproto.github.io/splash/docs/)

## Features

- **dark mode**: auto-detects system pref, toggle in header, persists choice
- **search**: click icon or `Cmd/Ctrl+K`, powered by pagefind
- **rss**: available at `/index.xml`
- **view transitions**: automatic smooth page transitions

## File Locations

| what | where |
|------|-------|
| posts | `content/posts/*.md` |
| pages | `content/*.md` |
| css | `assets/css/main.css` |
| templates | `layouts/` |
| images | `static/` (reference as `/image.png`) |
