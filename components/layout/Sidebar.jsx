'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  {
    section: 'VISÃO GERAL',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
    ],
  },
  {
    section: 'OPERAÇÕES',
    items: [
      { href: '/tarefas', label: 'Tarefas', icon: '☰' },
      { href: '/clientes', label: 'Clientes', icon: '👥' },
    ],
  },
  {
    section: 'EQUIPE',
    items: [
      { href: '/membros', label: 'Membros', icon: '👤' },
    ],
  },
  {
    section: 'ADMINISTRAÇÃO',
    items: [
      { href: '/usuarios', label: 'Usuários', icon: '⚙' },
      { href: '/configuracoes', label: 'Configurações', icon: '🔧' },
    ],
    adminOnly: true,
  },
]

export default function Sidebar({ user }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const role = user?.profile?.role || 'usuario'
  const isAdmin = role === 'admin'

  const initials = user?.profile?.name
    ? user.profile.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : (user?.email?.[0] || 'U').toUpperCase()

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) })
    router.push('/login')
  }

  const roleLabel = { admin: 'Administrador', gestor: 'Gestor', financeiro: 'Financeiro', usuario: 'Usuário' }[role] || role

  return (
    <aside className="w-64 min-h-screen bg-[#0A0A0A] flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-[#E31E24] font-black text-xl tracking-tight">///</span>
          <span className="text-white font-black text-xl tracking-tight">ARKAD</span>
        </div>
        <p className="text-white/30 text-xs mt-0.5 tracking-widest">TASK SYSTEM</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navItems.map((section) => {
          if (section.adminOnly && !isAdmin) return null
          return (
            <div key={section.section} className="mb-6">
              <p className="text-white/30 text-[10px] font-semibold tracking-widest px-3 mb-2">
                {section.section}
              </p>
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#E31E24] text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                    {isActive && <span className="ml-auto text-white/60">›</span>}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#E31E24] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.profile?.name || user?.email || 'Usuário'}
            </p>
            <p className="text-white/40 text-xs">{roleLabel}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sair"
            className="text-white/40 hover:text-white/80 transition-colors p-1"
          >
            {loggingOut ? '...' : '⏻'}
          </button>
        </div>
      </div>
    </aside>
  )
}
