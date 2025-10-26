import initSqlJs from 'sql.js';
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DbService implements OnModuleInit {
  db!: any;

  async onModuleInit() {
    const SQL = await initSqlJs();
    const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const dbPath = path.join(dataDir, 'app.db');
    
    let dbData: Uint8Array | null = null;
    if (fs.existsSync(dbPath)) {
      dbData = fs.readFileSync(dbPath);
    }
    
    this.db = new SQL.Database(dbData);

    // Schema
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS receipts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        store TEXT,
        date TEXT,
        time TEXT,
        subtotal REAL,
        tax REAL,
        total REAL,
        currency TEXT,
        filename TEXT,
        change_amount REAL,
        check_number TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        receipt_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        qty REAL,
        unit_price REAL,
        line_total REAL,
        vat_rate REAL,
        barcode TEXT,
        category TEXT,
        FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE
      );
    `);

    // Save database to file
    const data = this.db.export();
    fs.writeFileSync(dbPath, data);
  }
}
