import { Timestamp } from 'firebase/firestore'

// Employee types
export interface Employee {
  id: string
  name: string
  email: string
  linkedinProfile: string
  googleDriveFolderId: string
  toneDescription: string
  sampleTextsUrl: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface EmployeeFormData {
  name: string
  email: string
  linkedinProfile: string
  googleDriveFolderId: string
  toneDescription: string
}

// Style Profile types
export interface SentenceLengthDistribution {
  under3Words: number
  words4to8: number
  words9to15: number
  words16to25: number
  over25Words: number
}

export interface QuantitativeProfile {
  avgWordsPerPost: number
  avgWordsPerSentence: number
  avgSentencesPerParagraph: number
  avgLinesPerParagraph: number
  avgEmojisPerPost: number
  emojiToTextRatio: number
  topEmojis: string[]
  topWords: string[]
  avgLineBreaksPerPost: number
  avgParagraphBreaksPerPost: number
  sentenceLengthDistribution: SentenceLengthDistribution
}

export interface QualitativeProfile {
  tonality: string
  rhythm: string
  communicationStyle: string
  beliefs: string
}

export interface StyleProfile {
  id: string
  employeeId: string
  analyzedAt: Timestamp
  quantitative: QuantitativeProfile
  qualitative: QualitativeProfile
}

// Workflow types
export type WorkflowStatus = 'DRAFT' | 'GENERATING' | 'REVIEW' | 'APPROVED' | 'NOTIFIED'

export interface Workflow {
  id: string
  employeeId: string
  inputContent: string
  generatedContent: string
  editedContent: string
  status: WorkflowStatus
  googleDocUrl: string | null
  googleDocId: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface WorkflowFormData {
  employeeId: string
  inputContent: string
}

// Node Editor types
export interface NodeData {
  label: string
  [key: string]: unknown
}

export interface ContentInputNodeData extends NodeData {
  content: string
  onContentChange: (content: string) => void
}

export interface EmployeeSelectNodeData extends NodeData {
  selectedEmployeeId: string | null
  employees: Employee[]
  styleProfile: StyleProfile | null
  onEmployeeSelect: (employeeId: string) => void
}

export interface GeneratorNodeData extends NodeData {
  rawContent: string
  employeeId: string | null
  generatedPost: string
  isGenerating: boolean
  onGenerate: () => void
}

export interface ReviewNodeData extends NodeData {
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

export interface GoogleDocsNodeData extends NodeData {
  editedPost: string
  employeeId: string | null
  approved: boolean
  docUrl: string | null
  isCreating: boolean
  onCreateDoc: () => void
}

export interface NotificationNodeData extends NodeData {
  docUrl: string | null
  employeeId: string | null
  status: 'pending' | 'sent' | 'error'
  onSendNotification: () => void
}
