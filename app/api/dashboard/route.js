import { withAuth } from '@/lib/auth'
import { getDashboardStats, getTarefas } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/dashboard
export async function GET(request) {
  const { user, error, status } = await withAuth(request)
  if (error) return NextResponse.json({ error }, { status })

  const { searchParams } = new URL(request.url)
  const filters = {
    responsavelId: searchParams.get('responsavel_id') || undefined,
    dateFrom: searchParams.get('date_from') || undefined,
    dateTo: searchParams.get('date_to') || undefined,
  }

  try {
    const [stats, tarefasAtrasadas] = await Promise.all([
      getDashboardStats(filters),
      getTarefas({ status: 'atrasada', ...filters }),
    ])

    return NextResponse.json({
      ...stats,
      tarefas_atrasadas_lista: tarefasAtrasadas.slice(0, 10),
    })
  } catch (err) {
    console.error('[Dashboard GET]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
