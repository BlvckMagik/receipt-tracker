import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service.js';
import { OcrService } from '../ocr/ocr.service.js';
import { parseReceiptText } from '../ocr/parse.js';

@Injectable()
export class ReceiptsService {
  constructor(private readonly db: DbService, private readonly ocr: OcrService) {}

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
    if (q) { parts.push(`name LIKE '%${q}%'`); }
    if (category) { parts.push(`category = '${category}'`); }
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
    for (const f of fields) {
      if (f in body) { sets.push(`${f} = '${body[f]}'`); }
    }
    if (!sets.length) {
      return { updated: 0 };
    }
    
    this.db.db.exec(`UPDATE items SET ${sets.join(', ')} WHERE id = ${id}`);
    return { updated: 1 };
  }

  async processUpload(filePath: string, originalName: string) {
    const text = await this.ocr.extractText(filePath);
    const parsed = parseReceiptText(text);

    // Insert receipt
    this.db.db.exec(`
      INSERT INTO receipts (store, date, subtotal, tax, total, currency, filename, time, change_amount, check_number)
      VALUES ('${parsed.store}', '${parsed.date}', ${parsed.subtotal}, ${parsed.tax}, ${parsed.total}, '${parsed.currency}', '${originalName}', '${parsed.time}', ${parsed.change}, '${parsed.checkNumber}')
    `);

    // Get the last inserted ID
    const result = this.db.db.exec(`SELECT last_insert_rowid() as id`);
    const receiptId = result[0]?.values[0][0];

    // Insert items
    for (const it of parsed.items) {
      this.db.db.exec(`
        INSERT INTO items (receipt_id, name, qty, unit_price, line_total, vat_rate, barcode, category)
        VALUES (${receiptId}, '${it.name}', ${it.qty}, ${it.unit_price}, ${it.line_total}, NULL, NULL, NULL)
      `);
    }

    return { id: receiptId, parsed, text };
  }
}
