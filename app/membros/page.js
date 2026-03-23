'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import Badge, { PRIORITY_CONFIG, ROLE_CONFIG, STATUS_CONFIG } from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { useEffect, useState } from 'react'

const EMPTY_TASK = {
  titulo: '', descricao: '', responsavel_id: '', cliente_id: '',
  prioridade: 'media', status: 'pendente', data_vencimento: '',
}

export default function MembrosPage() {
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [assignUser, setAssignUser] = useState(null)
  const [form, setForm] = useState(EMPTY_TASK)
  const [formLoading, setFormLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'usuario', area: '', password: '', confirmPassword: '' })
  const [memberError, setMemberError] = useState('')
  const [memberLoading, setMemberLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then(d => setCurrentUser(d.user)).catch(() => {})
    Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch('/api/tasks').then(r => r.json()),
      fetch('/api/clients').then(r => r.json()),
    ]).then(([u, t, c]) => {
      setUsers(u); setTasks(t); setClients(c)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const getTasksForUser = (userId) => tasks.filter(t => t.responsavel_id === userId)
  const getActiveCount = (userId) => getTasksForUser(userId).filter(t => !['concluida', 'cancelada'].includes(t.status)).length
  const getDoneCount = (userId) => getTasksForUser(userId).filter(t => t.status === 'concluida').length
  const getLateCount = (userId) => getTasksForUser(userId).filter(t => t.status === 'atrasada').length

  const isAdmin = currentUser?.profile?.role === 'admin'

  const handleAssign = async (e) => {
    e.preventDefault(); setFormLoading(true)
    const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) {
      const newTask = await res.json()
      setTasks(prev => [...prev, newTask])
      setAssignUser(null); setForm(EMPTY_TASK)
    }
    setFormLoading(false)
  }

  const handleCreateMember = async (e) => {
    e.preventDefault(); setMemberError('')
    if (newMember.password !== newMember.confirmPassword) { setMemberError('As senhas não coincidem.'); return }
    if (newMember.password.length < 6) { setMemberError('A senha deve ter pelo menos 6 caracteres.'); return }
    setMemberLoading(true)
    const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newMember) })
    const data = await res.json()
    if (!res.ok) { setMemberError(data.error || 'Erro ao criar membro.'); setMemberLoading(false); return }
    setUsers(prev => [...prev, data])
    setShowCreate(false); setNewMember({ name: '', email: '', role: 'usuario', area: '', password: '', confirmPassword: '' })
    setMemberLoading(false)
  }

  const roleCounts = { admin: 0, gestor: 0, financeiro: 0, usuario: 0 }
  users.forEach(u => { if (roleCounts[u.role] !== undefined) roleCounts[u.role]++ })

  return (
    <DashboardLayout title="Membros">
      {/* Resumo de perfis */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[['admin', 'Administrador'], ['gestor', 'Gestor'], ['financeiro', 'Financeiro'], ['usuario', 'Usuário']].map(([key, label]) => (
          <div key={key} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
            <p className="text-gray-500 text-xs font-medium mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{roleCounts[key]}</p>
          </div>
        ))}
      </div>

      {/* Header com botão */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          {users.length} membro{users.length !== 1 ? 's' : ''} — atribua tarefas diretamente a cada pessoa
        </h2>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)}
            className="bg-[#E31E24] hover:bg-[#B01519] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2">
            + Novo Membro
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#E31E24] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {users.map(u => {
            const userTasks = getTasksForUser(u.id)
            const isExpanded = expanded === u.id
            return (
              <div key={u.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  <div className="w-11 h-11 rounded-full bg-[#E31E24] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(u.name || u.email || 'U').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{u.name || '—'}</p>
                      <Badge value={u.role} config={ROLE_CONFIG} />
                    </div>
                    <p className="text-sm text-gray-500">{u.email}</p>
                    <div className="flex gap-4 mt-1 text-xs text-gray-400">
                      <span>⏳ {getActiveCount(u.id)} ativas</span>
                      <span className="text-green-600">✓ {getDoneCount(u.id)} concluídas</span>
                      {getLateCount(u.id) > 0 && <span className="text-red-600">⚠ {getLateCount(u.id)} atrasadas</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setAssignUser(u); setForm({ ...EMPTY_TASK, responsavel_id: u.id }) }}
                      className="bg-[#E31E24] hover:bg-[#B01519] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                    >
                      + Atribuir Tarefa
                    </button>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : u.id)}
                      className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    {userTasks.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-4">Nenhuma tarefa atribuída</p>
                    ) : (
                      <div className="space-y-2">
                        {userTasks.map(t => (
                          <div key={t.id} className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 px-3 py-2.5">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{t.titulo}</p>
                              {t.data_vencimento && (
                                <p className="text-xs text-gray-400">📅 {new Date(t.data_vencimento).toLocaleDateString('pt-BR')}</p>
                              )}
                            </div>
                            <Badge value={t.prioridade} config={PRIORITY_CONFIG} />
                            <Badge value={t.status} config={STATUS_CONFIG} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Atribuir Tarefa */}
      <Modal open={!!assignUser} onClose={() => { setAssignUser(null); setForm(EMPTY_TASK) }} title={`Atribuir Tarefa — ${assignUser?.name || assignUser?.email}`} size="lg">
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input required value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" placeholder="Título da tarefa" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24] resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
              <select value={form.prioridade} onChange={e => setForm(f => ({ ...f, prioridade: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]">
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <select value={form.cliente_id} onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]">
                <option value="">Nenhum</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prazo</label>
              <input type="date" value={form.data_vencimento} onChange={e => setForm(f => ({ ...f, data_vencimento: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={formLoading}
              className="bg-[#E31E24] hover:bg-[#B01519] disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
              {formLoading ? 'Atribuindo...' : 'Atribuir Tarefa'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Novo Membro */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Novo Membro" size="md">
        <form onSubmit={handleCreateMember} className="space-y-4">
          {memberError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{memberError}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input required value={newMember.name} onChange={e => setNewMember(m => ({ ...m, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" placeholder="Nome completo" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
            <input required type="email" value={newMember.email} onChange={e => setNewMember(m => ({ ...m, email: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
              <select value={newMember.role} onChange={e => setNewMember(m => ({ ...m, role: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]">
                <option value="usuario">Usuário</option>
                <option value="gestor">Gestor</option>
                <option value="financeiro">Financeiro</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
              <input value={newMember.area} onChange={e => setNewMember(m => ({ ...m, area: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" placeholder="Ex: Marketing" />
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Senha de Acesso *</h4>
            <div className="space-y-3">
              <div className="relative">
                <input required type={showPassword ? 'text' : 'password'} value={newMember.password}
                  onChange={e => setNewMember(m => ({ ...m, password: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:border-[#E31E24]" placeholder="Mínimo 6 caracteres" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{showPassword ? '🙈' : '👁'}</button>
              </div>
              <input required type={showPassword ? 'text' : 'password'} value={newMember.confirmPassword}
                onChange={e => setNewMember(m => ({ ...m, confirmPassword: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" placeholder="Confirmar senha" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={memberLoading}
              className="bg-[#E31E24] hover:bg-[#B01519] disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
              {memberLoading ? 'Criando...' : 'Criar Membro'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
