import { useState, useEffect, useCallback } from 'react'
import type { StyleProfile } from '../types'
import {
  getStyleProfileByEmployee,
  fetchSampleTextsContent,
} from '../services/firestoreService'
import { analyzeStyle } from '../services/claudeService'

export function useStyleProfile(employeeId: string | null) {
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchStyleProfile = useCallback(async () => {
    if (!employeeId) {
      setStyleProfile(null)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const profile = await getStyleProfileByEmployee(employeeId)
      setStyleProfile(profile)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch style profile'))
    } finally {
      setIsLoading(false)
    }
  }, [employeeId])

  useEffect(() => {
    fetchStyleProfile()
  }, [fetchStyleProfile])

  const runAnalysis = async (sampleTextsUrl: string) => {
    if (!employeeId) {
      throw new Error('No employee ID provided')
    }

    setIsAnalyzing(true)
    setError(null)
    try {
      // Fetch the sample texts content
      const sampleTexts = await fetchSampleTextsContent(sampleTextsUrl)

      // Run Claude analysis
      const profile = await analyzeStyle(sampleTexts, employeeId)
      setStyleProfile(profile)
      return profile
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to analyze style')
      setError(error)
      throw error
    } finally {
      setIsAnalyzing(false)
    }
  }

  return {
    styleProfile,
    isLoading,
    isAnalyzing,
    error,
    refresh: fetchStyleProfile,
    runAnalysis,
  }
}

export function useStyleProfiles(employeeIds: string[]) {
  const [profiles, setProfiles] = useState<Map<string, StyleProfile | null>>(new Map())
  const [isLoading, setIsLoading] = useState(false)

  // Create a stable string key from the array
  const employeeIdsKey = employeeIds?.join(',') ?? ''

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!employeeIds || employeeIds.length === 0) {
        setProfiles(new Map())
        return
      }

      setIsLoading(true)
      const profileMap = new Map<string, StyleProfile | null>()

      await Promise.all(
        employeeIds.map(async (id) => {
          try {
            const profile = await getStyleProfileByEmployee(id)
            profileMap.set(id, profile)
          } catch {
            profileMap.set(id, null)
          }
        })
      )

      setProfiles(profileMap)
      setIsLoading(false)
    }

    fetchProfiles()
  }, [employeeIdsKey])

  const hasProfile = (employeeId: string): boolean => {
    return profiles.get(employeeId) !== null && profiles.get(employeeId) !== undefined
  }

  return { profiles, isLoading, hasProfile }
}
