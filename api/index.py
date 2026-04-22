from fastapi import FastAPI, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import os
import json
import uuid
import sys
import shutil

# Add the project root to sys.path so we can import from scripts
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Handle read-only filesystem on Vercel
IS_VERCEL = os.environ.get('VERCEL') == '1'
if IS_VERCEL:
    DB_PATH = '/tmp/hub.db'
    ORIG_DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'hub.db')
else:
    DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'hub.db')

def get_db_connection():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        print(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

# Track initialization to avoid redundant slow checks
_db_initialized = False

def init_db():
    global _db_initialized
    if _db_initialized:
        return

    if IS_VERCEL and not os.path.exists(DB_PATH):
        # Try to copy existing DB from data/ if it exists
        if os.path.exists(ORIG_DB_PATH):
            try:
                shutil.copy(ORIG_DB_PATH, DB_PATH)
                print(f"Copied database from {ORIG_DB_PATH} to {DB_PATH}")
            except Exception as e:
                print(f"Failed to copy database: {e}")

    db_dir = os.path.dirname(DB_PATH)
    if db_dir and not os.path.exists(db_dir):
        try:
            os.makedirs(db_dir, exist_ok=True)
        except Exception as e:
            print(f"Failed to create DB directory {db_dir}: {e}")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Profiles table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            icon TEXT NOT NULL
        )
    ''')

    # Links table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS links (
            id TEXT PRIMARY KEY,
            profile_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            url TEXT NOT NULL,
            urls TEXT, -- JSON array of strings
            icon TEXT,
            optional_icon TEXT,
            category TEXT NOT NULL,
            is_internal BOOLEAN DEFAULT 0,
            tool_id TEXT,
            is_pinned BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (profile_id) REFERENCES profiles (id)
        )
    ''')

    # Categories table (profile-specific icons for categories)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            profile_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            icon TEXT NOT NULL,
            PRIMARY KEY (profile_id, name),
            FOREIGN KEY (profile_id) REFERENCES profiles (id)
        )
    ''')

    # Projects table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            url TEXT,
            category TEXT,
            icon TEXT
        )
    ''')


    # Check if created_at column exists, if not add it (for existing databases)
    cursor.execute("PRAGMA table_info(links)")
    columns = [col[1] for col in cursor.fetchall()]
    if 'created_at' not in columns:
        cursor.execute("ALTER TABLE links ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")

    # Deduplicate before adding unique index
    cursor.execute('''
        DELETE FROM links
        WHERE id NOT IN (
            SELECT MIN(id)
            FROM links
            GROUP BY profile_id, title, url
        )
    ''')
    cursor.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_links_unique ON links(profile_id, title, url)')

    # Insert default profiles if not exist
    cursor.execute("INSERT OR IGNORE INTO profiles (name, icon) VALUES ('Default', 'home')")
    cursor.execute("INSERT OR IGNORE INTO profiles (name, icon) VALUES ('Private', 'lock')")
    cursor.execute("INSERT OR IGNORE INTO profiles (name, icon) VALUES ('Personal', 'person')")

    conn.commit()

    # Auto-migrate if DB was just created or if it's empty
    cursor.execute("SELECT COUNT(*) FROM links")
    if cursor.fetchone()[0] == 0:
        print("Database is empty. Attempting migration...")
        try:
            from scripts.migrate import migrate
            # Pass the DB_PATH to ensure it uses the correct one (especially on Vercel)
            migrate(db_path=DB_PATH)
        except ImportError:
            print("Migration script not found.")
        except Exception as e:
            print(f"Migration failed: {e}")

    conn.close()
    _db_initialized = True

# Pydantic Models
class LinkBase(BaseModel):
    title: str
    url: str
    urls: List[str] = []
    icon: Optional[str] = None
    optional_icon: Optional[str] = None
    category: str
    is_internal: bool = False
    tool_id: Optional[str] = None
    is_pinned: bool = False

class LinkCreate(LinkBase):
    profile_id: int

class LinkUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    urls: Optional[List[str]] = None
    icon: Optional[str] = None
    optional_icon: Optional[str] = None
    category: Optional[str] = None
    is_internal: Optional[bool] = None
    tool_id: Optional[str] = None
    is_pinned: Optional[bool] = None

class Link(LinkBase):
    id: str
    profile_id: int

class Category(BaseModel):
    name: str
    icon: str
    profile_id: int

class Profile(BaseModel):
    id: int
    name: str
    icon: str

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    url: Optional[str] = None
    category: Optional[str] = None
    icon: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    category: Optional[str] = None
    icon: Optional[str] = None

class Project(ProjectBase):
    id: str

@app.on_event("startup")
def startup_event():
    try:
        init_db()
    except Exception as e:
        print(f"Application startup failed: {e}")


@app.get("/api/hello")
def hello():
    return {"message": "Hello from Python on Vercel!"}

@app.get("/api/health")
def health():
    try:
        conn = get_db_connection()
        conn.execute("SELECT 1")
        conn.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}, 500

# Profiles Endpoints
@app.get("/api/profiles", response_model=List[Profile])
def get_profiles():
    try:
        conn = get_db_connection()
        profiles = conn.execute('SELECT * FROM profiles ORDER BY id ASC').fetchall()
        conn.close()
        return [dict(p) for p in profiles]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Links Endpoints
@app.get("/api/links", response_model=List[Link])
def get_links(profile_id: Optional[int] = None):
    conn = get_db_connection()

    if profile_id:
        # Check if this is the 'Personal' profile
        profile = conn.execute("SELECT name FROM profiles WHERE id = ?", (profile_id,)).fetchone()
        if profile and profile['name'] == 'Personal':
            # For Personal profile, we merge all links and de-duplicate by title and url
            # We use MAX(is_pinned) to ensure if a link is pinned in any profile, it remains pinned
            links = conn.execute('''
                SELECT id, profile_id, title, url, urls, icon, optional_icon, category, is_internal, tool_id, MAX(is_pinned) as is_pinned
                FROM links
                GROUP BY title, url
                ORDER BY is_pinned DESC, title COLLATE NOCASE ASC
            ''').fetchall()
        else:
            links = conn.execute('SELECT * FROM links WHERE profile_id = ? ORDER BY is_pinned DESC, title COLLATE NOCASE ASC', (profile_id,)).fetchall()
    else:
        links = conn.execute('SELECT * FROM links ORDER BY is_pinned DESC, title COLLATE NOCASE ASC').fetchall()
    conn.close()

    res = []
    for l in links:
        d = dict(l)
        d['urls'] = json.loads(d['urls']) if d['urls'] else []
        res.append(d)
    return res

@app.get("/api/links/categories", response_model=List[str])
def get_link_categories(profile_id: Optional[int] = None):
    conn = get_db_connection()
    if profile_id:
        categories = conn.execute('SELECT DISTINCT category FROM links WHERE profile_id = ? ORDER BY category ASC', (profile_id,)).fetchall()
    else:
        categories = conn.execute('SELECT DISTINCT category FROM links ORDER BY category ASC').fetchall()
    conn.close()
    return [c['category'] for c in categories]

@app.post("/api/links", response_model=Link)
def create_link(link: LinkCreate):
    conn = get_db_connection()
    link_id = str(uuid.uuid4())
    conn.execute('''
        INSERT INTO links (id, profile_id, title, url, urls, icon, optional_icon, category, is_internal, tool_id, is_pinned)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (link_id, link.profile_id, link.title, link.url, json.dumps(link.urls), link.icon, link.optional_icon, link.category, link.is_internal, link.tool_id, link.is_pinned))
    conn.commit()

    new_link = conn.execute('SELECT * FROM links WHERE id = ?', (link_id,)).fetchone()
    conn.close()

    d = dict(new_link)
    d['urls'] = json.loads(d['urls']) if d['urls'] else []
    return d

@app.put("/api/links/{link_id}", response_model=Link)
def update_link(link_id: str, link: LinkUpdate):
    conn = get_db_connection()
    existing = conn.execute('SELECT * FROM links WHERE id = ?', (link_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Link not found")

    update_data = link.dict(exclude_unset=True)
    if 'urls' in update_data:
        update_data['urls'] = json.dumps(update_data['urls'])

    query = 'UPDATE links SET ' + ', '.join([f'{k} = ?' for k in update_data.keys()]) + ' WHERE id = ?'
    values = list(update_data.values()) + [link_id]

    conn.execute(query, values)
    conn.commit()

    updated = conn.execute('SELECT * FROM links WHERE id = ?', (link_id,)).fetchone()
    conn.close()

    d = dict(updated)
    d['urls'] = json.loads(d['urls']) if d['urls'] else []
    return d

@app.delete("/api/links/{link_id}")
def delete_link(link_id: str):
    conn = get_db_connection()
    conn.execute('DELETE FROM links WHERE id = ?', (link_id,))
    conn.commit()
    conn.close()
    return {"message": "Link deleted"}

@app.post("/api/refresh-db")
def refresh_db():
    # Re-run migration without deleting existing data
    try:
        from scripts.migrate import migrate
        migrate(db_path=DB_PATH)
    except Exception as e:
        print(f"Migration failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Database refreshed successfully"}

# Categories Endpoints
@app.get("/api/categories", response_model=List[Category])
def get_categories(profile_id: Optional[int] = None):
    conn = get_db_connection()

    if profile_id:
        # Check if this is the 'Personal' profile
        profile = conn.execute("SELECT name FROM profiles WHERE id = ?", (profile_id,)).fetchone()
        if profile and profile['name'] == 'Personal':
            # For Personal profile, we want unique categories from all profiles, picking one icon for each
            categories = conn.execute('SELECT name, MIN(icon) as icon, ? as profile_id FROM categories GROUP BY name ORDER BY name ASC', (profile_id,)).fetchall()
        else:
            categories = conn.execute('SELECT * FROM categories WHERE profile_id = ? ORDER BY name ASC', (profile_id,)).fetchall()
    else:
        categories = conn.execute('SELECT * FROM categories ORDER BY name ASC').fetchall()
    conn.close()
    return [dict(c) for c in categories]

@app.post("/api/categories", response_model=Category)
def create_category(category: Category):
    conn = get_db_connection()
    conn.execute('''
        INSERT OR REPLACE INTO categories (profile_id, name, icon)
        VALUES (?, ?, ?)
    ''', (category.profile_id, category.name, category.icon))
    conn.commit()
    conn.close()
    return category

# Projects Endpoints
@app.get("/api/projects", response_model=List[Project])
def get_projects():
    conn = get_db_connection()
    projects = conn.execute('SELECT * FROM projects ORDER BY title COLLATE NOCASE ASC').fetchall()
    conn.close()
    return [dict(p) for p in projects]

@app.post("/api/projects", response_model=Project)
def create_project(project: ProjectCreate):
    conn = get_db_connection()
    project_id = str(uuid.uuid4())
    conn.execute('''
        INSERT INTO projects (id, title, description, url, category, icon)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (project_id, project.title, project.description, project.url, project.category, project.icon))
    conn.commit()

    new_project = conn.execute('SELECT * FROM projects WHERE id = ?', (project_id,)).fetchone()
    conn.close()
    return dict(new_project)

@app.put("/api/projects/{project_id}", response_model=Project)
def update_project(project_id: str, project: ProjectUpdate):
    conn = get_db_connection()
    existing = conn.execute('SELECT * FROM projects WHERE id = ?', (project_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = project.dict(exclude_unset=True)
    if not update_data:
        conn.close()
        return dict(existing)

    query = 'UPDATE projects SET ' + ', '.join([f'{k} = ?' for k in update_data.keys()]) + ' WHERE id = ?'
    values = list(update_data.values()) + [project_id]

    conn.execute(query, values)
    conn.commit()

    updated = conn.execute('SELECT * FROM projects WHERE id = ?', (project_id,)).fetchone()
    conn.close()
    return dict(updated)

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: str):
    conn = get_db_connection()
    conn.execute('DELETE FROM projects WHERE id = ?', (project_id,))
    conn.commit()
    conn.close()
    return {"message": "Project deleted"}
