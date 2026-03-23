'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import Badge, { ROLE_CONFIG } from '@/components/ui/Badge'
import { useEffect, useState } from 'react'

export default function ConfiguracoesPage() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState(null)
  const [showPw, setShowPw] = useState(false)

  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then(d => {
      setUser(d.user)
      if (d.user?.profile?.role === 'admin') {
        fetch('/api/dashboard').then(r => r.json()).then(setStats).catch(() => {})
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleChangePassword = async (e) => {
    e.preventDefault(); setPwMsg(null)
    if (pwForm.newPw !== pwForm.confirm) { setPwMsg({ type: 'error', text: 'As senhas não coincidem.' }); return }
    if (pwForm.newPw.length < 6) { setPwMsg({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' }); return }
    setPwLoading(true)
    const res = await fetch('/api/auth/change-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw })
    })
    const data = await res.json()
    if (res.ok) { setPwMsg({ type: 'success', text: 'Senha alterada com sucesso!' }); setPwForm({ current: '', newPw: '', confirm: '' }) }
    else { setPwMsg({ type: 'error', text: data.error || 'Erro ao alterar senha.' }) }
    setPwLoading(false)
  }

  const isAdmin = user?.profile?.role === 'admin'
  const initials = user?.profile?.name
    ? user.profile.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : (user?.email?.[0] || 'U').toUpperCase()

  return (
    <DashboardLayout title="Configurações">
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#E31E24] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="max-w-3xl space-y-6">
          {/* Perfil */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Meu Perfil</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-[#E31E24] flex items-center justify-center text-white font-bold text-xl">
                {initials}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{user?.profile?.name || '—'}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <div className="mt-1">
                  <Badge value={user?.profile?.role} config={ROLE_CONFIG} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Área</p>
                <p className="text-gray-900">{user?.profile?.area || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Membro desde</p>
                <p className="text-gray-900">
                  {user?.profile?.created_at ? new Date(user.profile.created_at).toLocaleDateString('pt-BR') : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Alterar Senha */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Alterar Senha</h2>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
              {pwMsg && (
                <div className={`text-sm rounded-lg px-4 py-3 ${pwMsg.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
                  {pwMsg.text}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
                <input required type={showPw ? 'text' : 'password'} value={pwForm.current}
                  onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                <input required type={showPw ? 'text' : 'password'} value={pwForm.newPw}
                  onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" placeholder="Mínimo 6 caracteres" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                <input required type={showPw ? 'text' : 'password'} value={pwForm.confirm}
                  onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="showpw" checked={showPw} onChange={e => setShowPw(e.target.checked)} className="rounded" />
                <label htmlFor="showpw" className="text-sm text-gray-600">Mostrar senhas</label>
              </div>
              <button type="submit" disabled={pwLoading}
                className="bg-[#E31E24] hover:bg-[#B01519] disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
                {pwLoading ? 'Salvando...' : 'Alterar Senha'}
              </button>
            </form>
          </div>

          {/* Painel Admin */}
          {isAdmin && stats && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Visão Geral do Sistema</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Usuários', value: stats?.usuarios_total, icon: '👥' },
                  { label: 'Tarefas', value: stats?.tarefas?.total, icon: '📋' },
                  { label: 'Clientes Ativos', value: stats?.clientes?.ativos, icon: '✓' },
                  { label: 'Churn', value: stats?.clientes?.churn, icon: '✕' },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl mb-1">{item.icon}</p>
                    <p className="text-2xl font-bold text-gray-900">{item.value ?? '—'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info do Sistema */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Sobre o Sistema</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Sistema</span>
                <span className="font-medium">Arkad Task System</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Versão</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Framework</span>
                <span className="font-medium">Next.js 14</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Banco de Dados</span>
                <span className="font-medium">Supabase (PostgreSQL)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
