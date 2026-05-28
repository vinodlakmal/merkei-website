# Merkei Website — CI/CD Setup Guide

## Architecture

```
Local PC (git push)
    → GitHub (main branch)
        → GitHub Actions
            1. Build Docker image
            2. Push to Docker Hub
            3. SSH into VPS → docker compose pull + up
                → Container running on VPS (port 80)
```

---

## Step 1: GitHub Secrets Configure කරන්න

GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value |
|---|---|
| `DOCKERHUB_USERNAME` | Docker Hub username (e.g. `vinodlakmal`) |
| `DOCKERHUB_TOKEN` | Docker Hub → Account Settings → Security → New Access Token |
| `VPS_HOST` | VPS IP address or domain |
| `VPS_USER` | SSH username (e.g. `ubuntu`, `root`) |
| `VPS_SSH_KEY` | Private SSH key (see Step 2) |
| `VPS_PORT` | SSH port — default 22, optional |

---

## Step 2: VPS SSH Key Setup

**Local PC ෙ (Git Bash / WSL):**
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/merkei_deploy
```

**Public key → VPS ෙ copy කරන්න:**
```bash
ssh-copy-id -i ~/.ssh/merkei_deploy.pub user@YOUR_VPS_IP
# හෙ ෙ manually:
cat ~/.ssh/merkei_deploy.pub | ssh user@YOUR_VPS_IP "cat >> ~/.ssh/authorized_keys"
```

**Private key (`merkei_deploy`) → GitHub Secret `VPS_SSH_KEY` ෙ paste කරන්න:**
```bash
cat ~/.ssh/merkei_deploy  # output copy කරන්න
```

---

## Step 3: VPS Initial Setup

**VPS ෙ SSH කරල:**
```bash
# Docker install (if not already)
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

# Deploy directory create
mkdir -p /opt/merkei-website
cd /opt/merkei-website

# .env file create
cat > .env << EOF
DOCKERHUB_USERNAME=your_dockerhub_username
EOF

# docker-compose.yml copy / create
# (GitHub repo ෙ ඇති docker-compose.yml paste කරන්න)
```

---

## Step 4: First Manual Deploy (Test)

**VPS ෙ:**
```bash
cd /opt/merkei-website
docker compose pull
docker compose up -d
docker compose ps     # running check
docker compose logs   # logs check
```

---

## Step 5: Deploy Trigger

ෙ ෙ local ෙ push කළාම auto deploy ෙෙෙ:

```bash
git add .
git commit -m "feat: update content"
git push origin main
```

GitHub Actions tab ෙ progress බලන්න:
`https://github.com/vinodlakmal/merkei-website/actions`

---

## Useful Commands (VPS)

```bash
# Container status
docker compose -f /opt/merkei-website/docker-compose.yml ps

# Live logs
docker compose -f /opt/merkei-website/docker-compose.yml logs -f

# Manual restart
docker compose -f /opt/merkei-website/docker-compose.yml restart

# Force re-pull and restart
docker compose -f /opt/merkei-website/docker-compose.yml pull && \
docker compose -f /opt/merkei-website/docker-compose.yml up -d
```

---

## Reverse Proxy (Optional — Nginx Proxy Manager / Traefik)

Port 80 direct expose කරනවා නොව reverse proxy behind ෙ දාල HTTPS ෙ configure කරන්නෙ නම්:

1. `docker-compose.yml` ෙ `ports` section comment කරන්න
2. Traefik/NPM labels uncomment කරන්න
3. Domain point කරන්න VPS IP ෙ
