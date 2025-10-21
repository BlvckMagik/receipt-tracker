export type Receipt = {
  id: number;
  store: string | null;
  date: string | null; // ISO date
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  currency: string | null;
  filename: string | null;
  created_at: string;
};

export type ReceiptItem = {
  id: number;
  receipt_id: number;
  name: string;
  qty: number | null;
  unit_price: number | null;
  line_total: number | null;
  vat_rate: number | null;
  barcode: string | null;
  category: string | null;
};
