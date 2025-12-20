import initSqlJs, { Database } from 'sql.js';
import path from 'path';
import fs from 'fs';

// Get database path from environment or use default
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'chat.db');

// Ensure the data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

let db: Database | null = null;

/**
 * Initialize and get the database instance
 */
export async function getDatabase(): Promise<Database> {
    if (db) {
        return db;
    }

    const SQL = await initSqlJs();

    // Load existing database or create new one
    let database: Database;
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        database = new SQL.Database(fileBuffer);
    } else {
        database = new SQL.Database();
    }

    // Initialize schema
    const schemaPath = path.join(process.cwd(), 'packages', 'backend', 'src', 'db', 'schema.sql');
    let schema: string;

    try {
        schema = fs.readFileSync(schemaPath, 'utf-8');
    } catch {
        // Fallback for when running from different directory
        const altPath = path.join(process.cwd(), 'src', 'db', 'schema.sql');
        schema = fs.readFileSync(altPath, 'utf-8');
    }

    database.run(schema);

    // Enable foreign keys
    database.run('PRAGMA foreign_keys = ON');

    // Store in module variable
    db = database;

    console.log('✅ Database initialized successfully');

    return database;
}

/**
 * Save database to disk
 */
export function saveDatabase(): void {
    if (!db) return;

    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
    if (db) {
        saveDatabase();
        db.close();
        db = null;
    }
}

// Save database periodically and on exit
setInterval(saveDatabase, 30000); // Every 30 seconds
process.on('exit', saveDatabase);
process.on('SIGINT', () => {
    closeDatabase();
    process.exit();
});
process.on('SIGTERM', () => {
    closeDatabase();
    process.exit();
});

export type { Database as SqlJsDatabase };
