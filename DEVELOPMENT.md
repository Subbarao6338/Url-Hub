# Epic Toolbox Developer Documentation

Welcome to the developer documentation for **Epic Toolbox**. This guide outlines how to set up the development environment, run the services locally, and execute the test suites.

## 🏗️ Architecture Overview

Epic Toolbox is a full-stack, local-first application built with:
- **Frontend**: React 18, Vite, and custom CSS using Material Design variables.
- **Backend**: FastAPI (Python 3.12+) serving computationally heavy, specialized, or third-party integrated endpoints (e.g. YT-DLP, Notion, Translation, and advanced math/data utilities).
- **Database**: SQLite database managed locally.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) and npm
- Python (v3.12+)

---

### 1. Frontend Setup & Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run in development mode** (defaults to `http://localhost:5173`):
   ```bash
   npm run dev
   ```

3. **Build production assets**:
   ```bash
   npm run build
   ```

---

### 2. Backend Setup & Run

1. **Install Python dependencies**:
   ```bash
   python3 -m pip install -r api/requirements.txt
   ```

2. **Initialize SQLite Database**:
   ```bash
   python3 scripts/setup_db.py
   ```

3. **Run the FastAPI server** (via Uvicorn on port `8000`):
   ```bash
   uvicorn api.index:app --port 8000 --reload
   ```

---

## 🧪 Testing

The repository has two main testing environments:

### A. JavaScript/Frontend Tests (Vitest & Playwright)

1. **Unit and Utility Tests (Vitest)**:
   Runs Unit tests for key helpers and astronomical algorithms (e.g., `helpers.js`, `panchangam.js`, `dataAnalysis.js`).
   ```bash
   npx vitest run
   ```

2. **End-to-End Tests (Playwright)**:
   Ensure you have installed the required browsers and dependencies first:
   ```bash
   npx playwright install chromium
   npx playwright test
   ```

### B. Python/Backend Tests (pytest)

To test backend routes and core functions (such as social downloader integration and document translation):

1. **Make sure the FastAPI server is running** on port 8000.
2. **Run the backend tests**:
   ```bash
   python3 -m pytest legacy/tests/test_doc_translate.py scripts/test_downloader_api.py -v
   ```

---

## 📐 Code Standards & Contribution

- **Asynchronous Code Safety**: When writing FastAPI routes (`async def`), offload any long-running or synchronous CPU/IO-bound calls (e.g. third-party SDK calls like `notion_client`) to standard threads using `anyio.to_thread.run_sync(...)`.
- **Defensive Timeouts**: Always specify explicit timeouts (e.g., `timeout=5`) when invoking external HTTP requests with `requests`.
- **First-Class Unit Tests**: Always accompany new utility functions (under `src/utils/`) with clean Vitest files (`.test.js`).
