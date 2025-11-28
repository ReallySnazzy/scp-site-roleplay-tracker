# SCP Site Roleplay Helper

A dedicated tool designed to assist with SCP site roleplay operations. This application allows users to track status and information either locally or in a shared session with other players.

## Features

- **Offline Ops**: Use the tracker on your local device without needing an internet connection.
- **Host Session**: Create a shared room and generate a code to invite others.
- **Join Session**: Enter a 6-character code to join an existing session and sync data in real-time.
- **Real-time Sync**: Powered by PeerJS for direct peer-to-peer connections.

## Tech Stack

- **Framework**: [React](https://react.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **P2P Networking**: [PeerJS](https://peerjs.com/)

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm

### Installation

1. Navigate to the project directory:
   ```bash
   cd scp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.

### Development Environment (Optional)

This project is configured with [devenv](https://devenv.sh/) for a reproducible development environment. If you have `devenv` installed:

```bash
devenv shell
```

This will set up the necessary tools (Node.js, etc.) automatically.

## Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run serve
```

## Testing

Run the test suite with:

```bash
npm run test
```
