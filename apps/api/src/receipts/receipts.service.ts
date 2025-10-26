import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service.js';
import { ChatgptService } from '../chatgpt/chatgpt.service.js';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ReceiptsService {
  constructor(private readonly db: DbService, private readonly chatgpt: ChatgptService) {}

  listReceipts() {
    const result = this.db.db.exec(`
      SELECT r.*, 
        (SELECT COUNT(*) FROM items i WHERE i.receipt_id = r.id) AS items_count
      FROM receipts r
      ORDER BY r.created_at DESC
    `);
    return result[0]?.values.map((row: any[]) => {
      const obj: any = {};
      result[0].columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });
      return obj;
    }) || [];
  }

  getReceipt(id: number) {
    const receiptResult = this.db.db.exec(`SELECT * FROM receipts WHERE id = ${id}`);
    const itemsResult = this.db.db.exec(`SELECT * FROM items WHERE receipt_id = ${id} ORDER BY id`);
    
    const receipt = receiptResult[0]?.values.map((row: any[]) => {
      const obj: any = {};
      receiptResult[0].columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });
      return obj;
    })[0];
    
    const items = itemsResult[0]?.values.map((row: any[]) => {
      const obj: any = {};
      itemsResult[0].columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });
      return obj;
    }) || [];
    
    return { receipt, items };
  }

  listItems(q: string, category: string) {
    let sql = `SELECT * FROM items`;
    const parts: string[] = [];
    
    if (q) { 
      parts.push(`name LIKE '%${q.replace(/'/g, "''")}%'`);
    }
    if (category) { 
      parts.push(`category = '${category.replace(/'/g, "''")}'`);
    }
    if (parts.length) sql += ' WHERE ' + parts.join(' AND ');
    sql += ' ORDER BY id DESC';
    
    const result = this.db.db.exec(sql);
    return result[0]?.values.map((row: any[]) => {
      const obj: any = {};
      result[0].columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });
      return obj;
    }) || [];
  }

  updateItem(id: number, body: any) {
    const fields = ['name','qty','unit_price','line_total','vat_rate','barcode','category'] as const;
    const sets: string[] = [];
    const params: any[] = [];
    
    for (const f of fields) {
      if (f in body) { 
        sets.push(`${f} = ?`);
        params.push(body[f]);
      }
    }
    if (!sets.length) {
      return { updated: 0 };
    }
    
    params.push(id);
    const stmt = this.db.db.prepare(`UPDATE items SET ${sets.join(', ')} WHERE id = ?`);
    const result = stmt.run(params);
    
    // Save database to file
    this.saveDatabase();
    
    return { updated: result.changes || 0 };
  }

  getCategoryStats() {
    const result = this.db.db.exec(`
      SELECT 
        category,
        COUNT(*) as items_count,
        SUM(line_total) as total_amount,
        AVG(line_total) as avg_amount
      FROM items 
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY total_amount DESC
    `);
    
    return result[0]?.values.map((row: any[]) => {
      const obj: any = {};
      result[0].columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });
      return obj;
    }) || [];
  }

  async processUpload(filePath: string, originalName: string) {
    const analysis = await this.chatgpt.analyzeReceipt(filePath);

    // Екрануємо рядки для SQL
    const escapeString = (str: string | null | undefined): string => {
      if (!str) return '';
      return str.replace(/'/g, "''");
    };

    // Insert receipt
    const receiptStmt = this.db.db.prepare(`
      INSERT INTO receipts (store, date, subtotal, tax, total, currency, filename, image_path, time, change_amount, check_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    receiptStmt.run([
      analysis.store,
      analysis.date,
      analysis.subtotal,
      analysis.tax,
      analysis.total,
      analysis.currency,
      originalName,
      filePath,
      analysis.time,
      analysis.change_amount,
      analysis.check_number
    ]);

    // Get the last inserted ID
    const result = this.db.db.exec(`SELECT last_insert_rowid() as id`);
    const receiptId = result[0]?.values[0][0];

    // Insert items
    const itemStmt = this.db.db.prepare(`
      INSERT INTO items (receipt_id, name, qty, unit_price, line_total, vat_rate, barcode, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const item of analysis.items) {
      itemStmt.run([
        receiptId,
        item.name,
        item.qty,
        item.unit_price,
        item.line_total,
        null,
        null,
        item.category
      ]);
    }

    // Save database to file
    this.saveDatabase();

    return { id: receiptId, analysis };
  }

  deleteReceipt(id: number) {
    const receiptResult = this.db.db.exec(`SELECT image_path FROM receipts WHERE id = ${id}`);
    
    if (!receiptResult[0]?.values.length) {
      return { deleted: 0, error: 'Receipt not found' };
    }
    
    const imagePath = receiptResult[0].values[0][0];
    
    if (imagePath && fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
      } catch (error) {
        console.error('Помилка видалення файлу:', error);
      }
    }
    
    const itemsStmt = this.db.db.prepare(`DELETE FROM items WHERE receipt_id = ?`);
    itemsStmt.run([id]);
    
    const stmt = this.db.db.prepare(`DELETE FROM receipts WHERE id = ?`);
    const result = stmt.run([id]);
    
    this.saveDatabase();
    
    return { deleted: result.changes || 0 };
  }

  private saveDatabase() {
    const data = this.db.db.export();
    const dbPath = path.join(process.cwd(), 'data', 'app.db');
    fs.writeFileSync(dbPath, data);
  }
}
