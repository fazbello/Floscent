import nodemailer from 'nodemailer'
import prisma from './db'

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }
  return transporter
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const t = getTransporter()
    await t.sendMail({
      from: `"${process.env.FROM_NAME || 'Floscent'}" <${process.env.FROM_EMAIL || 'noreply@floscent.com'}>`,
      ...options,
    })
    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

export async function sendTemplateEmail(
  templateName: string,
  to: string,
  variables: Record<string, string>
): Promise<boolean> {
  const template = await prisma.emailTemplate.findUnique({
    where: { name: templateName, isActive: true },
  })

  if (!template) {
    console.warn(`Email template "${templateName}" not found`)
    return false
  }

  let subject = template.subject
  let body = template.body

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    subject = subject.replace(regex, value)
    body = body.replace(regex, value)
  }

  const html = wrapEmailTemplate(body)
  return sendEmail({ to, subject, html })
}

function wrapEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Georgia, serif; background: #faf8f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: #0f1014; padding: 32px; text-align: center; }
    .logo { color: #d4952a; font-size: 28px; font-weight: 700; letter-spacing: 4px; }
    .logo-sub { color: #9da0aa; font-size: 11px; letter-spacing: 3px; margin-top: 4px; }
    .body { padding: 40px; color: #1c1d23; line-height: 1.7; }
    .body h1 { color: #0f1014; font-size: 24px; margin-bottom: 16px; }
    .body a { color: #d4952a; }
    .btn { display: inline-block; background: #d4952a; color: #fff !important; padding: 14px 28px; border-radius: 4px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .footer { background: #f6f6f7; padding: 24px; text-align: center; color: #787b88; font-size: 13px; }
    .divider { border: none; border-top: 1px solid #e1e2e5; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">FLOSCENT</div>
      <div class="logo-sub">LUXURY FRAGRANCE MACHINES</div>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <hr class="divider">
      <p>© ${new Date().getFullYear()} Floscent. All rights reserved.</p>
      <p>The World's First Luxury Perfume Vending Machine</p>
    </div>
  </div>
</body>
</html>`
}

export async function sendWelcomeEmail(to: string, name: string, loginUrl: string) {
  return sendTemplateEmail('welcome', to, { name, login_url: loginUrl })
}

export async function sendQuoteEmail(params: {
  to: string
  name: string
  quoteNumber: string
  total: string
  validUntil: string
  quoteUrl: string
}) {
  return sendTemplateEmail('quote_sent', params.to, {
    name: params.name,
    quote_number: params.quoteNumber,
    total: params.total,
    valid_until: params.validUntil,
    quote_url: params.quoteUrl,
  })
}

export async function sendProposalEmail(params: {
  to: string
  name: string
  proposalTitle: string
  proposalUrl: string
}) {
  return sendTemplateEmail('proposal_sent', params.to, {
    name: params.name,
    proposal_title: params.proposalTitle,
    proposal_url: params.proposalUrl,
  })
}

export async function sendInvoiceEmail(params: {
  to: string
  name: string
  invoiceNumber: string
  total: string
  dueDate: string
  paymentUrl: string
}) {
  return sendTemplateEmail('invoice_sent', params.to, {
    name: params.name,
    invoice_number: params.invoiceNumber,
    total: params.total,
    due_date: params.dueDate,
    payment_url: params.paymentUrl,
  })
}
