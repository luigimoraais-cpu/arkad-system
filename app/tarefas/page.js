'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import Badge, { PRIORITY_CONFIG, STATUS_CONFIG } from '@/components/ui/Badge'
import Modal, { ConfirmModal } from '@/components/ui/Modal'
import { useEffect, useState } from 'react'

const KANBAN_COLUMNS = [
  { id: 'pendente', label: 'Pendente', color: 'bg-gray-100 border-gray-300' },
  { id: 'em_andamento', label: 'Em Andamento', color: 'bg-blue-50 border-blue-300' },
  { id: 'em_revisao', label: 'Em Revisão', color: 'bg-purple-50 border-purple-300' },
  { id: 'concluida', label: 'Concluída', color: 'bg-green-50 border-green-300' },
  { id: 'atrasada', label: 'Atrasada', color: 'bg-red-50 border-red-300' },
]

const EMPTY_FORM = {
  titulo: '', descricao: '', responsavel_id: '', cliente_id: '',
  prioridade: 'media', status: 'pendente', data_vencimento: '',
}

function TaskForm({ form, setForm, users, clients, onSubmit, loading, submitLabel }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
        <input
          required value={form.titulo}
          onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]"
          placeholder="Título da tarefa"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <textarea
          value={form.descricao}
          onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24] resize-none"
          placeholder="Descreva a tarefa..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
          <select
            value={form.responsavel_id}
            onChange={e => setForm(f => ({ ...f, responsavel_id: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]"
          >
            <option value="">Selecionar...</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <select
            value={form.cliente_id}
            onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]"
          >
            <option value="">Nenhum</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
          <select
            value={form.prioridade}
            onChange={e => setForm(f => ({ ...f, prioridade: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]"
          >
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]"
          >
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prazo</label>
          <input
            type="date" value={form.data_vencimento}
            onChange={e => setForm(f => ({ ...f, data_vencimento: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]"
          />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button
          type="submit" disabled={loading}
          className="bg-[#E31E24] hover:bg-[#B01519] disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          {loading ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

function KanbanCard({ task, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-gray-900 leading-tight flex-1">{task.titulo}</p>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => onEdit(task)} className="text-gray-400 hover:text-blue-600 text-xs p-0.5">✏</button>
          <button onClick={() => onDelete(task)} className="text-gray-400 hover:text-red-600 text-xs p-0.5">🗑</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        <Badge value={task.prioridade} config={PRIORITY_CONFIG} />
      </div>
      {task.responsavel && (
        <p className="text-xs text-gray-500">👤 {task.responsavel.name || task.responsavel.email}</p>
      )}
      {task.data_vencimento && (
        <p className="text-xs text-gray-400 mt-1">
          📅 {new Date(task.data_vencimento).toLocaleDateString('pt-BR')}
        </p>
      )}
    </div>
  )
}

export default function TarefasPage() {
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [clients, setClients] = useState([])
  const [view, setView] = useState('kanban')
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [deleteTask, setDeleteTask] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterUser, setFilterUser] = useState('')
  const [search, setSearch] = useState('')

  const loadTasks = () => {
    const params = new URLSearchParams()
    if (filterStatus) params.set('status', filterStatus)
    if (filterUser) params.set('responsavel_id', filterUser)
    if (search) params.set('search', search)
    fetch(`/api/tasks?${params}`).then(r => r.json()).then(setTasks).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(setUsers).catch(() => {})
    fetch('/api/clients').then(r => r.json()).then(setClients).catch(() => {})
  }, [])

  useEffect(() => { loadTasks() }, [filterStatus, filterUser, search])

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { setShowCreate(false); setForm(EMPTY_FORM); loadTasks() }
    setFormLoading(false)
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    const res = await fetch(`/api/tasks/${editTask.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { setEditTask(null); setForm(EMPTY_FORM); loadTasks() }
    setFormLoading(false)
  }

  const handleDelete = async () => {
    setFormLoading(true)
    await fetch(`/api/tasks/${deleteTask.id}`, { method: 'DELETE' })
    setDeleteTask(null); loadTasks()
    setFormLoading(false)
  }

  const openEdit = (task) => {
    setForm({
      titulo: task.titulo || '', descricao: task.descricao || '',
      responsavel_id: task.responsavel_id || '', cliente_id: task.cliente_id || '',
      prioridade: task.prioridade || 'media', status: task.status || 'pendente',
      data_vencimento: task.data_vencimento ? task.data_vencimento.split('T')[0] : '',
    })
    setEditTask(task)
  }

  const tasksByStatus = KANBAN_COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id)
    return acc
  }, {})

  return (
    <DashboardLayout title="Tarefas">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => { setShowCreate(true); setForm(EMPTY_FORM) }}
          className="bg-[#E31E24] hover:bg-[#B01519] text-white font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          + Nova Tarefa
        </button>
        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
          <button onClick={() => setView('kanban')} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === 'kanban' ? 'bg-[#E31E24] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Kanban</button>
          <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === 'list' ? 'bg-[#E31E24] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Lista</button>
        </div>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar tarefa..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24] w-48"
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]">
          <option value="">Todos os status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterUser} onChange={e => setFilterUser(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E31E24]">
          <option value="">Todos os membros</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#E31E24] border-t-transparent rounded-full animate-spin" /></div>
      ) : view === 'kanban' ? (
        /* Kanban View */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map(col => (
            <div key={col.id} className={`flex-shrink-0 w-72 rounded-xl border-2 ${col.color} p-3`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-700">{col.label}</h3>
                <span className="bg-white text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full border border-gray-200">
                  {tasksByStatus[col.id]?.length || 0}
                </span>
              </div>
              <div className="space-y-2">
                {tasksByStatus[col.id]?.map(task => (
                  <KanbanCard key={task.id} task={task} onEdit={openEdit} onDelete={setDeleteTask} />
                ))}
                {tasksByStatus[col.id]?.length === 0 && (
                  <p className="text-center text-gray-400 text-xs py-6">Nenhuma tarefa</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Tarefa</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Responsável</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Prazo</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Prioridade</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Nenhuma tarefa encontrada</td></tr>
              )}
              {tasks.map(t => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{t.titulo}</p>
                    {t.cliente && <p className="text-xs text-gray-400">{t.cliente.nome}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.responsavel?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.data_vencimento ? new Date(t.data_vencimento).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-4 py-3"><Badge value={t.prioridade} config={PRIORITY_CONFIG} /></td>
                  <td className="px-4 py-3"><Badge value={t.status} config={STATUS_CONFIG} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(t)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Editar</button>
                      <button onClick={() => setDeleteTask(t)} className="text-red-600 hover:text-red-800 text-xs font-medium">Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Criar */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nova Tarefa" size="lg">
        <TaskForm form={form} setForm={setForm} users={users} clients={clients} onSubmit={handleCreate} loading={formLoading} submitLabel="Criar Tarefa" />
      </Modal>

      {/* Modal Editar */}
      <Modal open={!!editTask} onClose={() => { setEditTask(null); setForm(EMPTY_FORM) }} title="Editar Tarefa" size="lg">
        <TaskForm form={form} setForm={setForm} users={users} clients={clients} onSubmit={handleEdit} loading={formLoading} submitLabel="Salvar Alterações" />
      </Modal>

      {/* Confirmar Exclusão */}
      <ConfirmModal
        open={!!deleteTask}
        onClose={() => setDeleteTask(null)}
        onConfirm={handleDelete}
        title="Excluir Tarefa"
        message={`Tem certeza que deseja excluir "${deleteTask?.titulo}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        danger
        loading={formLoading}
      />
    </DashboardLayout>
  )
}
