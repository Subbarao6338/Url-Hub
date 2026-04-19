# Nature toolbox

![Nature toolbox Screenshot](assets/urlhub.png)

A modern, full-stack personal dashboard to organize and access your favorite websites, projects, and tools. Built with **React**, **FastAPI**, and **SQLite**.

## Features

- **Multi-Profile Support**: Switch between **Default**, **Private**, and **Personal** (combined) profiles.
- **Categorized Bookmarks**: Organize links into categories with custom icons.
- **Projects View**: Showcase and manage your personal or professional projects.
- **Toolbox**: A collection of utility tools (Calculator, QR Code Generator, etc.) with a searchable grid.
- **Advanced Search**: Real-time filtering with support for category prefixes (e.g., `cat:util`) and keyboard shortcuts (`[/]` to focus).
- **Pinned Links**: Pin your most used bookmarks to the top.
- **Responsive Design**: Optimized for both desktop and mobile devices with a bottom TabBar on small screens.
- **Persistence**: Data is stored in a SQLite database with automatic migration from legacy JSON files.
- **Customizable UI**: Settings for dark/light mode, reduced motion, search auto-focus, and more.

## Technology Stack

- **Frontend**: React 18, Vite, Bootstrap 5, Material Icons.
- **Backend**: FastAPI (Python), SQLite.
- **Deployment**: Vercel (Serverless Functions for Python, Vite for static assets).

## Getting Started

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

### Running the Application

1. **Start the FastAPI Backend**:
   ```bash
   uvicorn api.index:app --reload
   ```
   The API will be available at `http://localhost:8000`.

2. **Start the Vite Frontend**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## File Structure

- `api/`: FastAPI backend implementation.
- `src/`: React frontend source code.
  - `components/`: Modular React components (Header, TabBar, Modals, Views).
  - `components/tools/`: Individual toolbox utility components.
- `scripts/`: Python utility scripts for database setup, migration, and verification.
- `data/`: SQLite database file and legacy JSON data files.
- `public/`: Static assets and service worker.
- `css/`: Global styles including glassmorphism and animations.
- `legacy/`: Original vanilla JavaScript implementation (for reference).

## Deployment on Vercel

The project is configured for seamless deployment on Vercel.

1. **Configure Vercel**: The `vercel.json` file handles routing for both the React frontend and the FastAPI backend.
2. **Database on Vercel**: Since the Vercel filesystem is read-only, the application automatically initializes/copies the SQLite database to `/tmp/hub.db` at runtime to allow writes.
3. **Deploy**:
   ```bash
   vercel
   ```

## Customization

You can manage your links and categories directly through the UI. For advanced customization or bulk imports, you can modify the legacy JSON files in the `data/` directory and run the migration script:

```bash
python3 scripts/migrate.py
```

## License

MIT
