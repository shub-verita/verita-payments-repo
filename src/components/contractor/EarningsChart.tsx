"use client"

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts"

interface EarningsData {
  month: string
  paid: number
  pending: number
}

interface EarningsChartProps {
  data: EarningsData[]
}

export function EarningsChart({ data }: EarningsChartProps) {
  // Format month labels
  const formattedData = data.map(item => ({
    ...item,
    monthLabel: new Date(item.month + "-01").toLocaleDateString("en-US", { 
      month: "short",
      year: "2-digit"
    })
  }))

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="monthLabel" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend />
          <Bar 
            dataKey="paid" 
            name="Paid" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]}
            stackId="a"
          />
          <Bar 
            dataKey="pending" 
            name="Pending" 
            fill="#93c5fd" 
            radius={[4, 4, 0, 0]}
            stackId="a"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
