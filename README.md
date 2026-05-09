Note: Pomotivity was fully vibe-coded in a couple of hours with Google Antigravity. I created it entirely for my own use because my doctor said I need to try to move more during the day, but it's here if you want to try it. Feel free to contribute to or fork this project.

# 🍅 Pomotivity

**Gamified Pomodoro PWA for an Active Workday.**

Pomotivity is a premium, open-source productivity tool designed to help you stay focused while ensuring you move your body.

## ✨ Features (v1.3.0 - Full Stack)

- **Server-Side Persistence:** Data is now stored on the server, enabling sync and reliable Docker deployments.
- **Adaptive Timer:** Focus cycles with built-in "Active Breaks".
- **Movement Engine:** High-impact movement prompts (Cardio, Strength, Stretching, Eye/Neck Care).
- **Deep Gamification:** Achievements, daily session goals, and streaks.
- **Multi-User Support:** Isolated profiles with a dedicated Admin dashboard.
- **PWA Ready:** Install it on your desktop or mobile.

## 🚀 Quick Start (Docker)

To deploy Pomotivity with persistence:

```bash
docker run -d \
  -p 3000:80 \
  --name pomotivity \
  -v ./pomotivity-data:/app/data \
  -e ADMIN_USER=admin \
  -e ADMIN_PASSWORD=your_secure_password \
  ghcr.io/justin-cagle/pomotivity:latest
```

> [!IMPORTANT]
> The `-v ./pomotivity-data:/app/data` part is crucial for persisting your users and stats across container restarts and updates.

### 🐳 Docker Compose

```yaml
services:
  pomotivity:
    image: ghcr.io/justin-cagle/pomotivity:latest
    ports:
      - "3000:80"
    environment:
      - ADMIN_USER=admin
      - ADMIN_PASSWORD=password
      - SIGNUPS_ENABLED=true
    volumes:
      - ./data:/app/data
    restart: always
```

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ADMIN_USER` | `admin` | The initial username for the system administrator. |
| `ADMIN_PASSWORD` | `password` | The initial password for the system administrator. |
| `SIGNUPS_ENABLED` | `true` | Whether to allow new user registrations. |

## 📜 License

MIT License - see the [LICENSE](LICENSE) file for details.
