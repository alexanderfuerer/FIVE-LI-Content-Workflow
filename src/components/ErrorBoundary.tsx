import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error)
    console.error('Component stack:', errorInfo.componentStack)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-red-700 mb-4">
              Ein Fehler ist aufgetreten
            </h1>
            <div className="bg-white rounded-lg shadow p-6 mb-4">
              <h2 className="font-semibold text-red-600 mb-2">Fehlermeldung:</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {this.state.error?.message}
              </pre>
            </div>
            {this.state.error?.stack && (
              <div className="bg-white rounded-lg shadow p-6 mb-4">
                <h2 className="font-semibold text-red-600 mb-2">Stack Trace:</h2>
                <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm text-xs">
                  {this.state.error.stack}
                </pre>
              </div>
            )}
            {this.state.errorInfo?.componentStack && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="font-semibold text-red-600 mb-2">Component Stack:</h2>
                <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm text-xs">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Seite neu laden
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
