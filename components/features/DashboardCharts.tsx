'use client'

import { useEffect, useState } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#d4952a', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444']

const MOCK_REVENUE = [
  { month: 'Sep', revenue: 8400 },
  { month: 'Oct', revenue: 12600 },
  { month: 'Nov', revenue: 9800 },
  { month: 'Dec', revenue: 18200 },
  { month: 'Jan', revenue: 14500 },
  { month: 'Feb', revenue: 21300 },
]

const MOCK_CLIENTS = [
  { name: 'ACTIVE', value: 12 },
  { name: 'PROSPECT', value: 8 },
  { name: 'ONBOARDING', value: 5 },
  { name: 'INACTIVE', value: 2 },
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-3 text-sm">
        <p className="text-dark-400 mb-1">{label}</p>
        <p className="text-gold-500 font-semibold">${payload[0].value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export default function DashboardCharts() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue Chart */}
      <div className="card lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-white">Revenue Overview</h3>
            <p className="text-xs text-dark-500 mt-0.5">Last 6 months</p>
          </div>
          <div className="text-xs text-dark-500 bg-dark-800 px-3 py-1 rounded-full">Monthly</div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={MOCK_REVENUE}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4952a" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d4952a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#363843" />
            <XAxis dataKey="month" tick={{ fill: '#9da0aa', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9da0aa', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#d4952a" strokeWidth={2} fill="url(#goldGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Client Status */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4">Client Status</h3>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={MOCK_CLIENTS} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
              {MOCK_CLIENTS.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, 'Clients']} contentStyle={{ background: '#1c1d23', border: '1px solid #363843', borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2 mt-3">
          {MOCK_CLIENTS.map((item, i) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-dark-400">{item.name}</span>
              </div>
              <span className="text-dark-300 font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
