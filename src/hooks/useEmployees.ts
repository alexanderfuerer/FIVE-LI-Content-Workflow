import { useState, useEffect, useCallback } from 'react'
import type { Employee, EmployeeFormData } from '../types'
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../services/firestoreService'

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getEmployees()
      setEmployees(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch employees'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const addEmployee = async (data: EmployeeFormData, sampleTextsFile?: File) => {
    try {
      console.log('addEmployee called with:', { data, hasFile: !!sampleTextsFile })
      const id = await createEmployee(data, sampleTextsFile)
      console.log('addEmployee success, id:', id)
      await fetchEmployees()
      return id
    } catch (err) {
      console.error('addEmployee error:', err)
      throw err
    }
  }

  const editEmployee = async (id: string, data: Partial<EmployeeFormData>, sampleTextsFile?: File) => {
    try {
      console.log('editEmployee called with:', { id, data, hasFile: !!sampleTextsFile })
      await updateEmployee(id, data, sampleTextsFile)
      console.log('editEmployee success')
      await fetchEmployees()
    } catch (err) {
      console.error('editEmployee error:', err)
      throw err
    }
  }

  const removeEmployee = async (id: string) => {
    await deleteEmployee(id)
    await fetchEmployees()
  }

  return {
    employees,
    isLoading,
    error,
    refresh: fetchEmployees,
    addEmployee,
    editEmployee,
    removeEmployee,
  }
}

export function useEmployee(id: string | null) {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) {
      setEmployee(null)
      return
    }

    const fetchEmployee = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getEmployee(id)
        setEmployee(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch employee'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployee()
  }, [id])

  return { employee, isLoading, error }
}
