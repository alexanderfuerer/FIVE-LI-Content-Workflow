import type { WorkflowStatus } from '../../types'

interface BadgeProps {
  status: WorkflowStatus | 'hasProfile' | 'noProfile'
  className?: string
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  DRAFT: { label: 'Entwurf', classes: 'bg-gray-100 text-gray-700' },
  GENERATING: { label: 'Generiert...', classes: 'bg-blue-100 text-blue-700' },
  REVIEW: { label: 'Review', classes: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: 'Genehmigt', classes: 'bg-green-100 text-green-700' },
  NOTIFIED: { label: 'Benachrichtigt', classes: 'bg-purple-100 text-purple-700' },
  hasProfile: { label: 'Stilprofil vorhanden', classes: 'bg-green-100 text-green-700' },
  noProfile: { label: 'Kein Stilprofil', classes: 'bg-gray-100 text-gray-500' },
}

export default function Badge({ status, className = '' }: BadgeProps) {
  const config = statusConfig[status] || statusConfig.DRAFT

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes} ${className}`}
    >
      {config.label}
    </span>
  )
}
