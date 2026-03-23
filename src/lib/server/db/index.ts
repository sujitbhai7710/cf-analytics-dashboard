/**
 * Database Utilities
 * Helper functions for D1 database operations
 */

import type { D1Database } from '@cloudflare/workers-types';

/**
 * Generate a UUID v4
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Get current timestamp in ISO format
 */
export function timestamp(): string {
  return new Date().toISOString();
}

/**
 * Simple query builder for D1
 */
export class QueryBuilder {
  private db: D1Database;
  private tableName: string;
  
  constructor(db: D1Database, tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }
  
  /**
   * Find all records
   */
  async findAll<T = unknown>(): Promise<T[]> {
    const result = await this.db.prepare(
      `SELECT * FROM ${this.tableName}`
    ).all();
    return result.results as T[];
  }
  
  /**
   * Find by ID
   */
  async findById<T = unknown>(id: string): Promise<T | null> {
    const result = await this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE id = ?`
    ).bind(id).first();
    return result as T | null;
  }
  
  /**
   * Find by field value
   */
  async findBy<T = unknown>(field: string, value: unknown): Promise<T[]> {
    const result = await this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE ${field} = ?`
    ).bind(value).all();
    return result.results as T[];
  }
  
  /**
   * Find one by field value
   */
  async findOneBy<T = unknown>(field: string, value: unknown): Promise<T | null> {
    const result = await this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE ${field} = ? LIMIT 1`
    ).bind(value).first();
    return result as T | null;
  }
  
  /**
   * Insert a record
   */
  async insert(data: Record<string, unknown>): Promise<string> {
    const keys = Object.keys(data);
    const placeholders = keys.map(() => '?').join(', ');
    const values = Object.values(data);
    
    const id = generateId();
    
    await this.db.prepare(
      `INSERT INTO ${this.tableName} (id, ${keys.join(', ')}) VALUES (?, ${placeholders})`
    ).bind(id, ...values).run();
    
    return id;
  }
  
  /**
   * Update a record
   */
  async update(id: string, data: Record<string, unknown>): Promise<void> {
    const keys = Object.keys(data);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = Object.values(data);
    
    await this.db.prepare(
      `UPDATE ${this.tableName} SET ${setClause}, updated_at = ? WHERE id = ?`
    ).bind(...values, timestamp(), id).run();
  }
  
  /**
   * Delete a record
   */
  async delete(id: string): Promise<void> {
    await this.db.prepare(
      `DELETE FROM ${this.tableName} WHERE id = ?`
    ).bind(id).run();
  }
  
  /**
   * Count records
   */
  async count(where?: string, params?: unknown[]): Promise<number> {
    const sql = where 
      ? `SELECT COUNT(*) as count FROM ${this.tableName} WHERE ${where}`
      : `SELECT COUNT(*) as count FROM ${this.tableName}`;
    
    const stmt = this.db.prepare(sql);
    const result = params 
      ? await stmt.bind(...params).first()
      : await stmt.first();
    
    return (result as { count: number }).count;
  }
}

/**
 * Create a query builder for a table
 */
export function query(db: D1Database, tableName: string): QueryBuilder {
  return new QueryBuilder(db, tableName);
}
