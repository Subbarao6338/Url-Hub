import sqlite3
import os

def init_db():
    db_dir = 'data'
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)

    db_path = os.path.join(db_dir, 'sample.db')
    print(f"Initializing database at {db_path}...")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create a sample table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT
    )
    ''')

    # Insert some sample data
    sample_items = [
        ('Item 1', 'Description for item 1'),
        ('Item 2', 'Description for item 2'),
        ('Item 3', 'Description for item 3')
    ]

    cursor.executemany('INSERT INTO items (name, description) VALUES (?, ?)', sample_items)

    conn.commit()
    conn.close()
    print("Database initialized successfully.")

if __name__ == '__main__':
    init_db()
