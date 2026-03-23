'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import Badge, { ROLE_CONFIG } from '@/components/ui/Badge'
import Modal, { ConfirmModal } from '@/components/ui/Modal'
import { useEffect, useState } from 'react'

const EMPTY_FORM = { name: '', email: '', password: '', confirmPassword: '', role: 'usuario', area: '' }

export default function UsuariosPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [deleteUser, setDeleteUser] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const loadUsers = () => {
    fetch('/api/users').then(r => r.json()).then(setUsers).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { loadUsers() }, [])

  const handleCreate = async (e) => {
    e.preventDefault(); setError('')
    if (form.password !== form.confirmPassword) { setError('As senhas não coincidem.'); return }
    if (form.password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    setFormLoading(true)
    const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Erro ao criar usuário.'); setFormLoading(false); return }
    setShowCreate(false); setForm(EMPTY_FORM); loadUsers(); setFormLoading(false)
  }

  const handleEdit = async (e) => {
    e.preventDefault(); setError(''); setFormLoading(true)
    const res = await fetch(`/api/users/${editUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, role: form.role, area: form.area }) })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Erro ao atualizar.'); setFormLoading(false); return }
    setEditUser(null); setForm(EMPTY_FORM); loadUsers(); setFormLoading(false)
  }

  const handleDelete = async () => {
    setFormLoading(true)
    await fetch(`/api/users/${deleteUser.id}`, { method: 'DELETE' })
    setDeleteUser(null); loadUsers(); setFormLoading(false)
  }

  const openEdit = (user) => {
    setForm({ name: user.name || '', email: user.email || '', password: '', confirmPassword: '', role: user.role || 'usuario', area: user.area || '' })
    setEditUser(user); setError('')
  }

  const roleLabel = { admin: 'Administrador', gestor: 'Gestor', financeiro: 'Financeiro', usuario: 'Usuário' }

  return (
    <DashboardLayout title="Usuários">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 text-sm">{users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}</p>
        <button onClick={() => { setShowCreate(true); setForm(EMPTY_FORM); setError('') }}
          className="bg-[#E31E24] hover:bg-[#B01519] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          + Novo Usuário
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#E31E24] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Usuário</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Perfil</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Área</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Cadastrado em</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Nenhum usuário encontrado</td></tr>
              )}
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E31E24] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {(u.name || u.email || 'U').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.name || '—'}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge value={u.role} config={ROLE_CONFIG} /></td>
                  <td className="px-4 py-3 text-gray-600">{u.area || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(u)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Editar</button>
                      <button onClick={() => setDeleteUser(u)} className="text-red-600 hover:text-red-800 text-xs font-medium">Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Criar */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Novo Usuário" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" placeholder="Nome completo" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
            <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]">
                <option value="usuario">Usuário</option>
                <option value="gestor">Gestor</option>
                <option value="financeiro">Financeiro</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
              <input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" placeholder="Ex: Marketing" />
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Senha de Acesso *</h4>
            <div className="space-y-3">
              <div className="relative">
                <input required type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:border-[#E31E24]" placeholder="Mínimo 6 caracteres" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">{showPassword ? '🙈' : '👁'}</button>
              </div>
              <input required type={showPassword ? 'text' : 'password'} value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" placeholder="Confirmar senha" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={formLoading}
              className="bg-[#E31E24] hover:bg-[#B01519] disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
              {formLoading ? 'Criando...' : 'Criar Usuário'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar */}
      <Modal open={!!editUser} onClose={() => { setEditUser(null); setForm(EMPTY_FORM); setError('') }} title="Editar Usuário" size="md">
        <form onSubmit={handleEdit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]">
                <option value="usuario">Usuário</option>
                <option value="gestor">Gestor</option>
                <option value="financeiro">Financeiro</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
              <input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={formLoading}
              className="bg-[#E31E24] hover:bg-[#B01519] disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
              {formLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!deleteUser} onClose={() => setDeleteUser(null)} onConfirm={handleDelete}
        title="Excluir Usuário" message={`Excluir "${deleteUser?.name || deleteUser?.email}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir" danger loading={formLoading} />
    </DashboardLayout>
  )
}
