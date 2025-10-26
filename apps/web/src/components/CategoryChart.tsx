import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react'

type CategoryStat = {
  category: string
  items_count: number
  total_amount: number
  avg_amount: number
}

interface CategoryChartProps {
  data: CategoryStat[]
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
]

export function CategoryChart({ data }: CategoryChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH'
    }).format(amount)
  }

  const totalAmount = data.reduce((sum, item) => sum + item.total_amount, 0)

  const pieData = data.map((item, index) => ({
    name: item.category,
    value: item.total_amount,
    color: COLORS[index % COLORS.length],
    percentage: ((item.total_amount / totalAmount) * 100).toFixed(1)
  }))

  const barData = data.map((item, index) => ({
    name: item.category.length > 15 ? item.category.substring(0, 15) + '...' : item.category,
    fullName: item.category,
    amount: item.total_amount,
    items: item.items_count,
    color: COLORS[index % COLORS.length]
  }))

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Витрати по категоріях
          </CardTitle>
          <CardDescription>
            Аналіз витрат по категоріях товарів
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Немає даних для відображення</p>
            <p className="text-sm">Завантажте чеки, щоб побачити статистику</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Витрати по категоріях
        </CardTitle>
        <CardDescription>
          Аналіз витрат по категоріях товарів
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Загальна статистика */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(totalAmount)}
              </div>
              <div className="text-sm text-muted-foreground">Загальна сума</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {data.length}
              </div>
              <div className="text-sm text-muted-foreground">Категорій</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {data.reduce((sum, item) => sum + item.items_count, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Товарів</div>
            </div>
          </div>

          {/* Кругова діаграма */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Розподіл витрат</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>          

          {/* Детальна таблиця */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Детальна статистика</h3>
            <div className="space-y-2">
              {data.map((item, index) => (
                <div key={item.category} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <div className="font-medium">{item.category}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.items_count} товарів • Середня ціна: {formatCurrency(item.avg_amount)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(item.total_amount)}</div>
                    <div className="text-sm text-muted-foreground">
                      {((item.total_amount / totalAmount) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
