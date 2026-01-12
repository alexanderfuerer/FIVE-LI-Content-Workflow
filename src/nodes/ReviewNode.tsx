import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Button, Textarea } from '../components/ui'

interface ReviewNodeData {
  generatedPost: string
  editedPost: string
  wordCount: number
  emojiCount: number
  paragraphCount: number
  onEdit: (content: string) => void
  onRegenerate: () => void
  onSave: () => void
  onApprove: () => void
}

interface ReviewNodeProps {
  data: ReviewNodeData
}

function ReviewNode({ data }: ReviewNodeProps) {
  const hasContent = data.generatedPost || data.editedPost

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4 min-w-[400px] max-w-[500px]">
      <Handle
        type="target"
        position={Position.Left}
        id="generatedPost"
        className="!bg-green-500 !w-3 !h-3"
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
        <h3 className="font-semibold text-gray-900">Review & Bearbeitung</h3>
      </div>

      {hasContent ? (
        <>
          <Textarea
            value={data.editedPost}
            onChange={(e) => data.onEdit(e.target.value)}
            rows={10}
            className="nodrag mb-3 text-sm"
          />

          {/* Live Statistics */}
          <div className="flex gap-4 mb-4 p-2 bg-gray-50 rounded-lg text-sm">
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Wörter:</span>
              <span className="font-medium">{data.wordCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Emojis:</span>
              <span className="font-medium">{data.emojiCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Absätze:</span>
              <span className="font-medium">{data.paragraphCount}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={data.onRegenerate}
              className="nodrag"
            >
              Neu generieren
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={data.onSave}
              className="nodrag"
            >
              Zwischenspeichern
            </Button>
            <Button
              size="sm"
              onClick={data.onApprove}
              className="nodrag"
            >
              Approve & Senden
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">Warte auf generierten Post...</p>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        id="editedPost"
        className="!bg-yellow-500 !w-3 !h-3"
        style={{ top: '40%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="approved"
        className="!bg-yellow-500 !w-3 !h-3"
        style={{ top: '60%' }}
      />
    </div>
  )
}

export default memo(ReviewNode)
