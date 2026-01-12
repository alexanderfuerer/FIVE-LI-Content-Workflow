import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  orderBy,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from './firebase'
import type {
  Employee,
  EmployeeFormData,
  StyleProfile,
  QuantitativeProfile,
  QualitativeProfile,
  Workflow,
  WorkflowFormData,
  WorkflowStatus,
} from '../types'

// Collection references
const EMPLOYEES_COLLECTION = 'employees'
const STYLE_PROFILES_COLLECTION = 'styleProfiles'
const WORKFLOWS_COLLECTION = 'workflows'

// ==================== EMPLOYEES ====================

export async function getEmployees(): Promise<Employee[]> {
  const querySnapshot = await getDocs(
    query(collection(db, EMPLOYEES_COLLECTION), orderBy('createdAt', 'desc'))
  )
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Employee[]
}

export async function getEmployee(id: string): Promise<Employee | null> {
  const docRef = doc(db, EMPLOYEES_COLLECTION, id)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Employee
  }
  return null
}

export async function createEmployee(
  data: EmployeeFormData,
  sampleTextsFile?: File
): Promise<string> {
  let sampleTextsUrl = ''

  if (sampleTextsFile) {
    const storageRef = ref(storage, `sample-texts/${Date.now()}-${sampleTextsFile.name}`)
    await uploadBytes(storageRef, sampleTextsFile)
    sampleTextsUrl = await getDownloadURL(storageRef)
  }

  const docRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), {
    ...data,
    sampleTextsUrl,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })

  return docRef.id
}

export async function updateEmployee(
  id: string,
  data: Partial<EmployeeFormData>,
  sampleTextsFile?: File
): Promise<void> {
  const docRef = doc(db, EMPLOYEES_COLLECTION, id)
  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: Timestamp.now(),
  }

  if (sampleTextsFile) {
    const storageRef = ref(storage, `sample-texts/${Date.now()}-${sampleTextsFile.name}`)
    await uploadBytes(storageRef, sampleTextsFile)
    updateData.sampleTextsUrl = await getDownloadURL(storageRef)
  }

  await updateDoc(docRef, updateData)
}

export async function deleteEmployee(id: string): Promise<void> {
  // Get the employee to check for sample texts URL
  const employee = await getEmployee(id)

  if (employee?.sampleTextsUrl) {
    try {
      const storageRef = ref(storage, employee.sampleTextsUrl)
      await deleteObject(storageRef)
    } catch (error) {
      console.error('Error deleting sample texts file:', error)
    }
  }

  // Delete associated style profile
  const styleProfile = await getStyleProfileByEmployee(id)
  if (styleProfile) {
    await deleteDoc(doc(db, STYLE_PROFILES_COLLECTION, styleProfile.id))
  }

  // Delete the employee document
  await deleteDoc(doc(db, EMPLOYEES_COLLECTION, id))
}

// ==================== STYLE PROFILES ====================

export async function getStyleProfiles(): Promise<StyleProfile[]> {
  const querySnapshot = await getDocs(collection(db, STYLE_PROFILES_COLLECTION))
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as StyleProfile[]
}

export async function getStyleProfile(id: string): Promise<StyleProfile | null> {
  const docRef = doc(db, STYLE_PROFILES_COLLECTION, id)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as StyleProfile
  }
  return null
}

export async function getStyleProfileByEmployee(employeeId: string): Promise<StyleProfile | null> {
  const q = query(
    collection(db, STYLE_PROFILES_COLLECTION),
    where('employeeId', '==', employeeId)
  )
  const querySnapshot = await getDocs(q)
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0]
    return { id: doc.id, ...doc.data() } as StyleProfile
  }
  return null
}

export async function saveStyleProfile(
  employeeId: string,
  quantitative: QuantitativeProfile,
  qualitative: QualitativeProfile
): Promise<string> {
  // Check if profile already exists
  const existingProfile = await getStyleProfileByEmployee(employeeId)

  const profileData = {
    employeeId,
    analyzedAt: Timestamp.now(),
    quantitative,
    qualitative,
  }

  if (existingProfile) {
    await updateDoc(doc(db, STYLE_PROFILES_COLLECTION, existingProfile.id), profileData)
    return existingProfile.id
  }

  const docRef = await addDoc(collection(db, STYLE_PROFILES_COLLECTION), profileData)
  return docRef.id
}

export async function deleteStyleProfile(id: string): Promise<void> {
  await deleteDoc(doc(db, STYLE_PROFILES_COLLECTION, id))
}

// ==================== WORKFLOWS ====================

export async function getWorkflows(): Promise<Workflow[]> {
  const querySnapshot = await getDocs(
    query(collection(db, WORKFLOWS_COLLECTION), orderBy('createdAt', 'desc'))
  )
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Workflow[]
}

export async function getWorkflow(id: string): Promise<Workflow | null> {
  const docRef = doc(db, WORKFLOWS_COLLECTION, id)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Workflow
  }
  return null
}

export async function getWorkflowsByEmployee(employeeId: string): Promise<Workflow[]> {
  const q = query(
    collection(db, WORKFLOWS_COLLECTION),
    where('employeeId', '==', employeeId),
    orderBy('createdAt', 'desc')
  )
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Workflow[]
}

export async function createWorkflow(data: WorkflowFormData): Promise<string> {
  const docRef = await addDoc(collection(db, WORKFLOWS_COLLECTION), {
    ...data,
    generatedContent: '',
    editedContent: '',
    status: 'DRAFT' as WorkflowStatus,
    googleDocUrl: null,
    googleDocId: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return docRef.id
}

export async function updateWorkflow(
  id: string,
  data: Partial<Omit<Workflow, 'id' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, WORKFLOWS_COLLECTION, id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  })
}

export async function updateWorkflowStatus(id: string, status: WorkflowStatus): Promise<void> {
  await updateWorkflow(id, { status })
}

export async function deleteWorkflow(id: string): Promise<void> {
  await deleteDoc(doc(db, WORKFLOWS_COLLECTION, id))
}

// ==================== UTILITY FUNCTIONS ====================

export async function checkEmployeeHasStyleProfile(employeeId: string): Promise<boolean> {
  const profile = await getStyleProfileByEmployee(employeeId)
  return profile !== null
}

export async function fetchSampleTextsContent(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch sample texts')
  }
  return response.text()
}
