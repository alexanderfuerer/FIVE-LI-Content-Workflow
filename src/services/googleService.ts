// Google Docs API Service
// Note: This service requires OAuth2 authentication setup

// Type declarations for Google APIs
interface GoogleTokenResponse {
  access_token?: string
  error?: string
}

interface GoogleTokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void
  callback: (response: GoogleTokenResponse) => void
}

interface GoogleApi {
  load: (api: string, callback: () => void) => void
  client: {
    init: (config: {
      apiKey: string
      discoveryDocs: string[]
    }) => Promise<void>
    docs: {
      documents: {
        create: (params: {
          resource: { title: string }
        }) => Promise<{ result: { documentId?: string } }>
        get: (params: {
          documentId: string
        }) => Promise<{
          result: {
            body?: {
              content?: Array<{
                paragraph?: {
                  elements?: Array<{
                    textRun?: { content?: string }
                  }>
                }
              }>
            }
          }
        }>
        batchUpdate: (params: {
          documentId: string
          resource: {
            requests: Array<{
              insertText?: {
                location: { index: number }
                text: string
              }
            }>
          }
        }) => Promise<void>
      }
    }
    drive: {
      files: {
        get: (params: {
          fileId: string
          fields: string
        }) => Promise<{ result: { parents?: string[] } }>
        update: (params: {
          fileId: string
          addParents: string
          removeParents: string
          fields: string
        }) => Promise<void>
      }
    }
  }
}

interface GoogleAccounts {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string
        scope: string
        callback: (response: GoogleTokenResponse) => void
      }) => GoogleTokenClient
    }
  }
}

declare global {
  interface Window {
    gapi: GoogleApi
    google: GoogleAccounts
  }
}

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/documents'

let tokenClient: GoogleTokenClient | null = null
let accessToken: string | null = null

// Initialize the Google API client
export async function initGoogleApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.onload = () => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            discoveryDocs: [
              'https://docs.googleapis.com/$discovery/rest?version=v1',
              'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
            ],
          })
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    }
    script.onerror = reject
    document.head.appendChild(script)

    // Load Google Identity Services
    const gisScript = document.createElement('script')
    gisScript.src = 'https://accounts.google.com/gsi/client'
    gisScript.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: (response: GoogleTokenResponse) => {
          if (response.access_token) {
            accessToken = response.access_token
          }
        },
      })
    }
    document.head.appendChild(gisScript)
  })
}

// Request access token
export function requestAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Token client not initialized'))
      return
    }

    tokenClient.callback = (response: GoogleTokenResponse) => {
      if (response.error) {
        reject(new Error(response.error))
        return
      }
      if (response.access_token) {
        accessToken = response.access_token
        resolve(response.access_token)
      }
    }

    if (accessToken) {
      resolve(accessToken)
    } else {
      tokenClient.requestAccessToken({ prompt: 'consent' })
    }
  })
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return accessToken !== null
}

// Create a new Google Doc with content
export async function createLinkedInDoc(
  content: string,
  employeeName: string,
  folderId: string
): Promise<{ docUrl: string; docId: string }> {
  // Ensure we have access
  await requestAccessToken()

  const date = new Date().toLocaleDateString('de-CH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const title = `LinkedIn Post - ${employeeName} - ${date}`

  // Create the document
  const createResponse = await window.gapi.client.docs.documents.create({
    resource: {
      title,
    },
  })

  const docId = createResponse.result.documentId
  if (!docId) {
    throw new Error('Failed to create document')
  }

  // Insert content into the document
  await window.gapi.client.docs.documents.batchUpdate({
    documentId: docId,
    resource: {
      requests: [
        {
          insertText: {
            location: {
              index: 1,
            },
            text: content,
          },
        },
      ],
    },
  })

  // Move the document to the specified folder
  if (folderId) {
    // Get the current parents
    const fileResponse = await window.gapi.client.drive.files.get({
      fileId: docId,
      fields: 'parents',
    })

    const previousParents = fileResponse.result.parents?.join(',') || ''

    // Move to new folder
    await window.gapi.client.drive.files.update({
      fileId: docId,
      addParents: folderId,
      removeParents: previousParents,
      fields: 'id, parents',
    })
  }

  const docUrl = `https://docs.google.com/document/d/${docId}/edit`

  return { docUrl, docId }
}

// Get document content
export async function getDocumentContent(docId: string): Promise<string> {
  await requestAccessToken()

  const response = await window.gapi.client.docs.documents.get({
    documentId: docId,
  })

  const content = response.result.body?.content || []
  let text = ''

  for (const element of content) {
    if (element.paragraph) {
      for (const paragraphElement of element.paragraph.elements || []) {
        if (paragraphElement.textRun) {
          text += paragraphElement.textRun.content || ''
        }
      }
    }
  }

  return text
}
