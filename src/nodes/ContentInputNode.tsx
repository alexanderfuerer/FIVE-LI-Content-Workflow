import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Textarea } from '../components/ui'

interface ContentInputNodeData {
  content: string
  onContentChange: (content: string) => void
}

interface ContentInputNodeProps {
  data: ContentInputNodeData
}

function ContentInputNode({ data }: ContentInputNodeProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4 min-w-[300px]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h3 className="font-semibold text-gray-900">Inhaltseingabe</h3>
      </div>

      <Textarea
        placeholder="Beschreibe das Thema oder den Inhalt für den LinkedIn-Post..."
        value={data.content || ''}
        onChange={(e) => data.onContentChange(e.target.value)}
        rows={5}
        className="nodrag"
      />

      <Handle
        type="source"
        position={Position.Right}
        id="rawContent"
        className="!bg-purple-500 !w-3 !h-3"
      />
    </div>
  )
}

export default memo(ContentInputNode)
