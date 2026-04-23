# Nature toolbox

![Nature toolbox Screenshot](assets/urlhub.png)

A modern, full-stack personal dashboard to organize and access your favorite websites, projects, and tools. Built with a focus on a "Nature Design Mandate" featuring organic shapes, earthy colors, and a peaceful user experience.

## Features

- **Multi-Profile Support**: Switch between **Default**, **Private**, and **Personal** (combined) profiles.
- **Categorized Bookmarks**: Organize links into categories with custom icons and offline support.
- **Projects View**: Showcase and manage your personal or professional projects.
- **Toolbox**: A massive collection of utility tools (Scientific Calculator, PDF editors, Dev utilities, etc.) with a searchable grid.
- **Advanced Search**: Real-time filtering with support for category prefixes (e.g., `cat:util`) and keyboard shortcuts (`[/]` to focus).
- **Pinned Links & Tools**: Pin your most used bookmarks and tools to the top for quick access.
- **Responsive Design**: Optimized for desktop, tablet, and mobile with a bottom TabBar for easy navigation.
- **Persistence**: Data is stored in a SQLite database with automatic migration from legacy JSON files.
- **Customizable UI**: Settings for themes (System/Light/Dark), accent colors, glassmorphism, and layout density.

---

## 📖 User Guide

### Navigation
- **TabBar (Mobile & Desktop)**: Quickly switch between **Toolbox**, **Bookmarks**, and **Projects**.
- **Search Overlay**: Triggered by the search icon or the `/` key. It filters the current view in real-time.
- **Settings**: Accessible via the gear icon in the Header (Desktop) or TabBar (Mobile).

### Profiles
The dashboard supports multiple profiles to keep your links organized:
- **Default**: Your primary workspace.
- **Private**: A secondary profile for sensitive or work-related links.
- **Personal**: A virtual profile that aggregates links from all profiles, de-duplicating by URL.
- *Tip: Long-press the Bookmarks tab on mobile to quickly switch profiles.*

### Managing Bookmarks
- **Adding**: Click the `+` button in the TabBar.
- **Pinning**: Click the pin icon on any bookmark card to keep it at the top.
- **Editing/Deleting**: Use the action buttons visible on each bookmark card. Deletion can be protected with a confirmation prompt in Settings.

### Using the Toolbox
- **Search**: Type in the search bar. Use `cat:Math` to filter specifically by the Math category.
- **Pinning Tools**: Click the pin icon on a tool card to add it to your "Pinned" section at the top of the Toolbox.
- **Recent Tools**: The Toolbox automatically tracks your last used tools for quick reentry.
- **Tool Results**: Many tools support one-click copying or downloading of results (e.g., Hash Generator, JSON Formatter).

### Settings & Customization
- **Global**: Change the App Name, toggle Profiles, or switch the Startup Tab.
- **Appearance**: Toggle between Light, Dark, or System themes. Choose an accent color and toggle effects like "Aurora" backgrounds or Glassmorphism.
- **Data Management**: Export/Import data (future feature) or Reset Local Data to clear all browser-stored preferences.

---

## 🛠 Tech Guide

### Architecture
The application follows a decoupled Frontend/Backend architecture:
- **Frontend**: A Single Page Application (SPA) built with **React 18** and **Vite**.
- **Backend**: A **FastAPI** server providing a RESTful API and handling database operations.
- **Database**: **SQLite** for local and production data storage.

### Frontend Details
- **State Management**: Uses React's `useState` and `useEffect` with a custom `storage` utility for `localStorage` persistence.
- **Performance**: Tools are **lazy-loaded** using `React.lazy` and `Suspense` to minimize the initial bundle size.
- **Styling**: Centralized CSS in the `css/` directory. No inline styles are used, adhering to the "Nature Design Mandate".
- **PWA**: Includes a Service Worker (`public/sw.js`) and manifest for offline support and installability.

### Backend Details
- **Framework**: FastAPI (Python 3.9+) with Pydantic for data validation.
- **Database Logic**: Interacts with `data/hub.db`. On Vercel, the database is copied to `/tmp/hub.db` at runtime to allow write operations on an ephemeral filesystem.
- **Media Processing**: Uses `yt-dlp` for social media downloading capabilities and `pdf-lib` (client-side) for PDF manipulations.

### Database Schema
- `profiles`: Stores profile names and icons.
- `links`: Core table for bookmarks, including metadata like `is_pinned`, `category`, and `profile_id`.
- `categories`: Stores profile-specific icons for categories.
- `projects`: Stores project showcase data.

### Deployment on Vercel
- **Configuration**: Managed via `vercel.json`.
- **API Entry**: `api/index.py` serves as the entry point for Vercel's Serverless Functions.
- **Statics**: Vite builds the frontend into the `dist` folder (configured in Vercel) for static hosting.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python 3.9+

### Installation
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd nature-toolbox
   ```
2. **Install Frontend Dependencies**:
   ```bash
   npm install
   ```
3. **Install Backend Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Initialize the Database**:
   ```bash
   python3 scripts/setup_db.py
   ```

### Running Locally
1. **Backend**: `uvicorn api.index:app --reload` (Port 8000)
2. **Frontend**: `npm run dev` (Port 5173)

---

## 📜 License
MIT
