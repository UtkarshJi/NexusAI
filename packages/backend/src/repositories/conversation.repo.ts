import { getDatabase, saveDatabase, type SqlJsDatabase } from '../db/database.js';
import { Conversation } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export class ConversationRepository {
  private db: SqlJsDatabase | null = null;

  private async getDb(): Promise<SqlJsDatabase> {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }

  /**
   * Create a new conversation
   */
  async create(metadata?: Record<string, unknown>): Promise<Conversation> {
    const db = await this.getDb();
    const id = uuidv4();
    const metadataJson = metadata ? JSON.stringify(metadata) : null;

    db.run(
      `INSERT INTO conversations (id, metadata) VALUES (?, ?)`,
      [id, metadataJson]
    );

    saveDatabase();

    const result = await this.findById(id);
    return result!;
  }

  /**
   * Find a conversation by ID
   */
  async findById(id: string): Promise<Conversation | null> {
    const db = await this.getDb();

    const result = db.exec(
      `SELECT id, created_at, metadata FROM conversations WHERE id = ?`,
      [id]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    const row = result[0].values[0];
    return {
      id: row[0] as string,
      created_at: row[1] as string,
      metadata: row[2] as string | null,
    };
  }

  /**
   * Check if a conversation exists
   */
  async exists(id: string): Promise<boolean> {
    const db = await this.getDb();

    const result = db.exec(
      `SELECT 1 FROM conversations WHERE id = ?`,
      [id]
    );

    return result.length > 0 && result[0].values.length > 0;
  }

  /**
   * Delete a conversation and all its messages
   */
  async delete(id: string): Promise<boolean> {
    const db = await this.getDb();

    db.run(`DELETE FROM conversations WHERE id = ?`, [id]);
    saveDatabase();

    const changes = db.getRowsModified();
    return changes > 0;
  }
}

export const conversationRepository = new ConversationRepository();
