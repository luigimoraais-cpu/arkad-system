import { withAuth, withRole } from '@/lib/auth'
import { deleteCliente, getClienteById, updateCliente } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/clients/:id
export async function GET(request, { params }) {
  const { error, status } = await withAuth(request)
  if (error) return NextResponse.json({ error }, { status })

  try {
    const cliente = await getClienteById(params.id)
    return NextResponse.json(cliente)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 404 })
  }
}

// PUT /api/clients/:id
export async function PUT(request, { params }) {
  const { error, status } = await withRole(['admin', 'gestor'])
  if (error) return NextResponse.json({ error }, { status })

  try {
    const body = await request.json()
    const cliente = await updateCliente(params.id, body)
    return NextResponse.json(cliente)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/clients/:id
export async function DELETE(request, { params }) {
  const { error, status } = await withRole(['admin'])
  if (error) return NextResponse.json({ error }, { status })

  try {
    await deleteCliente(params.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
