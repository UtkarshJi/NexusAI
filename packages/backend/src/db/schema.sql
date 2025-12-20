-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    metadata TEXT
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender TEXT CHECK(sender IN ('user', 'ai')) NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Index for faster message retrieval by conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- Index for ordering messages by time
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
