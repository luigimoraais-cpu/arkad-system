import { Resend } from 'resend'

const FROM = process.env.RESEND_FROM_EMAIL || 'Arkad <onboarding@resend.dev>'

function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendTaskAssignedEmail({
  to,
  toName,
  taskTitle,
  taskDescription,
  dueDate,
  priority,
  assignedBy,
}) {
  const resend = getResendClient()

  if (!resend) {
    console.warn('[Email] RESEND_API_KEY não configurado — e-mail não enviado.')
    return
  }

  const priorityLabel = {
    urgente: '🔴 Urgente',
    alta: '🟠 Alta',
    media: '🟡 Média',
    baixa: '🟢 Baixa',
  }[priority] || priority

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `[Arkad] Nova tarefa atribuída: ${taskTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Inter, Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            <div style="background: #0A0A0A; padding: 28px 32px; display: flex; align-items: center;">
              <div style="color: #E31E24; font-size: 28px; font-weight: 900;">///ARKAD</div>
            </div>

            <div style="padding: 32px;">
              <p>Olá, <strong>${toName || to}</strong></p>
              <h2>Nova tarefa atribuída</h2>

              <div style="background: #f9f9f9; border-left: 4px solid #E31E24; padding: 20px;">
                <h3>${taskTitle}</h3>
                ${taskDescription ? `<p>${taskDescription}</p>` : ''}
                <p><strong>Prioridade:</strong> ${priorityLabel}</p>
                ${dueDate ? `<p><strong>Prazo:</strong> ${new Date(dueDate).toLocaleDateString('pt-BR')}</p>` : ''}
                ${assignedBy ? `<p><strong>Atribuído por:</strong> ${assignedBy}</p>` : ''}
              </div>

              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tarefas"
                style="display:inline-block;margin-top:20px;background:#E31E24;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
                Ver Tarefa
              </a>
            </div>
          </div>
        </body>
        </html>
      `,
    })
  } catch (err) {
    console.error('[Email] Erro ao enviar:', err)
  }
}

export async function sendWelcomeEmail({ to, name, password }) {
  const resend = getResendClient()

  if (!resend) {
    console.warn('[Email] RESEND_API_KEY não configurado — e-mail não enviado.')
    return
  }

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: '[Arkad] Suas credenciais de acesso',
      html: `
        <h2>Bem-vindo ${name}</h2>
        <p>Email: ${to}</p>
        <p>Senha: ${password}</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login">
          Acessar sistema
        </a>
      `,
    })
  } catch (err) {
    console.error('[Email] Erro ao enviar boas-vindas:', err)
  }
}