export const PRIORITY_CONFIG = {
  urgente: { label: 'Urgente', className: 'bg-red-100 text-red-700 border border-red-200' },
  alta:    { label: 'Alta',    className: 'bg-orange-100 text-orange-700 border border-orange-200' },
  media:   { label: 'Média',   className: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
  baixa:   { label: 'Baixa',   className: 'bg-green-100 text-green-700 border border-green-200' },
}

export const STATUS_CONFIG = {
  pendente:     { label: 'Pendente',     className: 'bg-gray-100 text-gray-700 border border-gray-200' },
  em_andamento: { label: 'Em Andamento', className: 'bg-blue-100 text-blue-700 border border-blue-200' },
  em_revisao:   { label: 'Em Revisão',   className: 'bg-purple-100 text-purple-700 border border-purple-200' },
  concluida:    { label: 'Concluída',    className: 'bg-green-100 text-green-700 border border-green-200' },
  atrasada:     { label: 'Atrasada',     className: 'bg-red-100 text-red-700 border border-red-200' },
  cancelada:    { label: 'Cancelada',    className: 'bg-gray-100 text-gray-500 border border-gray-200' },
}

export const CLIENT_STATUS_CONFIG = {
  ativo:   { label: 'Ativo',   className: 'bg-green-100 text-green-700 border border-green-200' },
  pausado: { label: 'Pausado', className: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
  risco:   { label: 'Risco',   className: 'bg-orange-100 text-orange-700 border border-orange-200' },
  churn:   { label: 'Churn',   className: 'bg-red-100 text-red-700 border border-red-200' },
}

export const ROLE_CONFIG = {
  admin:      { label: 'Administrador', className: 'bg-red-100 text-red-700 border border-red-200' },
  gestor:     { label: 'Gestor',        className: 'bg-blue-100 text-blue-700 border border-blue-200' },
  financeiro: { label: 'Financeiro',    className: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
  usuario:    { label: 'Usuário',       className: 'bg-gray-100 text-gray-700 border border-gray-200' },
}

export default function Badge({ value, config, className = '' }) {
  const cfg = config?.[value] || { label: value, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className} ${className}`}>
      {cfg.label}
    </span>
  )
}
