import { createServerSupabaseClient } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

    const { currentPassword, newPassword } = await request.json()
    if (!currentPassword || !newPassword) return NextResponse.json({ error: 'Campos obrigatórios.' }, { status: 400 })
    if (newPassword.length < 6) return NextResponse.json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' }, { status: 400 })

    // Verificar senha atual tentando fazer login
    const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword })
    if (verifyError) return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 400 })

    // Atualizar senha via admin
    const adminClient = createAdminClient()
    const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, { password: newPassword })
    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[change-password]', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
