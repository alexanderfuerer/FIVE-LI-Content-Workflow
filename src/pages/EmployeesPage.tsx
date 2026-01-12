import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Badge, Modal } from '../components/ui'
import { useEmployees } from '../hooks/useEmployees'
import { useStyleProfiles } from '../hooks/useStyleProfile'

export default function EmployeesPage() {
  const navigate = useNavigate()
  const { employees, isLoading, removeEmployee } = useEmployees()
  const { hasProfile, isLoading: profilesLoading } = useStyleProfiles(
    employees.map((e) => e.id)
  )
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; employeeId: string | null }>({
    isOpen: false,
    employeeId: null,
  })
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteModal.employeeId) return

    setIsDeleting(true)
    try {
      await removeEmployee(deleteModal.employeeId)
      setDeleteModal({ isOpen: false, employeeId: null })
    } catch (error) {
      console.error('Failed to delete employee:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mitarbeiter</h1>
            <p className="text-gray-600 mt-1">Verwalte Mitarbeiter und ihre Stilprofile</p>
          </div>
          <Button onClick={() => navigate('/employees/new')}>
            Neu anlegen
          </Button>
        </div>

        {employees.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Mitarbeiter</h3>
            <p className="text-gray-500 mb-4">Erstelle deinen ersten Mitarbeiter, um loszulegen.</p>
            <Button onClick={() => navigate('/employees/new')}>
              Mitarbeiter anlegen
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {employees.map((employee) => (
              <Card key={employee.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-500">{employee.email}</p>
                  </div>
                  <div className="ml-4">
                    {!profilesLoading && (
                      <Badge status={hasProfile(employee.id) ? 'hasProfile' : 'noProfile'} />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {employee.linkedinProfile && (
                    <a
                      href={employee.linkedinProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/employees/${employee.id}`)}
                  >
                    Bearbeiten
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteModal({ isOpen: true, employeeId: employee.id })}
                  >
                    Löschen
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, employeeId: null })}
        title="Mitarbeiter löschen"
      >
        <p className="text-gray-600 mb-6">
          Bist du sicher, dass du diesen Mitarbeiter löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ isOpen: false, employeeId: null })}
          >
            Abbrechen
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Löschen
          </Button>
        </div>
      </Modal>
    </div>
  )
}
