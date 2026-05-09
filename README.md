Note: Pomotivity was fully vibe-coded in a couple of hours with Google Antigravity. I created it entirely for my own use because my doctor said I need to try to move more during the day, but it's here if you want to try it. Feel free to contribute to or fork this project.

# 🍅 Pomotivity

**Gamified Pomodoro PWA for an Active Workday.**

Pomotivity is a premium, open-source productivity tool designed to help you stay focused while ensuring you move your body. It combines a professional Pomodoro timer with a rich gamification engine that tracks your physical activities during breaks.

![Pomotivity Banner](src/assets/hero.png)

## ✨ Features

- **Adaptive Timer:** Focus cycles with built-in "Active Breaks".
- **Movement Engine:** High-impact movement prompts (Cardio, Strength, Stretching, Eye/Neck Care).
- **Deep Gamification:** 25+ achievements, daily session goals, and work-week aware streaks.
- **Visual Insights:** Activity heatmaps and a chronological, nested "Today's Log".
- **Multi-User Support:** Isolated profiles with a dedicated Admin dashboard.
- **PWA Ready:** Install it on your desktop or mobile for an app-like experience.
- **Privacy First:** All data is stored locally in your browser.

## 🚀 Quick Start (Docker)

The fastest way to deploy Pomotivity is using Docker.

```bash
docker run -d \
  -p 3000:80 \
  --name pomotivity \
  -e ADMIN_USER=admin \
  -e ADMIN_PASSWORD=your_secure_password \
  ghcr.io/justin-cagle/pomotivity:latest
```

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
    restart: always
```

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ADMIN_USER` | `admin` | The initial username for the system administrator. |
| `ADMIN_PASSWORD` | `password` | The initial password for the system administrator. |
| `SIGNUPS_ENABLED` | `true` | Whether to allow new user registrations on the login page. |

## 🛠 Local Development

1. **Clone the repo:**
   ```bash
   git clone https://github.com/justin-cagle/pomotivity.git
   cd pomotivity
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🏥 Health Check

The container includes a built-in health check that monitors the availability of the web server via `/health.json`.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---
*Built with React, Vite, and Lucide Icons.*
