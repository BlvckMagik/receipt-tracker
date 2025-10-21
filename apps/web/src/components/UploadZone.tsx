import React, { useState } from 'react'
import { api } from '../api'

export function UploadZone({ onUploaded }: { onUploaded: ()=>void }) {
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState<string | null>(null)

  const onFile = async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    setLoading(true)
    setLog(null)
    try {
      const r = await api.post('/receipts/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setLog(JSON.stringify(r.data.parsed, null, 2))
      onUploaded()
    } catch (e: any) {
      setLog('Помилка: ' + (e?.message || 'невідома'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ border: '2px dashed #999', padding: 24, borderRadius: 8 }}>
      <input type="file" accept="image/*,.pdf" onChange={e => {
        const f = e.target.files?.[0]
        if (f) onFile(f)
      }} />
      {loading && <p>Обробка OCR...</p>}
      {log && (
        <details style={{ marginTop: 12 }}>
          <summary>Парсинг (debug)</summary>
          <pre style={{ fontSize: 12, background: '#f6f6f6', padding: 12 }}>{log}</pre>
        </details>
      )}
    </div>
  )
}
