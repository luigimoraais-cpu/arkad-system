import { withAuth } from '@/lib/auth'
import { createTarefa, getTarefas } from '@/lib/db'
import { sendTaskAssignedEmail } from '@/lib/email'
import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/tasks
export async function GET(request) {
  const { user, error, status } = await withAuth(request)
  if (error) return NextResponse.json({ error }, { status })

  const { searchParams } = new URL(request.url)
  const filters = {
    status: searchParams.get('status') || undefined,
    responsavelId: searchParams.get('responsavel_id') || undefined,
    clienteId: searchParams.get('cliente_id') || undefined,
    prioridade: searchParams.get('prioridade') || undefined,
    search: searchParams.get('search') || undefined,
    dateFrom: searchParams.get('date_from') || undefined,
    dateTo: searchParams.get('date_to') || undefined,
  }

  try {
    const tarefas = await getTarefas(filters)
    return NextResponse.json(tarefas)
  } catch (err) {
    console.error('[Tasks GET]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/tasks
export async function POST(request) {
  const { user, error, status } = await withAuth(request)
  if (error) return NextResponse.json({ error }, { status })

  try {
    const body = await request.json()

    const tarefa = await createTarefa({
      titulo: body.titulo,
      descricao: body.descricao || null,
      responsavel_id: body.responsavel_id || null,
      cliente_id: body.cliente_id || null,
      criado_por: user.id,
      prioridade: body.prioridade || 'media',
      status: body.status || 'pendente',
      data_vencimento: body.data_vencimento || null,
    })

    // Enviar e-mail de notificação ao responsável
    if (body.responsavel_id && body.responsavel_id !== user.id) {
      const adminClient = createAdminClient()
      const { data: responsavel } = await adminClient
        .from('profiles')
        .select('name, email')
        .eq('id', body.responsavel_id)
        .single()

      if (responsavel?.email) {
        await sendTaskAssignedEmail({
          to: responsavel.email,
          toName: responsavel.name,
          taskTitle: body.titulo,
          taskDescription: body.descricao,
          dueDate: body.data_vencimento,
          priority: body.prioridade || 'media',
          assignedBy: user.profile?.name || user.email,
        })
      }
    }

    return NextResponse.json(tarefa, { status: 201 })
  } catch (err) {
    console.error('[Tasks POST]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
