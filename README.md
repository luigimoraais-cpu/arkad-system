# Arkad Task System

Sistema de gerenciamento de tarefas e clientes para a empresa Arkad.

**Stack:** Next.js 14 (App Router) · JavaScript · Tailwind CSS · Supabase (Auth + PostgreSQL)

---

## Funcionalidades

- Login com e-mail e senha (Supabase Auth)
- Controle de permissões: **Admin**, **Gestor**, **Financeiro**, **Usuário**
- Cadastro de clientes com status (Ativo, Risco, Churn), MRR e histórico
- Sistema de tarefas com Kanban, lista, prioridades e responsáveis
- Dashboard com métricas, filtros por período e por membro
- Notificação por e-mail ao atribuir tarefa (via Resend)
- Gerenciamento de membros e usuários pelo administrador

---

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com) (gratuita)
- Conta no [Resend](https://resend.com) (gratuita, opcional — para e-mails)

---

## 1. Configurar o Supabase

### 1.1 Criar o projeto

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Anote a **URL do projeto** e a **chave anon** (em *Settings → API*)
3. Anote também a **chave service_role** (necessária para operações admin)

### 1.2 Criar as tabelas

1. No painel do Supabase, acesse **SQL Editor**
2. Cole o conteúdo do arquivo `sql/schema.sql`
3. Clique em **Run** para executar

### 1.3 Criar o primeiro administrador

1. No Supabase, vá em **Authentication → Users → Add user**
2. Informe e-mail e senha do administrador
3. Após criar, vá em **SQL Editor** e execute:

```sql
UPDATE profiles
SET role = 'admin', name = 'Seu Nome'
WHERE email = 'seu@email.com';
```

---

## 2. Instalar e configurar o projeto

```bash
# Instalar dependências
npm install

# Copiar o arquivo de variáveis de ambiente
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# E-mail (opcional — Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=Arkad <onboarding@resend.dev>
```

---

## 3. Rodar localmente

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 4. Build para produção

```bash
npm run build
npm start
```

---

## 5. Deploy na Vercel

### Opção A — Via interface (recomendado)

1. Faça push do projeto para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com) e clique em **New Project**
3. Importe o repositório
4. Em **Environment Variables**, adicione as mesmas variáveis do `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY` *(opcional)*
   - `RESEND_FROM_EMAIL` *(opcional)*
5. Clique em **Deploy**

### Opção B — Via CLI

```bash
npm i -g vercel
vercel --prod
```

---

## Estrutura do Projeto

```
arkad-nextjs/
├── app/
│   ├── api/
│   │   ├── auth/           → Login, logout, troca de senha
│   │   ├── clients/        → CRUD de clientes
│   │   ├── tasks/          → CRUD de tarefas
│   │   ├── users/          → CRUD de usuários (admin)
│   │   └── dashboard/      → Métricas e KPIs
│   ├── login/              → Página de login
│   ├── dashboard/          → Dashboard principal
│   ├── tarefas/            → Kanban e lista de tarefas
│   ├── clientes/           → Gestão de clientes
│   ├── membros/            → Membros da equipe
│   ├── usuarios/           → Gerenciamento de usuários (admin)
│   └── configuracoes/      → Perfil e configurações
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx     → Menu lateral com identidade Arkad
│   │   └── DashboardLayout.jsx
│   └── ui/
│       ├── Badge.jsx       → Badges de status e prioridade
│       └── Modal.jsx       → Modal reutilizável
├── lib/
│   ├── supabase.js         → Clientes Supabase (browser e server)
│   ├── auth.js             → Helpers de autenticação
│   ├── db.js               → Queries do banco de dados
│   └── email.js            → Envio de e-mail via Resend
├── sql/
│   └── schema.sql          → Schema completo para Supabase
├── middleware.js            → Proteção de rotas
├── .env.example             → Modelo de variáveis de ambiente
└── README.md
```

---

## Perfis de Acesso

| Perfil | Tarefas | Clientes | Membros | Usuários | Dashboard |
|---|---|---|---|---|---|
| **Admin** | Total | Total | Total | Total | Total |
| **Gestor** | Total | Leitura/Edição | Leitura | — | Leitura |
| **Financeiro** | Leitura | Leitura | Leitura | — | Leitura |
| **Usuário** | Próprias | Leitura | Leitura | — | Leitura |

---

## Suporte

Em caso de dúvidas sobre configuração do Supabase ou deploy na Vercel, consulte:
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Resend](https://resend.com/docs)
