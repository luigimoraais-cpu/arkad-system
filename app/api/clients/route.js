import { withAuth, withRole } from '@/lib/auth'
import { createCliente, getClientes } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/clients
export async function GET(request) {
  const { user, error, status } = await withAuth(request)
  if (error) return NextResponse.json({ error }, { status })

  const { searchParams } = new URL(request.url)
  const filters = {
    status: searchParams.get('status') || undefined,
    responsavelId: searchParams.get('responsavel_id') || undefined,
    search: searchParams.get('search') || undefined,
  }

  try {
    const clientes = await getClientes(filters)
    return NextResponse.json(clientes)
  } catch (err) {
    console.error('[Clients GET]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/clients
export async function POST(request) {
  const { user, error, status } = await withRole(['admin', 'gestor'])
  if (error) return NextResponse.json({ error }, { status })

  try {
    const body = await request.json()
    const cliente = await createCliente({
      nome: body.nome,
      empresa: body.empresa,
      email: body.email,
      telefone: body.telefone,
      responsavel_id: body.responsavel_id || null,
      segmento: body.segmento,
      valor_mensal: body.valor_mensal || 0,
      plano: body.plano,
      status: body.status || 'ativo',
      data_entrada: body.data_entrada || new Date().toISOString().split('T')[0],
      data_saida: body.data_saida || null,
      motivo_churn: body.motivo_churn || null,
      observacoes: body.observacoes || null,
    })
    return NextResponse.json(cliente, { status: 201 })
  } catch (err) {
    console.error('[Clients POST]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
