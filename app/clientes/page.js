'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import Badge, { CLIENT_STATUS_CONFIG } from '@/components/ui/Badge'
import Modal, { ConfirmModal } from '@/components/ui/Modal'
import { useEffect, useState } from 'react'

const EMPTY_FORM = {
  nome: '', empresa: '', email: '', telefone: '',
  responsavel_id: '', segmento: '', valor_mensal: '',
  plano: '', status: 'ativo', data_entrada: '',
  data_saida: '', motivo_churn: '', observacoes: '',
}

function ClientForm({ form, setForm, users, onSubmit, loading, submitLabel }) {
  const isChurn = form.status === 'churn'
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <input required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" placeholder="Nome do contato" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
          <input value={form.empresa} onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" placeholder="Nome da empresa" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
          <input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor Mensal (R$)</label>
          <input type="number" min="0" step="0.01" value={form.valor_mensal} onChange={e => setForm(f => ({ ...f, valor_mensal: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" placeholder="0,00" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]">
            <option value="ativo">Ativo</option>
            <option value="pausado">Pausado</option>
            <option value="risco">Em Risco</option>
            <option value="churn">Churn</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrada</label>
          <input type="date" value={form.data_entrada} onChange={e => setForm(f => ({ ...f, data_entrada: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Segmento</label>
          <input value={form.segmento} onChange={e => setForm(f => ({ ...f, segmento: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" placeholder="Ex: E-commerce, SaaS..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
          <select value={form.responsavel_id} onChange={e => setForm(f => ({ ...f, responsavel_id: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]">
            <option value="">Selecionar...</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
          </select>
        </div>
      </div>

      {/* Campos de Churn */}
      {isChurn && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-red-700">Informações de Churn</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Saída</label>
            <input type="date" value={form.data_saida} onChange={e => setForm(f => ({ ...f, data_saida: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo do Churn</label>
            <textarea value={form.motivo_churn} onChange={e => setForm(f => ({ ...f, motivo_churn: e.target.value }))}
              rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24] resize-none"
              placeholder="Descreva o motivo da saída..." />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
        <textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
          rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24] resize-none" />
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading}
          className="bg-[#E31E24] hover:bg-[#B01519] disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
          {loading ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default function ClientesPage() {
  const [clients, setClients] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [editClient, setEditClient] = useState(null)
  const [deleteClient, setDeleteClient] = useState(null)
  const [churnClient, setChurnClient] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')

  const loadClients = () => {
    const params = new URLSearchParams()
    if (filterStatus) params.set('status', filterStatus)
    if (search) params.set('search', search)
    fetch(`/api/clients?${params}`).then(r => r.json()).then(setClients).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetch('/api/users').then(r => r.json()).then(setUsers).catch(() => {}) }, [])
  useEffect(() => { loadClients() }, [filterStatus, search])

  const handleCreate = async (e) => {
    e.preventDefault(); setFormLoading(true)
    const res = await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, valor_mensal: Number(form.valor_mensal) || 0 }) })
    if (res.ok) { setShowCreate(false); setForm(EMPTY_FORM); loadClients() }
    setFormLoading(false)
  }

  const handleEdit = async (e) => {
    e.preventDefault(); setFormLoading(true)
    const res = await fetch(`/api/clients/${editClient.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, valor_mensal: Number(form.valor_mensal) || 0 }) })
    if (res.ok) { setEditClient(null); setForm(EMPTY_FORM); loadClients() }
    setFormLoading(false)
  }

  const handleDelete = async () => {
    setFormLoading(true)
    await fetch(`/api/clients/${deleteClient.id}`, { method: 'DELETE' })
    setDeleteClient(null); loadClients(); setFormLoading(false)
  }

  const handleChurn = async () => {
    setFormLoading(true)
    await fetch(`/api/clients/${churnClient.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'churn', data_saida: new Date().toISOString().split('T')[0] })
    })
    setChurnClient(null); loadClients(); setFormLoading(false)
  }

  const openEdit = (client) => {
    setForm({
      nome: client.nome || '', empresa: client.empresa || '', email: client.email || '',
      telefone: client.telefone || '', responsavel_id: client.responsavel_id || '',
      segmento: client.segmento || '', valor_mensal: client.valor_mensal || '',
      plano: client.plano || '', status: client.status || 'ativo',
      data_entrada: client.data_entrada ? client.data_entrada.split('T')[0] : '',
      data_saida: client.data_saida ? client.data_saida.split('T')[0] : '',
      motivo_churn: client.motivo_churn || '', observacoes: client.observacoes || '',
    })
    setEditClient(client)
  }

  const formatCurrency = (v) => v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : '—'

  return (
    <DashboardLayout title="Clientes">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button onClick={() => { setShowCreate(true); setForm(EMPTY_FORM) }}
          className="bg-[#E31E24] hover:bg-[#B01519] text-white font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
          + Novo Cliente
        </button>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24] w-48" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]">
          <option value="">Todos os status</option>
          {Object.entries(CLIENT_STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#E31E24] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Cliente</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Responsável</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">MRR</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Entrada</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Nenhum cliente encontrado</td></tr>
              )}
              {clients.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{c.nome}</p>
                    {c.empresa && <p className="text-xs text-gray-400">{c.empresa}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.responsavel?.name || '—'}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(c.valor_mensal)}</td>
                  <td className="px-4 py-3"><Badge value={c.status} config={CLIENT_STATUS_CONFIG} /></td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.data_entrada ? new Date(c.data_entrada).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => openEdit(c)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Editar</button>
                      {c.status !== 'churn' && (
                        <button onClick={() => setChurnClient(c)} className="text-orange-600 hover:text-orange-800 text-xs font-medium">Churn</button>
                      )}
                      <button onClick={() => setDeleteClient(c)} className="text-red-600 hover:text-red-800 text-xs font-medium">Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Novo Cliente" size="lg">
        <ClientForm form={form} setForm={setForm} users={users} onSubmit={handleCreate} loading={formLoading} submitLabel="Criar Cliente" />
      </Modal>

      <Modal open={!!editClient} onClose={() => { setEditClient(null); setForm(EMPTY_FORM) }} title="Editar Cliente" size="lg">
        <ClientForm form={form} setForm={setForm} users={users} onSubmit={handleEdit} loading={formLoading} submitLabel="Salvar Alterações" />
      </Modal>

      <ConfirmModal open={!!churnClient} onClose={() => setChurnClient(null)} onConfirm={handleChurn}
        title="Marcar como Churn" message={`Confirmar saída de "${churnClient?.nome}"? O status será alterado para Churn com a data de hoje.`}
        confirmLabel="Confirmar Churn" danger loading={formLoading} />

      <ConfirmModal open={!!deleteClient} onClose={() => setDeleteClient(null)} onConfirm={handleDelete}
        title="Excluir Cliente" message={`Excluir "${deleteClient?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir" danger loading={formLoading} />
    </DashboardLayout>
  )
}
