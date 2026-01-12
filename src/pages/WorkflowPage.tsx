import { useCallback, useMemo, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import {
  ContentInputNode,
  EmployeeSelectNode,
  GeneratorNode,
  ReviewNode,
  GoogleDocsNode,
  NotificationNode,
} from '../nodes'
import { useEmployees } from '../hooks/useEmployees'
import { useWorkflow } from '../hooks/useWorkflow'
import { useStyleProfile } from '../hooks/useStyleProfile'

const nodeTypes = {
  contentInput: ContentInputNode,
  employeeSelect: EmployeeSelectNode,
  generator: GeneratorNode,
  review: ReviewNode,
  googleDocs: GoogleDocsNode,
  notification: NotificationNode,
}

const initialNodes: Node[] = [
  {
    id: 'contentInput',
    type: 'contentInput',
    position: { x: 50, y: 100 },
    data: { content: '', onContentChange: () => {} },
  },
  {
    id: 'employeeSelect',
    type: 'employeeSelect',
    position: { x: 50, y: 350 },
    data: {
      selectedEmployeeId: null,
      employees: [],
      styleProfile: null,
      onEmployeeSelect: () => {},
    },
  },
  {
    id: 'generator',
    type: 'generator',
    position: { x: 420, y: 200 },
    data: {
      rawContent: '',
      employeeId: null,
      generatedPost: '',
      isGenerating: false,
      onGenerate: () => {},
    },
  },
  {
    id: 'review',
    type: 'review',
    position: { x: 720, y: 150 },
    data: {
      generatedPost: '',
      editedPost: '',
      wordCount: 0,
      emojiCount: 0,
      paragraphCount: 0,
      onEdit: () => {},
      onRegenerate: () => {},
      onSave: () => {},
      onApprove: () => {},
    },
  },
  {
    id: 'googleDocs',
    type: 'googleDocs',
    position: { x: 1250, y: 100 },
    data: {
      editedPost: '',
      employeeId: null,
      approved: false,
      docUrl: null,
      isCreating: false,
      onCreateDoc: () => {},
    },
  },
  {
    id: 'notification',
    type: 'notification',
    position: { x: 1250, y: 380 },
    data: {
      docUrl: null,
      employeeId: null,
      status: 'pending' as const,
      onSendNotification: () => {},
    },
  },
]

const initialEdges: Edge[] = [
  { id: 'e1', source: 'contentInput', sourceHandle: 'rawContent', target: 'generator', targetHandle: 'rawContent', animated: true },
  { id: 'e2', source: 'employeeSelect', sourceHandle: 'employeeId', target: 'generator', targetHandle: 'employeeId', animated: true },
  { id: 'e3', source: 'generator', sourceHandle: 'generatedPost', target: 'review', targetHandle: 'generatedPost', animated: true },
  { id: 'e4', source: 'review', sourceHandle: 'editedPost', target: 'googleDocs', targetHandle: 'editedPost', animated: true },
  { id: 'e5', source: 'review', sourceHandle: 'approved', target: 'googleDocs', targetHandle: 'approved', animated: true },
  { id: 'e6', source: 'employeeSelect', sourceHandle: 'employeeId', target: 'googleDocs', targetHandle: 'employeeId', animated: true },
  { id: 'e7', source: 'googleDocs', sourceHandle: 'docUrl', target: 'notification', targetHandle: 'docUrl', animated: true },
  { id: 'e8', source: 'employeeSelect', sourceHandle: 'employeeId', target: 'notification', targetHandle: 'employeeId', animated: true },
]

export default function WorkflowPage() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const { employees } = useEmployees()
  const workflow = useWorkflow()
  const { styleProfile } = useStyleProfile(workflow.state.selectedEmployeeId)

  // Set selected employee with style profile
  useEffect(() => {
    if (workflow.state.selectedEmployeeId && styleProfile) {
      const employee = employees.find((e) => e.id === workflow.state.selectedEmployeeId)
      if (employee) {
        workflow.setSelectedEmployee(employee, styleProfile)
      }
    }
  }, [styleProfile, workflow.state.selectedEmployeeId, employees])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  // Update nodes with current data and handlers
  const updatedNodes = useMemo(() => {
    const stats = workflow.getPostStats()

    return nodes.map((node) => {
      switch (node.id) {
        case 'contentInput':
          return {
            ...node,
            data: {
              content: workflow.state.inputContent,
              onContentChange: workflow.setInputContent,
            },
          }
        case 'employeeSelect':
          return {
            ...node,
            data: {
              selectedEmployeeId: workflow.state.selectedEmployeeId,
              employees,
              styleProfile: workflow.state.styleProfile,
              onEmployeeSelect: (employeeId: string) => {
                const employee = employees.find((e) => e.id === employeeId)
                workflow.setSelectedEmployee(employee || null, null)
              },
            },
          }
        case 'generator':
          return {
            ...node,
            data: {
              rawContent: workflow.state.inputContent,
              employeeId: workflow.state.selectedEmployeeId,
              generatedPost: workflow.state.generatedPost,
              isGenerating: workflow.isGenerating,
              onGenerate: workflow.generate,
            },
          }
        case 'review':
          return {
            ...node,
            data: {
              generatedPost: workflow.state.generatedPost,
              editedPost: workflow.state.editedPost,
              wordCount: stats.wordCount,
              emojiCount: stats.emojiCount,
              paragraphCount: stats.paragraphCount,
              onEdit: workflow.setEditedPost,
              onRegenerate: workflow.generate,
              onSave: workflow.saveProgress,
              onApprove: workflow.approve,
            },
          }
        case 'googleDocs':
          return {
            ...node,
            data: {
              editedPost: workflow.state.editedPost,
              employeeId: workflow.state.selectedEmployeeId,
              approved: workflow.state.status === 'APPROVED' || workflow.state.status === 'NOTIFIED',
              docUrl: workflow.state.docUrl,
              isCreating: workflow.isCreatingDoc,
              onCreateDoc: workflow.approve,
            },
          }
        case 'notification':
          return {
            ...node,
            data: {
              docUrl: workflow.state.docUrl,
              employeeId: workflow.state.selectedEmployeeId,
              status: workflow.isSending
                ? 'sending'
                : workflow.state.status === 'NOTIFIED'
                ? 'sent'
                : workflow.error
                ? 'error'
                : 'pending',
              onSendNotification: workflow.sendNotification,
            },
          }
        default:
          return node
      }
    })
  }, [
    nodes,
    employees,
    workflow.state,
    workflow.isGenerating,
    workflow.isCreatingDoc,
    workflow.isSending,
    workflow.error,
    workflow.setInputContent,
    workflow.setSelectedEmployee,
    workflow.setEditedPost,
    workflow.generate,
    workflow.saveProgress,
    workflow.approve,
    workflow.sendNotification,
    workflow.getPostStats,
  ])

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Workflow Editor</h1>
          <p className="text-sm text-gray-500">LinkedIn Post Generator</p>
        </div>
        <div className="flex items-center gap-4">
          {workflow.state.status !== 'DRAFT' && (
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                workflow.state.status === 'GENERATING'
                  ? 'bg-blue-100 text-blue-700'
                  : workflow.state.status === 'REVIEW'
                  ? 'bg-yellow-100 text-yellow-700'
                  : workflow.state.status === 'APPROVED'
                  ? 'bg-green-100 text-green-700'
                  : workflow.state.status === 'NOTIFIED'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {workflow.state.status}
            </span>
          )}
          <button
            onClick={workflow.reset}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Zurücksetzen
          </button>
        </div>
      </div>

      {/* Error Display */}
      {workflow.error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <p className="text-red-700 text-sm">{workflow.error.message}</p>
        </div>
      )}

      {/* React Flow Canvas */}
      <div className="flex-1" style={{ backgroundColor: '#1a1a2e' }}>
        <ReactFlow
          nodes={updatedNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2d2d4a" />
          <Controls className="!bg-white !border-gray-200" />
          <MiniMap
            nodeColor={() => '#4f46e5'}
            maskColor="rgba(0, 0, 0, 0.8)"
            className="!bg-gray-900"
          />
        </ReactFlow>
      </div>
    </div>
  )
}
