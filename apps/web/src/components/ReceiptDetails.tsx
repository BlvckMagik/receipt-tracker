import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Package, Tag, DollarSign, Hash } from 'lucide-react'

type ReceiptItem = {
  id: number
  name: string
  qty: number | null
  unit_price: number | null
  line_total: number | null
  category: string | null
}

type ReceiptDetails = {
  receipt: {
    id: number
    store: string | null
    date: string | null
    time: string | null
    subtotal: number | null
    tax: number | null
    total: number | null
    currency: string | null
    change_amount: number | null
    check_number: string | null
    filename: string | null
  }
  items: ReceiptItem[]
}

interface ReceiptDetailsProps {
  details: ReceiptDetails
}

export function ReceiptDetails({ details }: ReceiptDetailsProps) {
  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null) return '—'
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH'
    }).format(amount)
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('uk-UA')
  }

  const categories = details.items.reduce((acc, item) => {
    if (item.category) {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
    }
    return acc
  }, {} as Record<string, ReceiptItem[]>)

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Деталі чеку
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Магазин:</span>
              <span className="text-sm font-medium">{details.receipt.store || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Дата:</span>
              <span className="text-sm">{formatDate(details.receipt.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Час:</span>
              <span className="text-sm">{details.receipt.time || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Чек №:</span>
              <span className="text-sm">{details.receipt.check_number || '—'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Суми
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Підсумок:</span>
              <span className="text-sm">{formatCurrency(details.receipt.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Податок:</span>
              <span className="text-sm">{formatCurrency(details.receipt.tax)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-sm">Всього:</span>
              <span className="text-sm">{formatCurrency(details.receipt.total)}</span>
            </div>
            {details.receipt.change_amount && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Здача:</span>
                <span className="text-sm">{formatCurrency(details.receipt.change_amount)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Категорії
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {Object.keys(categories).length > 0 ? (
                Object.keys(categories).map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Немає категорій</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4" />
            Товари ({details.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Назва товару</TableHead>
                  <TableHead className="text-right">Кількість</TableHead>
                  <TableHead className="text-right">Ціна за одиницю</TableHead>
                  <TableHead className="text-right">Загальна ціна</TableHead>
                  <TableHead>Категорія</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">
                      {item.qty || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unit_price)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.line_total)}
                    </TableCell>
                    <TableCell>
                      {item.category ? (
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
