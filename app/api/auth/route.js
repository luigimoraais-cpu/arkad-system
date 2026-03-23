import { createServerSupabaseClient } from '../../../lib/supabase'
import { NextResponse } from 'next/server'

// POST /api/auth — login com e-mail e senha
export async function POST(request) {
  try {
    const { email, password, action } = await request.json()

    const supabase = await createServerSupabaseClient()

    if (action === 'logout') {
      await supabase.auth.signOut()
      return NextResponse.json({ success: true })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: 'E-mail ou senha incorretos.' },
        { status: 401 }
      )
    }

    const { createAdminClient } = await import('../../../lib/supabase')
    const adminClient = createAdminClient()

    const { data: profile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    return NextResponse.json({
      success: true,
      user: { ...data.user, profile },
    })
  } catch (err) {
    console.error('[Auth API]', err)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET /api/auth — retorna usuário atual
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ user: null })
    }

    const { createAdminClient } = await import('../../../lib/supabase')
    const adminClient = createAdminClient()

    const { data: profile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json({ user: { ...user, profile } })
  } catch (err) {
    return NextResponse.json({ user: null })
  }
}





