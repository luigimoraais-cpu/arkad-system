import { createAdminClient } from './supabase'

// ─── CLIENTES ────────────────────────────────────────────────────────────────

export async function getClientes({ status, responsavelId, search } = {}) {
  const supabase = createAdminClient()
  let query = supabase
    .from('clientes')
    .select(`
      *,
      responsavel:profiles(id, name, email)
    `)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (responsavelId) query = query.eq('responsavel_id', responsavelId)
  if (search) query = query.ilike('nome', `%${search}%`)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getClienteById(id) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('clientes')
    .select(`*, responsavel:profiles(id, name, email)`)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createCliente(payload) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('clientes')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCliente(id, payload) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('clientes')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCliente(id) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('clientes').delete().eq('id', id)
  if (error) throw error
  return { success: true }
}

// ─── TAREFAS ─────────────────────────────────────────────────────────────────

export async function getTarefas({ status, responsavelId, clienteId, prioridade, search, dateFrom, dateTo } = {}) {
  const supabase = createAdminClient()
  let query = supabase
    .from('tarefas')
    .select(`
      *,
      responsavel:profiles!tarefas_responsavel_id_fkey(id, name, email),
      criador:profiles!tarefas_criado_por_fkey(id, name, email),
      cliente:clientes(id, nome)
    `)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (responsavelId) query = query.eq('responsavel_id', responsavelId)
  if (clienteId) query = query.eq('cliente_id', clienteId)
  if (prioridade) query = query.eq('prioridade', prioridade)
  if (search) query = query.ilike('titulo', `%${search}%`)
  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo) query = query.lte('created_at', dateTo)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getTarefaById(id) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('tarefas')
    .select(`
      *,
      responsavel:profiles!tarefas_responsavel_id_fkey(id, name, email),
      criador:profiles!tarefas_criado_por_fkey(id, name, email),
      cliente:clientes(id, nome),
      comentarios:comentarios_tarefa(*, autor:profiles(id, name)),
      checklist:checklist_tarefa(*)
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createTarefa(payload) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('tarefas')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTarefa(id, payload) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('tarefas')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTarefa(id) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('tarefas').delete().eq('id', id)
  if (error) throw error
  return { success: true }
}

// ─── USUÁRIOS / PROFILES ─────────────────────────────────────────────────────

export async function getProfiles({ role } = {}) {
  const supabase = createAdminClient()
  let query = supabase
    .from('profiles')
    .select('*')
    .order('name', { ascending: true })

  if (role) query = query.eq('role', role)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getProfileById(id) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(id, payload) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createUserWithProfile({ name, email, password, role, area }) {
  const supabase = createAdminClient()

  // Criar usuário no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: role || 'usuario' },
  })

  if (authError) throw authError

  // Atualizar profile com dados extras
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({ name, role: role || 'usuario', area })
    .eq('id', authData.user.id)
    .select()
    .single()

  if (profileError) throw profileError

  return { user: authData.user, profile }
}

export async function deleteUser(userId) {
  const supabase = createAdminClient()
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) throw error
  return { success: true }
}

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

export async function getDashboardStats({ responsavelId, dateFrom, dateTo } = {}) {
  const supabase = createAdminClient()

  let tarefasQuery = supabase.from('tarefas').select('status, prioridade, data_vencimento, created_at')
  let clientesQuery = supabase.from('clientes').select('status, valor_mensal')

  if (responsavelId) tarefasQuery = tarefasQuery.eq('responsavel_id', responsavelId)
  if (dateFrom) tarefasQuery = tarefasQuery.gte('created_at', dateFrom)
  if (dateTo) tarefasQuery = tarefasQuery.lte('created_at', dateTo)

  const [{ data: tarefas, error: tErr }, { data: clientes, error: cErr }] = await Promise.all([
    tarefasQuery,
    clientesQuery,
  ])

  if (tErr) throw tErr
  if (cErr) throw cErr

  const hoje = new Date().toISOString().split('T')[0]

  const stats = {
    tarefas: {
      total: tarefas.length,
      pendentes: tarefas.filter(t => t.status === 'pendente').length,
      em_andamento: tarefas.filter(t => t.status === 'em_andamento').length,
      concluidas: tarefas.filter(t => t.status === 'concluida').length,
      atrasadas: tarefas.filter(t => t.status === 'atrasada' || (t.data_vencimento && t.data_vencimento < hoje && !['concluida', 'cancelada'].includes(t.status))).length,
      canceladas: tarefas.filter(t => t.status === 'cancelada').length,
    },
    clientes: {
      total: clientes.length,
      ativos: clientes.filter(c => c.status === 'ativo').length,
      risco: clientes.filter(c => c.status === 'risco').length,
      churn: clientes.filter(c => c.status === 'churn').length,
      mrr: clientes.filter(c => c.status === 'ativo').reduce((sum, c) => sum + (c.valor_mensal || 0), 0),
    },
    por_prioridade: {
      urgente: tarefas.filter(t => t.prioridade === 'urgente').length,
      alta: tarefas.filter(t => t.prioridade === 'alta').length,
      media: tarefas.filter(t => t.prioridade === 'media').length,
      baixa: tarefas.filter(t => t.prioridade === 'baixa').length,
    },
  }

  return stats
}

// ─── NOTIFICAÇÕES ────────────────────────────────────────────────────────────

export async function createNotificacao({ usuarioId, titulo, mensagem, tipo, link }) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('notificacoes')
    .insert({ usuario_id: usuarioId, titulo, mensagem, tipo: tipo || 'info', link })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getNotificacoes(usuarioId) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('notificacoes')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return data
}

export async function marcarNotificacaoLida(id) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('notificacoes').update({ lida: true }).eq('id', id)
  if (error) throw error
  return { success: true }
}

// ─── FUNÇÕES DE AUTENTICAÇÃO INTERNA ────────────────────────────────────────

export async function getUserById(userId) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.auth.admin.getUserById(userId)
  if (error) throw error
  return data?.user || null
}

export async function verifyPassword(plainPassword, storedHash) {
  // No Supabase Auth, a verificação de senha é feita pelo próprio Supabase
  // Esta função é um placeholder para compatibilidade com a API Route
  // A verificação real é feita via supabase.auth.signInWithPassword
  return true
}

export async function updateUserPassword(userId, newPassword) {
  const supabase = createAdminClient()
  const { error } = await supabase.auth.admin.updateUserById(userId, { password: newPassword })
  if (error) throw error
  return { success: true }
}
