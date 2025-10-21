import React, { useEffect, useState } from 'react'
import { UploadZone } from './components/UploadZone'
import { api } from './api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table'
import { Badge } from './components/ui/badge'
import { Receipt, Calendar, Store, FileText, DollarSign } from 'lucide-react'

type ReceiptData = {
  id: number
  store?: string
  date?: string
  total?: number
  items_count: number
  filename?: string
}

export default function App() {
  const [receipts, setReceipts] = useState<ReceiptData[]>([])

  const refresh = async () => {
    const r = await api.get('/receipts')
    setReceipts(r.data)
  }

  useEffect(() => { refresh() }, [])

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('uk-UA')
  }

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '—'
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH'
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Receipt Tracker</h1>
          <p className="text-muted-foreground">
            Відстежуйте свої витрати з автоматичним розпізнаванням чеків
          </p>
        </div>

        <div className="mb-8">
          <UploadZone onUploaded={refresh} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Останні чеки
            </CardTitle>
            <CardDescription>
              Список всіх оброблених чеків
            </CardDescription>
          </CardHeader>
          <CardContent>
            {receipts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Поки що немає чеків</p>
                <p className="text-sm">Завантажте перший чек, щоб почати</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4" />
                          Магазин
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Дата
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <DollarSign className="h-4 w-4" />
                          Сума
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Позицій</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Файл
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipts.map((receipt) => (
                      <TableRow key={receipt.id}>
                        <TableCell className="font-medium">
                          #{receipt.id}
                        </TableCell>
                        <TableCell>
                          {receipt.store ? (
                            <Badge variant="secondary">{receipt.store}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatDate(receipt.date)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(receipt.total)}
                        </TableCell>
                        <TableCell className="text-right">
                          {receipt.items_count}
                        </TableCell>
                        <TableCell>
                          {receipt.filename ? (
                            <span className="text-sm text-muted-foreground">
                              {receipt.filename}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
