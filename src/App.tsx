import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import WorkflowPage from './pages/WorkflowPage'
import EmployeesPage from './pages/EmployeesPage'
import EmployeeSetupPage from './pages/EmployeeSetupPage'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<WorkflowPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/new" element={<EmployeeSetupPage />} />
            <Route path="/employees/:id" element={<EmployeeSetupPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
