import type { Employee } from '../types'

// Email notification service
// Can use SendGrid API or Firebase Extension "Trigger Email"

const SENDGRID_API_KEY = import.meta.env.VITE_SENDGRID_API_KEY

interface EmailData {
  to: string
  subject: string
  html: string
}

async function sendEmailViaSendGrid(emailData: EmailData): Promise<boolean> {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: emailData.to }],
          },
        ],
        from: {
          email: 'noreply@five-li-workflow.com',
          name: 'FIVE-LI Content Team',
        },
        subject: emailData.subject,
        content: [
          {
            type: 'text/html',
            value: emailData.html,
          },
        ],
      }),
    })

    return response.ok
  } catch (error) {
    console.error('SendGrid error:', error)
    return false
  }
}

function buildEmailTemplate(employeeName: string, docUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #0077B5 0%, #00A0DC 100%);
      color: white;
      padding: 30px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 8px 8px;
    }
    .button {
      display: inline-block;
      background: #0077B5;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
    }
    .button:hover {
      background: #005885;
    }
    .footer {
      text-align: center;
      color: #666;
      font-size: 14px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Dein LinkedIn-Post ist bereit</h1>
  </div>
  <div class="content">
    <p>Hallo ${employeeName},</p>

    <p>ein neuer LinkedIn-Post wurde für dich vorbereitet und wartet auf deine Veröffentlichung.</p>

    <p style="text-align: center;">
      <a href="${docUrl}" class="button">Dokument öffnen</a>
    </p>

    <p>Bitte prüfe den Text und poste ihn auf LinkedIn.</p>

    <p>Viele Grüsse<br>Dein Content-Team</p>
  </div>
  <div class="footer">
    <p>Diese E-Mail wurde automatisch generiert.</p>
  </div>
</body>
</html>
  `.trim()
}

export async function notifyEmployee(
  employee: Employee,
  docUrl: string
): Promise<boolean> {
  const emailData: EmailData = {
    to: employee.email,
    subject: 'Dein LinkedIn-Post ist bereit 🚀',
    html: buildEmailTemplate(employee.name, docUrl),
  }

  // Try SendGrid first
  if (SENDGRID_API_KEY) {
    return sendEmailViaSendGrid(emailData)
  }

  // Fallback: Log to console for development
  console.log('Email notification (dev mode):', {
    to: employee.email,
    subject: emailData.subject,
    docUrl,
  })

  // In production without SendGrid, you might use Firebase Extension
  // Return true for development purposes
  return true
}

// Batch notify multiple employees
export async function notifyEmployees(
  notifications: Array<{ employee: Employee; docUrl: string }>
): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>()

  for (const { employee, docUrl } of notifications) {
    const success = await notifyEmployee(employee, docUrl)
    results.set(employee.id, success)
  }

  return results
}
