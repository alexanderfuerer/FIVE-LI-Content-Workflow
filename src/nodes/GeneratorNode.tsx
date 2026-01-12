import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Button } from '../components/ui'

interface GeneratorNodeData {
  rawContent: string
  employeeId: string | null
  generatedPost: string
  isGenerating: boolean
  onGenerate: () => void
}

interface GeneratorNodeProps {
  data: GeneratorNodeData
}

function GeneratorNode({ data }: GeneratorNodeProps) {
  const canGenerate = data.rawContent && data.employeeId && !data.isGenerating

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4 min-w-[250px]">
      <Handle
        type="target"
        position={Position.Left}
        id="rawContent"
        className="!bg-purple-500 !w-3 !h-3"
        style={{ top: '35%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="employeeId"
        className="!bg-blue-500 !w-3 !h-3"
        style={{ top: '65%' }}
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="font-semibold text-gray-900">Generator</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <span className={data.rawContent ? 'text-green-600' : 'text-gray-400'}>
            {data.rawContent ? '✓' : '○'}
          </span>
          <span className={data.rawContent ? 'text-gray-700' : 'text-gray-400'}>
            Inhalt vorhanden
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={data.employeeId ? 'text-green-600' : 'text-gray-400'}>
            {data.employeeId ? '✓' : '○'}
          </span>
          <span className={data.employeeId ? 'text-gray-700' : 'text-gray-400'}>
            Mitarbeiter gewählt
          </span>
        </div>

        <Button
          onClick={data.onGenerate}
          disabled={!canGenerate}
          isLoading={data.isGenerating}
          className="w-full nodrag"
        >
          {data.isGenerating ? 'Generiere...' : 'Post generieren'}
        </Button>

        {data.generatedPost && (
          <div className="text-xs text-green-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Post generiert
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="generatedPost"
        className="!bg-green-500 !w-3 !h-3"
      />
    </div>
  )
}

export default memo(GeneratorNode)
