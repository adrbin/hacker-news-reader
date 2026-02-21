# hacker-news-reader

A modern, fast, and responsive Hacker News reader built with TypeScript, React, Vite, and Material UI. Browse top stories, search posts, and read comments from Hacker News using the Algolia API. Includes PWA support for offline use and mobile-friendly experience.

## Features

- Browse top, new, and best Hacker News stories
- Search posts with instant results
- View post details and threaded comments
- Sort comments (by time, popularity, etc.)
- Infinite scroll and swipe navigation
- Responsive Material UI design
- State and scroll position preservation between navigation
- Progressive Web App (PWA) support (offline, installable)

## Tech Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for fast development/build
- [Material UI (MUI)](https://mui.com/) for UI components and theming
- [react-router-dom](https://reactrouter.com/) for routing
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) for PWA features
- Context API and custom React hooks for state management

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- pnpm (v10+ recommended)

### Installation

```bash
git clone https://github.com/adrbin/hacker-news-reader.git
cd hacker-news-reader
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
pnpm build
```

Preview the production build:

```bash
pnpm preview
```

### Linting

```bash
pnpm lint
```

## Project Structure

- `src/` — Main source code
  - `components/` — Presentational React components
  - `context/` — Posts context and types
  - `hooks/` — Custom React hooks
  - `pages/` — Main app pages (Home, Post Detail)
  - `services/` — API layer for Hacker News (Algolia)
  - `utils/` — Utility functions (e.g., comment sorting)
- `public/` — Static assets and PWA manifest
- `vite.config.ts` — Vite and PWA configuration

## API

All data is fetched from the [Algolia Hacker News API](https://hn.algolia.com/api).

## Contributing

Pull requests and issues are welcome! Please follow the code style and conventions.

## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](./LICENSE) file for details.