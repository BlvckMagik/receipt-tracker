import React, { useEffect, useState } from 'react'
import { UploadZone } from './components/UploadZone'
import { api } from './api'

type Receipt = any

export default function App() {
  const [receipts, setReceipts] = useState<Receipt[]>([])

  const refresh = async () => {
    const r = await api.get('/receipts')
    setReceipts(r.data)
  }

  useEffect(() => { refresh() }, [])

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      <h1>Receipt Tracker</h1>
      <UploadZone onUploaded={refresh} />

      <h2 style={{ marginTop: 24 }}>Останні чеки</h2>
      <table width="100%" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th align="left">ID</th>
            <th align="left">Магазин</th>
            <th align="left">Дата</th>
            <th align="right">Сума</th>
            <th align="right">Позицій</th>
            <th align="left">Файл</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map((r: any) => (
            <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{r.id}</td>
              <td>{r.store || '—'}</td>
              <td>{r.date || '—'}</td>
              <td align="right">{r.total ?? '—'}</td>
              <td align="right">{r.items_count}</td>
              <td>{r.filename || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
