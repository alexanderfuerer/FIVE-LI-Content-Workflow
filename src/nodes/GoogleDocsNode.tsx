import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Button } from '../components/ui'

interface GoogleDocsNodeData {
  editedPost: string
  employeeId: string | null
  approved: boolean
  docUrl: string | null
  isCreating: boolean
  onCreateDoc: () => void
}

interface GoogleDocsNodeProps {
  data: GoogleDocsNodeData
}

function GoogleDocsNode({ data }: GoogleDocsNodeProps) {
  const canCreate = data.approved && data.editedPost && data.employeeId && !data.isCreating

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4 min-w-[280px]">
      <Handle
        type="target"
        position={Position.Left}
        id="editedPost"
        className="!bg-yellow-500 !w-3 !h-3"
        style={{ top: '35%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="approved"
        className="!bg-yellow-500 !w-3 !h-3"
        style={{ top: '50%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="employeeId"
        className="!bg-blue-500 !w-3 !h-3"
        style={{ top: '65%' }}
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="font-semibold text-gray-900">Google Docs</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <span className={data.approved ? 'text-green-600' : 'text-gray-400'}>
            {data.approved ? '✓' : '○'}
          </span>
          <span className={data.approved ? 'text-gray-700' : 'text-gray-400'}>
            Post genehmigt
          </span>
        </div>

        {!data.docUrl ? (
          <Button
            onClick={data.onCreateDoc}
            disabled={!canCreate}
            isLoading={data.isCreating}
            className="w-full nodrag"
          >
            {data.isCreating ? 'Erstelle...' : 'Dokument erstellen'}
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Dokument erstellt
            </div>
            <a
              href={data.docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm nodrag"
            >
              Dokument öffnen
            </a>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="docUrl"
        className="!bg-blue-500 !w-3 !h-3"
      />
    </div>
  )
}

export default memo(GoogleDocsNode)
