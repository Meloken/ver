"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

type ChartsWidgetProps = {
  transactions: any[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#a28cf5", "#ec7498"]

export function ChartsWidget({ transactions }: ChartsWidgetProps) {
  const t = useTranslations("Dashboard")

  // Kategori Bazlı Harcamalar (Sadece Giderler)
  const expenses = transactions.filter((t) => t.type === "expense" && t.convertedTotal)
  const categoryData = Array.from(
    expenses.reduce((acc, curr) => {
      const cat = curr.category?.name || "Other"
      acc.set(cat, (acc.get(cat) || 0) + curr.convertedTotal)
      return acc
    }, new Map<string, number>()).entries()
  )
    .map(([name, value]) => ({ name, value as number }))
    .sort((a, b) => b.value - a.value)
    // take top 5
    .slice(0, 5)

  // Aylık Gelir Gider Özeti
  const monthlyDataMap = new Map<string, { name: string; income: number; expense: number }>()

  transactions.forEach((tx) => {
    if (!tx.issuedAt || !tx.convertedTotal) return
    const d = new Date(tx.issuedAt)
    const month = d.toLocaleString("default", { month: "short", year: "2-digit" })
    
    if (!monthlyDataMap.has(month)) {
      monthlyDataMap.set(month, { name: month, income: 0, expense: 0 })
    }
    const record = monthlyDataMap.get(month)!
    if (tx.type === "income") record.income += tx.convertedTotal
    if (tx.type === "expense") record.expense += tx.convertedTotal
  })

  // Son 6 ay
  const monthlyData = Array.from(monthlyDataMap.values()).slice(0, 6).reverse()

  if (transactions.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
      {/* Giderler Pasta Grafiği */}
      <Card>
        <CardHeader>
          <CardTitle>Top Categories</CardTitle>
          <CardDescription>Your highest expenses by category</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gelir / Gider Sütun Grafiği */}
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expense</CardTitle>
          <CardDescription>Monthly cash flow</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
