# Hand Tracking Experience

A modern web-based hand tracking experience built with React, Vite, and MediaPipe. This application uses your webcam to detect hand gestures and create interactive visual effects.

## Features
- ✨ **Real-time Hand Tracking**: Advanced gesture recognition using MediaPipe.
- 🎨 **Visual Effects**: Dynamic particle systems and photo formations.
- 📱 **Mobile Optimized**: Designed to be shared and viewed on mobile devices via ngrok.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- ngrok (optional, for mobile sharing)

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd handtracking
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
To start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

### Remote Access (Mobile)
If you have ngrok installed, you can use the provided helper scripts or run:
```bash
ngrok http 5173
```

---

## Scripts
- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run lint`: Runs ESLint for code quality.
- `start.bat`: Convenience script to start the server and ngrok tunnel.
- `stop.bat`: Stops all running node and ngrok processes.

## License
MIT
