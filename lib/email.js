import { Resend } from 'resend'

const FROM = process.env.RESEND_FROM_EMAIL || 'Arkad <onboarding@resend.dev>'

function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendTaskAssignedEmail({ to, toName, taskTitle, taskDescription, dueDate, priority, assignedBy }) {
  const resend = getResendClient()

  if (!resend) {
    console.warn('[Email] RESEND_API_KEY não configurado — e-mail não enviado.')
    return
  }

  const priorityLabel = { urgente: '🔴 Urgente', alta: '🟠 Alta', media: '🟡 Média', baixa: '🟢 Baixa' }[priority] || priority

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
            <div style="background: #0A0A0A; padding: 28px 32px; display: flex; align-items: center; gap: 12px;">
              <div style="color: #E31E24; font-size: 28px; font-weight: 900; letter-spacing: -1px;">///ARKAD</div>
            </div>
            <div style="padding: 32px;">
              <p style="color: #666; margin: 0 0 8px 0; font-size: 14px;">Olá, <strong>${toName || to}</strong></p>
              <h2 style="margin: 0 0 24px 0; color: #0A0A0A; font-size: 20px;">Uma nova tarefa foi atribuída a você</h2>
              <div style="background: #f9f9f9; border-left: 4px solid #E31E24; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 8px 0; color: #0A0A0A; font-size: 18px;">${taskTitle}</h3>
                ${taskDescription ? `<p style="margin: 0 0 12px 0; color: #555; font-size: 14px; line-height: 1.6;">${taskDescription}</p>` : ''}
                <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-top: 12px;">
                  <span style="background: #fff; border: 1px solid #eee; border-radius: 6px; padding: 4px 12px; font-size: 13px; color: #333;">
                    <strong>Prioridade:</strong> ${priorityLabel}
                  </span>
                  ${dueDate ? `<span style="background: #fff; border: 1px solid #eee; border-radius: 6px; padding: 4px 12px; font-size: 13px; color: #333;">
                    <strong>Prazo:</strong> ${new Date(dueDate).toLocaleDateString('pt-BR')}
                  </span>` : ''}
                  ${assignedBy ? `<span style="background: #fff; border: 1px solid #eee; border-radius: 6px; padding: 4px 12px; font-size: 13px; color: #333;">
                    <strong>Atribuído por:</strong> ${assignedBy}
                  </span>` : ''}
                </div>
              </div>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tarefas"
                style="display: inline-block; background: #E31E24; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                Ver Tarefa
              </a>
            </div>
            <div style="background: #f5f5f5; padding: 16px 32px; text-align: center;">
              <p style="margin: 0; color: #999; font-size: 12px;">Arkad — Growth Marketing Performance</p>
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
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Inter, Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            <div style="background: #0A0A0A; padding: 28px 32px;">
              <div style="color: #E31E24; font-size: 28px; font-weight: 900; letter-spacing: -1px;">///ARKAD</div>
            </div>
            <div style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; color: #0A0A0A;">Bem-vindo ao Arkad Task System, ${name}!</h2>
              <p style="color: #555; margin: 0 0 24px 0;">Sua conta foi criada. Use as credenciais abaixo para acessar o sistema:</p>
              <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>E-mail:</strong> ${to}</p>
                <p style="margin: 0; font-size: 14px;"><strong>Senha:</strong> <code style="background: #eee; padding: 2px 8px; border-radius: 4px;">${password}</code></p>
              </div>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login"
                style="display: inline-block; background: #E31E24; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                Acessar o Sistema
              </a>
              <p style="color: #999; font-size: 12px; margin-top: 24px;">Por segurança, recomendamos alterar sua senha após o primeiro acesso.</p>
            </div>
            <div style="background: #f5f5f5; padding: 16px 32px; text-align: center;">
              <p style="margin: 0; color: #999; font-size: 12px;">Arkad — Growth Marketing Performance</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
  } catch (err) {
    console.error('[Email] Erro ao enviar boas-vindas:', err)
  }
}