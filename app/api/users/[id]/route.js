import { withAuth, withRole } from '@/lib/auth'
import { deleteUser, updateProfile } from '@/lib/db'
import { NextResponse } from 'next/server'

// PUT /api/users/:id — admin atualiza qualquer perfil, usuário atualiza o próprio
export async function PUT(request, { params }) {
  const { user, error, status } = await withAuth(request)
  if (error) return NextResponse.json({ error }, { status })

  const isAdmin = user.profile?.role === 'admin'
  const isSelf = user.id === params.id

  if (!isAdmin && !isSelf) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  try {
    const body = await request.json()

    // Apenas admin pode mudar a role
    const updateData = { name: body.name, area: body.area }
    if (isAdmin && body.role) updateData.role = body.role

    const profile = await updateProfile(params.id, updateData)
    return NextResponse.json(profile)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/users/:id — apenas admin
export async function DELETE(request, { params }) {
  const { user, error, status } = await withRole(['admin'])
  if (error) return NextResponse.json({ error }, { status })

  // Não pode deletar a si mesmo
  if (user.id === params.id) {
    return NextResponse.json({ error: 'Não é possível excluir sua própria conta.' }, { status: 400 })
  }

  try {
    await deleteUser(params.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
