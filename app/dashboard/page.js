'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import Badge, { PRIORITY_CONFIG, STATUS_CONFIG } from '@/components/ui/Badge'
import { useEffect, useMemo, useState } from 'react'

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'all', label: 'Todos' },
]

function getPeriodDates(period) {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  if (period === 'today') return { dateFrom: today, dateTo: today }
  if (period === 'week') {
    const start = new Date(now); start.setDate(now.getDate() - now.getDay())
    return { dateFrom: start.toISOString().split('T')[0], dateTo: today }
  }
  if (period === 'month') {
    return { dateFrom: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`, dateTo: today }
  }
  if (period === 'quarter') {
    const start = new Date(now); start.setMonth(now.getMonth() - 3)
    return { dateFrom: start.toISOString().split('T')[0], dateTo: today }
  }
  return {}
}

function MetricCard({ label, value, sub, color = 'gray', icon }) {
  const colors = {
    red: 'border-l-[#E31E24] bg-red-50',
    blue: 'border-l-blue-500 bg-blue-50',
    green: 'border-l-green-500 bg-green-50',
    yellow: 'border-l-yellow-500 bg-yellow-50',
    orange: 'border-l-orange-500 bg-orange-50',
    gray: 'border-l-gray-400 bg-gray-50',
  }
  return (
    <div className={`bg-white rounded-xl border border-gray-100 border-l-4 p-5 shadow-sm ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
          {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
        </div>
        {icon && <span className="text-2xl opacity-60">{icon}</span>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [period, setPeriod] = useState('month')
  const [memberId, setMemberId] = useState('')
  const [loading, setLoading] = useState(true)

  const dates = useMemo(() => getPeriodDates(period), [period])

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(setUsers).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (memberId) params.set('responsavel_id', memberId)
    if (dates.dateFrom) params.set('date_from', dates.dateFrom)
    if (dates.dateTo) params.set('date_to', dates.dateTo)

    fetch(`/api/dashboard?${params}`)
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [period, memberId, dates])

  const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

  return (
    <DashboardLayout title="Dashboard">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === opt.value
                  ? 'bg-[#E31E24] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <select
          value={memberId}
          onChange={e => setMemberId(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#E31E24]"
        >
          <option value="">Todos os membros</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name || u.email}</option>
          ))}
        </select>
        {(memberId || period !== 'month') && (
          <button
            onClick={() => { setMemberId(''); setPeriod('month') }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#E31E24] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Métricas de Tarefas */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Tarefas</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <MetricCard label="Total" value={stats?.tarefas?.total} icon="📋" />
              <MetricCard label="Pendentes" value={stats?.tarefas?.pendentes} color="gray" icon="⏳" />
              <MetricCard label="Em Andamento" value={stats?.tarefas?.em_andamento} color="blue" icon="▶" />
              <MetricCard label="Concluídas" value={stats?.tarefas?.concluidas} color="green" icon="✓" />
              <MetricCard label="Atrasadas" value={stats?.tarefas?.atrasadas} color="red" icon="⚠" />
              <MetricCard label="Canceladas" value={stats?.tarefas?.canceladas} color="gray" icon="✕" />
            </div>
          </div>

          {/* Métricas de Clientes */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Clientes</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard label="Total" value={stats?.clientes?.total} icon="👥" />
              <MetricCard label="Ativos" value={stats?.clientes?.ativos} color="green" icon="✓" />
              <MetricCard label="Em Risco" value={stats?.clientes?.risco} color="orange" icon="⚠" />
              <MetricCard label="Churn" value={stats?.clientes?.churn} color="red" icon="✕" />
            </div>
            <div className="mt-4">
              <MetricCard
                label="MRR (Receita Mensal Recorrente)"
                value={formatCurrency(stats?.clientes?.mrr)}
                color="green"
                icon="💰"
                sub="Apenas clientes ativos"
              />
            </div>
          </div>

          {/* Por Prioridade */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Distribuição por Prioridade</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard label="Urgente" value={stats?.por_prioridade?.urgente} color="red" icon="🔴" />
              <MetricCard label="Alta" value={stats?.por_prioridade?.alta} color="orange" icon="🟠" />
              <MetricCard label="Média" value={stats?.por_prioridade?.media} color="yellow" icon="🟡" />
              <MetricCard label="Baixa" value={stats?.por_prioridade?.baixa} color="green" icon="🟢" />
            </div>
          </div>

          {/* Tarefas Atrasadas */}
          {stats?.tarefas_atrasadas_lista?.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Tarefas Atrasadas ({stats.tarefas_atrasadas_lista.length})
              </h2>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Tarefa</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Responsável</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Prazo</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Prioridade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.tarefas_atrasadas_lista.map(t => (
                      <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{t.titulo}</td>
                        <td className="px-4 py-3 text-gray-600">{t.responsavel?.name || '—'}</td>
                        <td className="px-4 py-3 text-red-600 font-medium">
                          {t.data_vencimento ? new Date(t.data_vencimento).toLocaleDateString('pt-BR') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge value={t.prioridade} config={PRIORITY_CONFIG} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  )
}
