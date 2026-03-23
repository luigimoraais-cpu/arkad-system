import { withAuth, withRole } from '@/lib/auth'
import { createUserWithProfile, getProfiles } from '@/lib/db'
import { sendWelcomeEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

// GET /api/users
export async function GET(request) {
  const { error, status } = await withAuth(request)
  if (error) return NextResponse.json({ error }, { status })

  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role') || undefined

  try {
    const profiles = await getProfiles({ role })
    return NextResponse.json(profiles)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/users — apenas admin cria usuários
export async function POST(request) {
  const { error, status } = await withRole(['admin'])
  if (error) return NextResponse.json({ error }, { status })

  try {
    const body = await request.json()
    const { name, email, password, role, area } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, e-mail e senha são obrigatórios.' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 })
    }

    const { user, profile } = await createUserWithProfile({ name, email, password, role, area })

    // Enviar e-mail de boas-vindas
    await sendWelcomeEmail({ to: email, name, password })

    return NextResponse.json({ user, profile }, { status: 201 })
  } catch (err) {
    console.error('[Users POST]', err)
    if (err.message?.includes('already registered')) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 409 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
