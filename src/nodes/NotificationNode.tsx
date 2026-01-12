import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Button } from '../components/ui'

interface NotificationNodeData {
  docUrl: string | null
  employeeId: string | null
  status: 'pending' | 'sending' | 'sent' | 'error'
  onSendNotification: () => void
}

interface NotificationNodeProps {
  data: NotificationNodeData
}

function NotificationNode({ data }: NotificationNodeProps) {
  const canSend = data.docUrl && data.employeeId && data.status !== 'sending' && data.status !== 'sent'

  const getStatusDisplay = () => {
    switch (data.status) {
      case 'sending':
        return { text: 'Wird gesendet...', color: 'text-blue-600', icon: '⏳' }
      case 'sent':
        return { text: 'Gesendet', color: 'text-green-600', icon: '✓' }
      case 'error':
        return { text: 'Fehler', color: 'text-red-600', icon: '✕' }
      default:
        return { text: 'Bereit', color: 'text-gray-400', icon: '○' }
    }
  }

  const statusDisplay = getStatusDisplay()

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4 min-w-[280px]">
      <Handle
        type="target"
        position={Position.Left}
        id="docUrl"
        className="!bg-blue-500 !w-3 !h-3"
        style={{ top: '40%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="employeeId"
        className="!bg-blue-500 !w-3 !h-3"
        style={{ top: '60%' }}
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="font-semibold text-gray-900">E-Mail Benachrichtigung</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <span className={data.docUrl ? 'text-green-600' : 'text-gray-400'}>
            {data.docUrl ? '✓' : '○'}
          </span>
          <span className={data.docUrl ? 'text-gray-700' : 'text-gray-400'}>
            Dokument bereit
          </span>
        </div>

        <div className={`flex items-center gap-2 text-sm ${statusDisplay.color}`}>
          <span>{statusDisplay.icon}</span>
          <span>{statusDisplay.text}</span>
        </div>

        {data.status !== 'sent' && (
          <Button
            onClick={data.onSendNotification}
            disabled={!canSend}
            isLoading={data.status === 'sending'}
            className="w-full nodrag"
          >
            {data.status === 'sending' ? 'Sende...' : 'Benachrichtigung senden'}
          </Button>
        )}

        {data.status === 'sent' && (
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <p className="text-sm text-green-700 font-medium">
              E-Mail erfolgreich gesendet!
            </p>
            <p className="text-xs text-green-600 mt-1">
              Der Mitarbeiter wurde benachrichtigt.
            </p>
          </div>
        )}

        {data.status === 'error' && (
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700">
              Fehler beim Senden. Bitte erneut versuchen.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(NotificationNode)
