import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Input, Textarea, Card } from '../components/ui'
import { useEmployee, useEmployees } from '../hooks/useEmployees'
import { useStyleProfile } from '../hooks/useStyleProfile'
import type { EmployeeFormData } from '../types'

export default function EmployeeSetupPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNewEmployee = id === 'new'
  const { employee, isLoading: employeeLoading } = useEmployee(isNewEmployee ? null : id!)
  const { addEmployee, editEmployee } = useEmployees()
  const { styleProfile, isAnalyzing, runAnalysis, refresh } = useStyleProfile(
    isNewEmployee ? null : id!
  )

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    linkedinProfile: '',
    googleDriveFolderId: '',
    toneDescription: '',
  })
  const [sampleTextsFile, setSampleTextsFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Populate form when employee data is loaded
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        linkedinProfile: employee.linkedinProfile,
        googleDriveFolderId: employee.googleDriveFolderId,
        toneDescription: employee.toneDescription,
      })
    }
  }, [employee])

  const handleInputChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.txt')) {
        setError('Bitte lade eine .txt Datei hoch')
        return
      }
      setSampleTextsFile(file)
      setError(null)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSaving(true)

    try {
      if (isNewEmployee) {
        const newId = await addEmployee(formData, sampleTextsFile || undefined)
        navigate(`/employees/${newId}`)
      } else {
        await editEmployee(id!, formData, sampleTextsFile || undefined)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAnalyzeStyle = async () => {
    if (!employee?.sampleTextsUrl) {
      setError('Bitte lade zuerst Mustertexte hoch und speichere')
      return
    }

    setError(null)
    try {
      await runAnalysis(employee.sampleTextsUrl)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei der Stilanalyse')
    }
  }

  if (employeeLoading && !isNewEmployee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/employees')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück zur Liste
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNewEmployee ? 'Neuer Mitarbeiter' : 'Mitarbeiter bearbeiten'}
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Grunddaten</h2>
            <div className="grid gap-4">
              <Input
                id="name"
                label="Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Max Mustermann"
                required
              />
              <Input
                id="email"
                label="E-Mail"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="max@example.com"
                required
              />
              <Input
                id="linkedinProfile"
                label="LinkedIn Profil URL"
                value={formData.linkedinProfile}
                onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                placeholder="https://linkedin.com/in/maxmustermann"
              />
              <Input
                id="googleDriveFolderId"
                label="Google Drive Folder ID"
                value={formData.googleDriveFolderId}
                onChange={(e) => handleInputChange('googleDriveFolderId', e.target.value)}
                placeholder="1ABC123xyz..."
              />
            </div>
          </Card>

          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tone of Voice</h2>
            <Textarea
              id="toneDescription"
              label="Beschreibung des Stils"
              value={formData.toneDescription}
              onChange={(e) => handleInputChange('toneDescription', e.target.value)}
              placeholder="Beschreibe den Schreibstil des Mitarbeiters: z.B. motivierend, professionell, mit Humor, sachlich..."
              rows={4}
            />
          </Card>

          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mustertexte</h2>
            <p className="text-gray-600 text-sm mb-4">
              Lade eine .txt Datei mit Beispiel-LinkedIn-Posts hoch, um den Schreibstil zu analysieren.
            </p>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Datei auswählen
              </Button>
              {sampleTextsFile && (
                <span className="text-sm text-gray-600">
                  {sampleTextsFile.name}
                </span>
              )}
              {!sampleTextsFile && employee?.sampleTextsUrl && (
                <span className="text-sm text-green-600">
                  Mustertexte bereits hochgeladen
                </span>
              )}
            </div>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" isLoading={isSaving}>
              {isNewEmployee ? 'Anlegen' : 'Speichern'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/employees')}>
              Abbrechen
            </Button>
          </div>
        </form>

        {/* Style Profile Section - Only show for existing employees */}
        {!isNewEmployee && employee && (
          <div className="mt-8">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Stilprofil</h2>
                <Button
                  onClick={handleAnalyzeStyle}
                  isLoading={isAnalyzing}
                  disabled={!employee.sampleTextsUrl}
                >
                  {styleProfile ? 'Erneut analysieren' : 'Stilanalyse durchführen'}
                </Button>
              </div>

              {!employee.sampleTextsUrl && (
                <p className="text-gray-500 text-sm">
                  Lade zuerst Mustertexte hoch, um eine Stilanalyse durchzuführen.
                </p>
              )}

              {styleProfile && (
                <div className="mt-4 space-y-6">
                  {/* Quantitative Profile */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Quantitative Analyse</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Wörter/Post</p>
                        <p className="text-xl font-semibold">{styleProfile.quantitative.avgWordsPerPost}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Wörter/Satz</p>
                        <p className="text-xl font-semibold">{styleProfile.quantitative.avgWordsPerSentence}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Emojis/Post</p>
                        <p className="text-xl font-semibold">{styleProfile.quantitative.avgEmojisPerPost}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Absätze/Post</p>
                        <p className="text-xl font-semibold">{styleProfile.quantitative.avgParagraphBreaksPerPost}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Top Emojis</p>
                      <div className="flex gap-2">
                        {styleProfile.quantitative.topEmojis.map((emoji, i) => (
                          <span key={i} className="text-2xl">{emoji}</span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Häufige Wörter</p>
                      <div className="flex flex-wrap gap-2">
                        {styleProfile.quantitative.topWords.map((word, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Qualitative Profile */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Qualitative Analyse</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Tonalität</p>
                        <p className="text-gray-600">{styleProfile.qualitative.tonality}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Rhythmus & Struktur</p>
                        <p className="text-gray-600">{styleProfile.qualitative.rhythm}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Kommunikationsstil</p>
                        <p className="text-gray-600">{styleProfile.qualitative.communicationStyle}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Beliefs & Werte</p>
                        <p className="text-gray-600">{styleProfile.qualitative.beliefs}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
