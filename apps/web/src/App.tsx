import React, { useEffect, useState } from 'react'
import { UploadZone } from './components/UploadZone'
import { ReceiptDetails } from './components/ReceiptDetails'
import { CategoryChart } from './components/CategoryChart'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { api } from './api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Receipt, Calendar, Store, FileText, DollarSign, Clock, Receipt as ReceiptIcon, Coins, Hash, ChevronDown, ChevronRight, BarChart3, Trash2 } from 'lucide-react'

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

type CategoryStat = {
  category: string
  items_count: number
  total_amount: number
  avg_amount: number
}

export default function App() {
  const [receipts, setReceipts] = useState<ReceiptData[]>([])
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [receiptDetails, setReceiptDetails] = useState<Record<number, any>>({})
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([])

  const refresh = async () => {
    try {
      const r = await api.get('/receipts')
      // API повертає {receipts: [], message: "..."}
      setReceipts(r.data || [])
    } catch (error) {
      console.error('Помилка завантаження чеків:', error)
      setReceipts([])
    }
    refreshStats()
  }

  const refreshStats = async () => {
    try {
      const r = await api.get('/receipts/stats/categories')
      setCategoryStats(r.data || [])
    } catch (error) {
      console.error('Помилка завантаження статистики:', error)
      setCategoryStats([])
    }
  }

  useEffect(() => { 
    refresh()
    refreshStats()
  }, [])

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

  const handleDelete = async (receiptId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    if (!confirm('Ви впевнені, що хочете видалити цей чек?')) {
      return
    }
    
    try {
      await api.delete(`/receipts/${receiptId}`)
      refresh()
      refreshStats()
    } catch (error) {
      console.error('Помилка видалення чеку:', error)
      alert('Не вдалося видалити чек')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PWAInstallPrompt />
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

        <div className="mb-8">
          <CategoryChart data={categoryStats} />
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
                          Дата та час
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <DollarSign className="h-4 w-4" />
                          Всього
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Позицій</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Файл
                        </div>
                      </TableHead>
                      <TableHead className="w-[50px]"></TableHead>
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
                            <div className="flex flex-col">
                              <span>{formatDate(receipt.date)}</span>
                              {receipt.time && (
                                <span className="text-xs text-muted-foreground">{receipt.time}</span>
                              )}
                            </div>
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
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleDelete(receipt.id, e)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        {expandedRows.has(receipt.id) && receiptDetails[receipt.id] && (
                          <TableRow>
                            <TableCell colSpan={7} className="p-0">
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
