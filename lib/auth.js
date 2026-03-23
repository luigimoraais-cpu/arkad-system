import { createServerSupabaseClient } from './supabase'
import { createAdminClient } from './supabase'

/**
 * Obtém o usuário autenticado e seu perfil completo.
 * Use em Server Components e API Routes.
 */
export async function getAuthUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) return null

  // Buscar perfil com role
  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { ...user, profile }
}

/**
 * Verifica se o usuário tem a role necessária.
 * Retorna { user, profile } ou lança erro 403.
 */
export async function requireRole(roles) {
  const user = await getAuthUser()
  if (!user) {
    throw new Error('UNAUTHORIZED')
  }

  const userRole = user.profile?.role || 'usuario'
  const allowed = Array.isArray(roles) ? roles : [roles]

  if (!allowed.includes(userRole)) {
    throw new Error('FORBIDDEN')
  }

  return user
}

/**
 * Helper para API Routes — retorna { user } ou resposta de erro.
 */
export async function withAuth(request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return { error: 'Não autenticado', status: 401 }
    }
    return { user }
  } catch {
    return { error: 'Erro de autenticação', status: 401 }
  }
}

/**
 * Helper para API Routes com verificação de role.
 */
export async function withRole(roles) {
  try {
    const user = await requireRole(roles)
    return { user }
  } catch (err) {
    if (err.message === 'UNAUTHORIZED') return { error: 'Não autenticado', status: 401 }
    if (err.message === 'FORBIDDEN') return { error: 'Acesso negado', status: 403 }
    return { error: 'Erro interno', status: 500 }
  }
}

/**
 * Obtém a sessão atual (userId e role) — compatível com API Routes.
 */
export async function getSession() {
  const user = await getAuthUser()
  if (!user) return null
  return {
    userId: user.id,
    email: user.email,
    role: user.profile?.role || 'usuario',
  }
}
