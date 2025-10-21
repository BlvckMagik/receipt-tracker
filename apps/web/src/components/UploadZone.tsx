import React, { useState, useRef } from 'react'
import { api } from '../api'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Upload, FileText, Loader2 } from 'lucide-react'

export function UploadZone({ onUploaded }: { onUploaded: ()=>void }) {
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Завантажити чек
        </CardTitle>
        <CardDescription>
          Перетягніть файл сюди або натисніть для вибору файлу
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={loading}
          />
          
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Обробка OCR...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Підтримуються формати: JPG, PNG, PDF
              </p>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="mt-2"
              >
                Вибрати файл
              </Button>
            </div>
          )}
        </div>

        {log && (
          <Alert className="mt-4">
            <AlertDescription>
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">
                  Парсинг (debug)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto">
                  {log}
                </pre>
              </details>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
