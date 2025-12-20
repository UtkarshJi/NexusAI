import { getDatabase, saveDatabase, type SqlJsDatabase } from '../db/database.js';
import { Message, MessageSender } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export class MessageRepository {
  private db: SqlJsDatabase | null = null;

  private async getDb(): Promise<SqlJsDatabase> {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }

  /**
   * Create a new message
   */
  async create(conversationId: string, sender: MessageSender, text: string): Promise<Message> {
    const db = await this.getDb();
    const id = uuidv4();

    db.run(
      `INSERT INTO messages (id, conversation_id, sender, text) VALUES (?, ?, ?, ?)`,
      [id, conversationId, sender, text]
    );

    saveDatabase();

    const result = await this.findById(id);
    return result!;
  }

  /**
   * Find a message by ID
   */
  async findById(id: string): Promise<Message | null> {
    const db = await this.getDb();

    const result = db.exec(
      `SELECT id, conversation_id, sender, text, created_at FROM messages WHERE id = ?`,
      [id]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    const row = result[0].values[0];
    return {
      id: row[0] as string,
      conversation_id: row[1] as string,
      sender: row[2] as MessageSender,
      text: row[3] as string,
      created_at: row[4] as string,
    };
  }

  /**
   * Get all messages for a conversation, ordered by creation time
   */
  async findByConversationId(conversationId: string): Promise<Message[]> {
    const db = await this.getDb();

    const result = db.exec(
      `SELECT id, conversation_id, sender, text, created_at 
       FROM messages 
       WHERE conversation_id = ? 
       ORDER BY created_at ASC`,
      [conversationId]
    );

    if (result.length === 0) {
      return [];
    }

    return result[0].values.map((row) => ({
      id: row[0] as string,
      conversation_id: row[1] as string,
      sender: row[2] as MessageSender,
      text: row[3] as string,
      created_at: row[4] as string,
    }));
  }

  /**
   * Get the last N messages for a conversation (for context)
   */
  async getRecentMessages(conversationId: string, limit: number = 10): Promise<Message[]> {
    const db = await this.getDb();

    const result = db.exec(
      `SELECT id, conversation_id, sender, text, created_at 
       FROM messages 
       WHERE conversation_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [conversationId, limit]
    );

    if (result.length === 0) {
      return [];
    }

    const messages = result[0].values.map((row) => ({
      id: row[0] as string,
      conversation_id: row[1] as string,
      sender: row[2] as MessageSender,
      text: row[3] as string,
      created_at: row[4] as string,
    }));

    // Reverse to get chronological order
    return messages.reverse();
  }

  /**
   * Count messages in a conversation
   */
  async countByConversationId(conversationId: string): Promise<number> {
    const db = await this.getDb();

    const result = db.exec(
      `SELECT COUNT(*) as count FROM messages WHERE conversation_id = ?`,
      [conversationId]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return 0;
    }

    return result[0].values[0][0] as number;
  }
}

export const messageRepository = new MessageRepository();
