import { useState, useCallback } from 'react'
import type { Employee, StyleProfile, WorkflowStatus } from '../types'
import { generatePost, calculatePostStats } from '../services/claudeService'
import { createLinkedInDoc } from '../services/googleService'
import { notifyEmployee } from '../services/notificationService'
import {
  createWorkflow,
  updateWorkflow,
  updateWorkflowStatus,
} from '../services/firestoreService'

export interface WorkflowState {
  inputContent: string
  selectedEmployeeId: string | null
  selectedEmployee: Employee | null
  styleProfile: StyleProfile | null
  generatedPost: string
  editedPost: string
  status: WorkflowStatus
  docUrl: string | null
  docId: string | null
  workflowId: string | null
}

const initialState: WorkflowState = {
  inputContent: '',
  selectedEmployeeId: null,
  selectedEmployee: null,
  styleProfile: null,
  generatedPost: '',
  editedPost: '',
  status: 'DRAFT',
  docUrl: null,
  docId: null,
  workflowId: null,
}

export function useWorkflow() {
  const [state, setState] = useState<WorkflowState>(initialState)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCreatingDoc, setIsCreatingDoc] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const setInputContent = useCallback((content: string) => {
    setState((prev) => ({ ...prev, inputContent: content }))
  }, [])

  const setSelectedEmployee = useCallback((employee: Employee | null, styleProfile: StyleProfile | null) => {
    setState((prev) => ({
      ...prev,
      selectedEmployeeId: employee?.id || null,
      selectedEmployee: employee,
      styleProfile,
    }))
  }, [])

  const setEditedPost = useCallback((content: string) => {
    setState((prev) => ({ ...prev, editedPost: content }))
  }, [])

  const generate = useCallback(async () => {
    if (!state.selectedEmployee || !state.styleProfile || !state.inputContent) {
      setError(new Error('Bitte wähle einen Mitarbeiter und gib Inhalt ein'))
      return
    }

    setIsGenerating(true)
    setError(null)
    setState((prev) => ({ ...prev, status: 'GENERATING' }))

    try {
      const post = await generatePost(
        state.inputContent,
        state.selectedEmployee,
        state.styleProfile
      )

      setState((prev) => ({
        ...prev,
        generatedPost: post,
        editedPost: post,
        status: 'REVIEW',
      }))

      // Create or update workflow in Firestore
      if (!state.workflowId) {
        const workflowId = await createWorkflow({
          employeeId: state.selectedEmployeeId!,
          inputContent: state.inputContent,
        })
        setState((prev) => ({ ...prev, workflowId }))
        await updateWorkflow(workflowId, {
          generatedContent: post,
          editedContent: post,
          status: 'REVIEW',
        })
      } else {
        await updateWorkflow(state.workflowId, {
          generatedContent: post,
          editedContent: post,
          status: 'REVIEW',
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Generieren'))
      setState((prev) => ({ ...prev, status: 'DRAFT' }))
    } finally {
      setIsGenerating(false)
    }
  }, [state.selectedEmployee, state.styleProfile, state.inputContent, state.workflowId, state.selectedEmployeeId])

  const saveProgress = useCallback(async () => {
    if (!state.workflowId) return

    await updateWorkflow(state.workflowId, {
      editedContent: state.editedPost,
    })
  }, [state.workflowId, state.editedPost])

  const approve = useCallback(async () => {
    if (!state.selectedEmployee || !state.editedPost) {
      setError(new Error('Kein Post zum Genehmigen'))
      return
    }

    setIsCreatingDoc(true)
    setError(null)

    try {
      // Create Google Doc
      const { docUrl, docId } = await createLinkedInDoc(
        state.editedPost,
        state.selectedEmployee.name,
        state.selectedEmployee.googleDriveFolderId
      )

      setState((prev) => ({
        ...prev,
        docUrl,
        docId,
        status: 'APPROVED',
      }))

      // Update workflow
      if (state.workflowId) {
        await updateWorkflow(state.workflowId, {
          editedContent: state.editedPost,
          googleDocUrl: docUrl,
          googleDocId: docId,
          status: 'APPROVED',
        })
      }

      return { docUrl, docId }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Erstellen des Dokuments'))
      throw err
    } finally {
      setIsCreatingDoc(false)
    }
  }, [state.selectedEmployee, state.editedPost, state.workflowId])

  const sendNotification = useCallback(async () => {
    if (!state.selectedEmployee || !state.docUrl) {
      setError(new Error('Kein Dokument zum Senden'))
      return false
    }

    setIsSending(true)
    setError(null)

    try {
      const success = await notifyEmployee(state.selectedEmployee, state.docUrl)

      if (success) {
        setState((prev) => ({ ...prev, status: 'NOTIFIED' }))

        if (state.workflowId) {
          await updateWorkflowStatus(state.workflowId, 'NOTIFIED')
        }
      }

      return success
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Senden der Benachrichtigung'))
      return false
    } finally {
      setIsSending(false)
    }
  }, [state.selectedEmployee, state.docUrl, state.workflowId])

  const reset = useCallback(() => {
    setState(initialState)
    setError(null)
  }, [])

  const getPostStats = useCallback(() => {
    return calculatePostStats(state.editedPost)
  }, [state.editedPost])

  return {
    state,
    isGenerating,
    isCreatingDoc,
    isSending,
    error,
    setInputContent,
    setSelectedEmployee,
    setEditedPost,
    generate,
    saveProgress,
    approve,
    sendNotification,
    reset,
    getPostStats,
  }
}
