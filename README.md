# FIVE-LI Content Workflow

LinkedIn Post Generator - A Visual Node-based web app for creating LinkedIn posts with employee-specific tonality based on the PPP system (Prime, Prompt, Polish).

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Node Editor**: React Flow
- **Backend**: Firebase (Firestore, Storage)
- **AI**: Anthropic Claude Sonnet API
- **APIs**: Google Drive/Docs API
- **Email**: SendGrid / Firebase Extension

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your credentials
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Features

- **Employee Management**: Create and manage employee profiles with tone-of-voice settings
- **PPP Style Analysis**: AI-powered analysis of writing samples to create detailed style profiles
- **Visual Node Editor**: Drag-and-drop workflow builder using React Flow
- **Post Generation**: Generate LinkedIn posts matching employee writing styles
- **Google Docs Integration**: Automatically create Google Docs with approved posts
- **Email Notifications**: Notify employees when posts are ready for review

## Project Structure

```
/src
  /components
    /ui (Buttons, Inputs, Cards, Modal)
  /nodes
    ContentInputNode.tsx
    EmployeeSelectNode.tsx
    GeneratorNode.tsx
    ReviewNode.tsx
    GoogleDocsNode.tsx
    NotificationNode.tsx
  /pages
    WorkflowPage.tsx
    EmployeesPage.tsx
    EmployeeSetupPage.tsx
  /services
    firebase.ts
    firestoreService.ts
    claudeService.ts
    googleService.ts
    notificationService.ts
  /hooks
    useEmployees.ts
    useWorkflow.ts
    useStyleProfile.ts
  /types
    index.ts
```

## License

Private
