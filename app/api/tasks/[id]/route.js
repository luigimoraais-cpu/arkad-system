import { withAuth, withRole } from '@/lib/auth'
import { deleteTarefa, getTarefaById, updateTarefa } from '@/lib/db'
import { sendTaskAssignedEmail } from '@/lib/email'
import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/tasks/:id
export async function GET(request, { params }) {
  const { error, status } = await withAuth(request)
  if (error) return NextResponse.json({ error }, { status })

  try {
    const tarefa = await getTarefaById(params.id)
    return NextResponse.json(tarefa)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 404 })
  }
}

// PUT /api/tasks/:id
export async function PUT(request, { params }) {
  const { user, error, status } = await withAuth(request)
  if (error) return NextResponse.json({ error }, { status })

  try {
    const body = await request.json()

    // Verificar se responsável mudou para enviar e-mail
    const tarefaAnterior = await getTarefaById(params.id)
    const responsavelMudou = body.responsavel_id && body.responsavel_id !== tarefaAnterior.responsavel_id

    const tarefa = await updateTarefa(params.id, body)

    // Enviar e-mail se responsável mudou
    if (responsavelMudou) {
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
          taskTitle: tarefa.titulo,
          taskDescription: tarefa.descricao,
          dueDate: tarefa.data_vencimento,
          priority: tarefa.prioridade,
          assignedBy: user.profile?.name || user.email,
        })
      }
    }

    return NextResponse.json(tarefa)
  } catch (err) {
    console.error('[Tasks PUT]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/tasks/:id
export async function DELETE(request, { params }) {
  const { user, error, status } = await withAuth(request)
  if (error) return NextResponse.json({ error }, { status })

  try {
    // Verificar se é admin ou criador
    const tarefa = await getTarefaById(params.id)
    const isAdmin = user.profile?.role === 'admin'
    const isCriador = tarefa.criado_por === user.id

    if (!isAdmin && !isCriador) {
      return NextResponse.json({ error: 'Sem permissão para excluir esta tarefa' }, { status: 403 })
    }

    await deleteTarefa(params.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
