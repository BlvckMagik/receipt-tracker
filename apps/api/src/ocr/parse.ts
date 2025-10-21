/**
 * Парсер для українських фіскальних чеків.
 * Оптимізований для чеків з ПРРО (Програма реєстрації розрахункових операцій).
 */
import { preprocessReceiptText, improveDigitRecognition, UKRAINIAN_RECEIPT_PATTERNS } from './ukrainian-receipt-patterns.js';
export type ParsedReceipt = {
  store: string | null;
  date: string | null;
  time: string | null;
  currency: string | null;
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  change: number | null;
  checkNumber: string | null;
  items: { name: string; qty: number | null; unit_price: number | null; line_total: number | null; }[];
};

const numberize = (s: string | null | undefined): number | null => {
  if (!s) return null;
  // замінюємо кому на крапку, прибираємо пробіли
  const cleaned = s.replace(/\s/g, '').replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

export function parseReceiptText(text: string): ParsedReceipt {
  // Попередня обробка тексту
  const processedText = improveDigitRecognition(preprocessReceiptText(text));
  const lines = processedText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // Магазин: використовуємо патерни з константи
  let store = null;
  for (const pattern of UKRAINIAN_RECEIPT_PATTERNS.STORE_PATTERNS) {
    const match = processedText.match(pattern);
    if (match) {
      store = match[0].trim();
      break;
    }
  }

  // Дата та час
  const dateMatch = processedText.match(/(\d{2}[\.\-]\d{2}[\.\-]\d{2,4})/);
  const date = dateMatch ? dateMatch[1].replace(/-/g, '.') : null;
  
  const timeMatch = processedText.match(/(\d{1,2}[-:]\d{2}[-:]\d{2})/);
  const time = timeMatch ? timeMatch[1] : null;

  // Валюта
  const currency = /UAH|грн|₴/i.test(processedText) ? 'UAH' : null;

  // Номер чека: використовуємо патерни з константи
  let checkNumber = null;
  for (const pattern of UKRAINIAN_RECEIPT_PATTERNS.CHECK_NUMBER_PATTERNS) {
    const match = processedText.match(pattern);
    if (match) {
      checkNumber = match[1] || match[0].trim();
      break;
    }
  }

  // Сума: використовуємо патерни з константи
  let total = null;
  for (const pattern of UKRAINIAN_RECEIPT_PATTERNS.AMOUNT_PATTERNS) {
    const match = processedText.match(pattern);
    if (match) {
      total = numberize(match[1]);
      break;
    }
  }

  // ПДВ: використовуємо патерни з константи
  let tax = null;
  for (const pattern of UKRAINIAN_RECEIPT_PATTERNS.TAX_PATTERNS) {
    const match = processedText.match(pattern);
    if (match) {
      tax = numberize(match[1]);
      break;
    }
  }

  // Решта: використовуємо патерни з константи
  let change = null;
  for (const pattern of UKRAINIAN_RECEIPT_PATTERNS.CHANGE_PATTERNS) {
    const match = processedText.match(pattern);
    if (match) {
      change = numberize(match[1]);
      break;
    }
  }

  // Проміжна сума (якщо є)
  const subMatch = processedText.match(/(ПРОМІЖН(А|Я)\s*СУМА|СУМА\s*БЕЗ\s*ПДВ)\s*(\d+[\s\d]*[\.,]\d{2}|\d+)/i);
  let subtotal = subMatch ? numberize(subMatch[3]) : null;
  
  // Якщо не знайшли проміжну суму, але є загальна сума та ПДВ, обчислюємо
  if (!subtotal && total && tax) {
    subtotal = Math.max(total - tax, 0);
  }
  
  // Для чеків типу "Львівхолод" шукаємо "СУМА" як проміжну суму
  if (!subtotal) {
    const sumMatch = processedText.match(/СУМА\s*(\d+[\s\d]*[\.,]\d{2}|\d+)/i);
    if (sumMatch) {
      subtotal = numberize(sumMatch[1]);
    }
  }

  // Товари: шукаємо рядки з кількістю x ціна та рядки з назвами товарів
  const itemLines = lines.filter(l => {
    // Використовуємо патерни з константи
    const hasItemPattern = UKRAINIAN_RECEIPT_PATTERNS.ITEM_PATTERNS.some(pattern => pattern.test(l));
    const hasItemNamePattern = UKRAINIAN_RECEIPT_PATTERNS.ITEM_NAME_PATTERNS.some(pattern => pattern.test(l));
    const isNotSummary = !/СУМА|ПДВ|РЕШТА|ЧЕК|ФОП|магазин|ГОТІВКА|ДО СПЛАТИ|ТОВАРІВ|АРТИКУЛІВ|ГОТІВКА|Заокруглення|ОНЛАЙН|Оператор|ΠΗ|ІД|Z:|Касса|УКРАЇНА/i.test(l);
    return (hasItemPattern || hasItemNamePattern) && isNotSummary;
  });

  // Простіший підхід: обробляємо кожен рядок окремо
  const items = [];
  const processedLines = new Set(); // Для уникнення дублікатів
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Пропускаємо вже оброблені рядки
    if (processedLines.has(i)) continue;
    
    // Перевіряємо, чи це рядок з кількістю x ціна
    const qtyMatch = line.match(/(\d+[\.,]?\d*)\s*(x|×|х|X)\s*(\d+[\.,]\d{2})/i);
    if (qtyMatch) {
      const qty = numberize(qtyMatch[1]);
      const unit_price = numberize(qtyMatch[3]);
      
      // Шукаємо назву товару в наступних рядках
      let name = '';
      let line_total = null;
      
      // Шукаємо в наступних 2 рядках
      for (let j = 1; j <= 2 && i + j < lines.length; j++) {
        const nextLine = lines[i + j];
        
        // Якщо рядок містить назву товару
        if (/[А-ЯІЇЄҐа-яіїєґ]/.test(nextLine) && 
            !/\d+[\.,]\d{2}/.test(nextLine) && 
            !/СУМА|ПДВ|РЕШТА|ЧЕК|ФОП|магазин|ГОТІВКА|ДО СПЛАТИ|ТОВАРІВ|АРТИКУЛІВ|ГОТІВКА|Заокруглення|ОНЛАЙН|Оператор|ΠΗ|ІД|Z:|Касса|УКРАЇНА/i.test(nextLine) &&
            !UKRAINIAN_RECEIPT_PATTERNS.ITEM_PATTERNS.some(pattern => pattern.test(nextLine))) {
          name = nextLine.trim();
          processedLines.add(i + j); // Позначаємо рядок з назвою як оброблений
          
          // Шукаємо суму в наступному рядку після назви
          if (i + j + 1 < lines.length) {
            const totalLine = lines[i + j + 1];
            const totalMatch = totalLine.match(/(\d+[\.,]\d{2})\s*A$/i);
            if (totalMatch) {
              line_total = numberize(totalMatch[1]);
              processedLines.add(i + j + 1); // Позначаємо рядок з сумою як оброблений
            }
          }
          break;
        }
        
        // Шукаємо суму в поточному рядку
        const totalMatch = nextLine.match(/(\d+[\.,]\d{2})\s*A$/i);
        if (totalMatch) {
          line_total = numberize(totalMatch[1]);
          processedLines.add(i + j); // Позначаємо рядок з сумою як оброблений
        }
      }
      
      items.push({
        name: name || 'Товар',
        qty,
        unit_price,
        line_total
      });
    }
    
    // Перевіряємо, чи це рядок з назвою товару без кількості
    else if (/[А-ЯІЇЄҐа-яіїєґ]/.test(line) && 
             !/\d+[\.,]\d{2}/.test(line) && 
             !/СУМА|ПДВ|РЕШТА|ЧЕК|ФОП|магазин|ГОТІВКА|ДО СПЛАТИ|ТОВАРІВ|АРТИКУЛІВ|ГОТІВКА|Заокруглення|ОНЛАЙН|Оператор|ΠΗ|ІД|Z:|Касса|УКРАЇНА|Тзов|ТВК|ЛЬВІВСЬКА|РАДЕХІВСЬКИЙ|ЛОПАТИН|СТРІЛЬЦІВ/i.test(line) &&
             !UKRAINIAN_RECEIPT_PATTERNS.ITEM_PATTERNS.some(pattern => pattern.test(line))) {
      
      // Шукаємо суму в наступному рядку
      let line_total = null;
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const totalMatch = nextLine.match(/(\d+[\.,]\d{2})\s*A$/i);
        if (totalMatch) {
          line_total = numberize(totalMatch[1]);
          processedLines.add(i + 1); // Позначаємо рядок з сумою як оброблений
        }
      }
      
      items.push({
        name: line.trim(),
        qty: 1,
        unit_price: line_total,
        line_total
      });
    }
  }

  return { store, date, time, currency, subtotal, tax, total, change, checkNumber, items };
}
