/**
 * Дуже прості евристики для парсингу тексту з чека.
 * Під реальні шаблони мереж може знадобитись кастомізація.
 */
export type ParsedReceipt = {
  store: string | null;
  date: string | null;
  currency: string | null;
  subtotal: number | null;
  tax: number | null;
  total: number | null;
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
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // Магазин: перший рядок без чисел і з буквами
  const store = (lines.find(l => /[A-Za-zА-Яа-яІіЇїЄєҐґ]/.test(l) && !/\d{2}[\.\-]\d{2}[\.\-]\d{2,4}/.test(l)) || null);

  // Дата (dd.mm.yyyy або dd-mm-yyyy)
  const dateMatch = text.match(/(\d{2}[\.\-]\d{2}[\.\-]\d{2,4})/);
  const date = dateMatch ? dateMatch[1].replace(/-/g, '.').replace(/(\d{2}\.\d{2}\.)/, (m)=>m)+'': null;

  // Валюта
  const currency = /UAH|грн|₴/i.test(text) ? 'UAH' : null;

  // Знаходимо підсумки
  const totalMatch = text.match(/(РАЗОМ|СУМА|ВСЬОГО|ИТОГО|TOTAL)\D+(\d+[\s\d]*[\.,]\d{2}|\d+)/i);
  const total = totalMatch ? numberize(totalMatch[2]) : null;

  // Пошук ПДВ/податків (не завжди присутні)
  const taxMatch = text.match(/(ПДВ|TAX|VAT)\D+(\d+[\s\d]*[\.,]\d{2}|\d+)/i);
  const tax = taxMatch ? numberize(taxMatch[2]) : null;

  // Спроба знайти "Проміжну суму"/subtotal
  const subMatch = text.match(/(ПРОМІЖН(А|Я) СУМА|SUBTOTAL)\D+(\d+[\s\d]*[\.,]\d{2}|\d+)/i);
  const subtotal = subMatch ? numberize(subMatch[3]) : (total && tax ? Math.max(total - tax, 0) : null);

  // Лінійні позиції: рядки, де в кінці є ціна (XX,YY) і є букви на початку.
  const itemLines = lines.filter(l => /[A-Za-zА-Яа-яІіЇїЄєҐґ]/.test(l) && /(\d+[\.,]\d{2}|\d+)$/.test(l));
  const items = itemLines.map(l => {
    const priceMatch = l.match(/(\d+[\.,]\d{2}|\d+)$/);
    const line_total = priceMatch ? numberize(priceMatch[1]) : null;

    // qty x unit_price (наприклад "2 x 45,50")
    const qtyUnit = l.match(/(\d+[\.,]?\d*)\s*(x|×|х)\s*(\d+[\.,]\d{2})/i);
    const qty = qtyUnit ? numberize(qtyUnit[1]) : null;
    const unit_price = qtyUnit ? numberize(qtyUnit[3]) : null;

    const name = l.replace(/\s*(\d+[\.,]\d{2}|\d+)$/, '').replace(/\s*(\d+[\.,]?\d*)\s*(x|×|х)\s*(\d+[\.,]\d{2})/i, '').trim();

    return { name, qty, unit_price, line_total };
  });

  return { store, date, currency, subtotal, tax, total, items };
}
