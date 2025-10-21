import React, { useEffect, useState } from 'react'
import { UploadZone } from './components/UploadZone'
import { ReceiptDetails } from './components/ReceiptDetails'
import { api } from './api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Receipt, Calendar, Store, FileText, DollarSign, Clock, Receipt as ReceiptIcon, Coins, Hash, ChevronDown, ChevronRight } from 'lucide-react'

type ReceiptData = {
  id: number
  store?: string
  date?: string
  time?: string
  subtotal?: number
  tax?: number
  total?: number
  currency?: string
  change_amount?: number
  check_number?: string
  items_count: number
  filename?: string
}

export default function App() {
  const [receipts, setReceipts] = useState<ReceiptData[]>([])
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [receiptDetails, setReceiptDetails] = useState<Record<number, any>>({})

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

  const toggleRow = async (receiptId: number) => {
    const isExpanded = expandedRows.has(receiptId)
    
    if (isExpanded) {
      setExpandedRows(prev => {
        const newSet = new Set(prev)
        newSet.delete(receiptId)
        return newSet
      })
    } else {
      try {
        const response = await api.get(`/receipts/${receiptId}`)
        setReceiptDetails(prev => ({
          ...prev,
          [receiptId]: response.data
        }))
        setExpandedRows(prev => new Set(prev).add(receiptId))
      } catch (error) {
        console.error('Помилка завантаження деталей чеку:', error)
      }
    }
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
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead className="w-[80px]">ID</TableHead>
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
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Час
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <DollarSign className="h-4 w-4" />
                          Підсумок
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Coins className="h-4 w-4" />
                          Податок
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <DollarSign className="h-4 w-4" />
                          Всього
                        </div>
                      </TableHead>
                      <TableHead className="text-center">Валюта</TableHead>
                      <TableHead className="text-right">Здача</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          Чек №
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
                      <React.Fragment key={receipt.id}>
                        <TableRow>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRow(receipt.id)}
                              className="h-8 w-8 p-0"
                            >
                              {expandedRows.has(receipt.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
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
                          <TableCell>
                            {receipt.time || <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(receipt.subtotal)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(receipt.tax)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(receipt.total)}
                          </TableCell>
                          <TableCell className="text-center">
                            {receipt.currency ? (
                              <Badge variant="outline">{receipt.currency}</Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {receipt.change_amount ? formatCurrency(receipt.change_amount) : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell>
                            {receipt.check_number ? (
                              <Badge variant="outline">#{receipt.check_number}</Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
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
                        {expandedRows.has(receipt.id) && receiptDetails[receipt.id] && (
                          <TableRow>
                            <TableCell colSpan={13} className="p-0">
                              <ReceiptDetails details={receiptDetails[receipt.id]} />
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
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
