import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Select, Badge } from '../components/ui'
import type { Employee, StyleProfile } from '../types'

interface EmployeeSelectNodeData {
  selectedEmployeeId: string | null
  employees: Employee[]
  styleProfile: StyleProfile | null
  onEmployeeSelect: (employeeId: string) => void
}

interface EmployeeSelectNodeProps {
  data: EmployeeSelectNodeData
}

function EmployeeSelectNode({ data }: EmployeeSelectNodeProps) {
  const selectedEmployee = data.employees.find((e: Employee) => e.id === data.selectedEmployeeId)

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4 min-w-[280px]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="font-semibold text-gray-900">Mitarbeiter</h3>
      </div>

      <Select
        options={data.employees.map((e: Employee) => ({ value: e.id, label: e.name }))}
        value={data.selectedEmployeeId || ''}
        onChange={(e) => data.onEmployeeSelect(e.target.value)}
        placeholder="Mitarbeiter wählen..."
        className="nodrag"
      />

      {selectedEmployee && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{selectedEmployee.name}</span>
            <Badge status={data.styleProfile ? 'hasProfile' : 'noProfile'} />
          </div>
          {data.styleProfile && (
            <div className="text-xs text-gray-500 space-y-1">
              <p>Wörter/Post: ~{data.styleProfile.quantitative.avgWordsPerPost}</p>
              <p>Emojis: {data.styleProfile.quantitative.topEmojis.slice(0, 3).join(' ')}</p>
              <p className="truncate">Stil: {data.styleProfile.qualitative.tonality}</p>
            </div>
          )}
          {!data.styleProfile && (
            <p className="text-xs text-amber-600">
              Bitte zuerst Stilanalyse durchführen
            </p>
          )}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        id="employeeId"
        className="!bg-blue-500 !w-3 !h-3"
        style={{ top: '40%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="styleProfile"
        className="!bg-blue-500 !w-3 !h-3"
        style={{ top: '60%' }}
      />
    </div>
  )
}

export default memo(EmployeeSelectNode)
