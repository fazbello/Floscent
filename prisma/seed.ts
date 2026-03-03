import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Admin user
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123456', 12)
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@floscent.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@floscent.com',
      name: 'Floscent Admin',
      password: adminPassword,
      role: 'ADMIN',
      company: 'Floscent',
    },
  })
  console.log(`✅ Admin user: ${admin.email}`)

  // Demo client
  const clientPassword = await bcrypt.hash('Client@123456', 12)
  const clientUser = await prisma.user.upsert({
    where: { email: 'demo@client.com' },
    update: {},
    create: {
      email: 'demo@client.com',
      name: 'Demo Client',
      password: clientPassword,
      role: 'CLIENT',
      phone: '+1 555-0100',
      company: 'Demo Corp',
    },
  })

  const client = await prisma.client.upsert({
    where: { email: 'demo@client.com' },
    update: {},
    create: {
      userId: clientUser.id,
      name: 'Demo Client',
      email: 'demo@client.com',
      phone: '+1 555-0100',
      company: 'Demo Corp',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'US',
      status: 'ACTIVE',
      source: 'Website',
    },
  })
  console.log(`✅ Demo client: ${client.email}`)

  // Service packages
  const packages = [
    {
      name: 'Starter Fragrance Kit',
      description: 'Perfect for individuals exploring custom fragrance',
      price: 299,
      billingType: 'ONE_TIME',
      features: JSON.stringify(['3 custom scent samples', 'Scent profile consultation', 'Digital scent guide', '30-day support']),
    },
    {
      name: 'Brand Signature Scent',
      description: 'Custom fragrance for your brand identity',
      price: 1299,
      billingType: 'ONE_TIME',
      features: JSON.stringify(['Full scent development', 'Brand alignment consultation', 'Up to 5 revisions', 'Production-ready formula', '3 months support']),
    },
    {
      name: 'Monthly Fragrance Box',
      description: 'Curated monthly fragrance experience',
      price: 79,
      billingType: 'MONTHLY',
      features: JSON.stringify(['4 curated scents', 'Personalized curation', 'Tasting notes', 'Free shipping']),
    },
    {
      name: 'Enterprise Scent Branding',
      description: 'Full-scale scent branding for businesses',
      price: 4999,
      billingType: 'ONE_TIME',
      features: JSON.stringify(['Complete scent identity', 'Multi-location licensing', 'Staff training', 'Exclusive formula rights', '12 months support', 'Dedicated account manager']),
    },
  ]

  for (const pkg of packages) {
    await prisma.servicePackage.upsert({
      where: { id: pkg.name.replace(/\s+/g, '-').toLowerCase() },
      update: {},
      create: { ...pkg, id: pkg.name.replace(/\s+/g, '-').toLowerCase() },
    })
  }
  console.log(`✅ Service packages seeded`)

  // Default settings
  const settings = [
    { key: 'site_name', value: 'Floscent', type: 'string', group: 'general', label: 'Site Name' },
    { key: 'site_tagline', value: 'Premium Custom Fragrances', type: 'string', group: 'general', label: 'Tagline' },
    { key: 'site_email', value: 'hello@floscent.com', type: 'string', group: 'general', label: 'Contact Email' },
    { key: 'site_phone', value: '+1 (555) 000-0000', type: 'string', group: 'general', label: 'Phone' },
    { key: 'site_address', value: '123 Fragrance Ave, New York, NY 10001', type: 'string', group: 'general', label: 'Address' },
    { key: 'currency', value: 'USD', type: 'string', group: 'billing', label: 'Currency' },
    { key: 'tax_rate', value: '8.875', type: 'number', group: 'billing', label: 'Default Tax Rate (%)' },
    { key: 'quote_validity_days', value: '30', type: 'number', group: 'billing', label: 'Quote Valid Days' },
    { key: 'invoice_due_days', value: '14', type: 'number', group: 'billing', label: 'Invoice Due Days' },
    { key: 'ai_enabled', value: 'true', type: 'boolean', group: 'features', label: 'Enable AI Features' },
    { key: 'stripe_enabled', value: 'false', type: 'boolean', group: 'features', label: 'Enable Stripe Payments' },
    { key: 'company_logo', value: '', type: 'string', group: 'branding', label: 'Company Logo URL' },
    { key: 'primary_color', value: '#d4952a', type: 'string', group: 'branding', label: 'Primary Color' },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }
  console.log(`✅ Default settings seeded`)

  // Email templates
  const templates = [
    {
      name: 'welcome',
      subject: 'Welcome to Floscent – Your Journey Begins',
      body: `<h1>Welcome to Floscent, {{name}}!</h1><p>We're thrilled to have you on board. Your account has been created and you're ready to start your fragrance journey.</p><p><a href="{{login_url}}">Log in to your portal</a></p><p>Warm regards,<br>The Floscent Team</p>`,
      type: 'ONBOARDING',
    },
    {
      name: 'quote_sent',
      subject: 'Your Floscent Quote #{{quote_number}} is Ready',
      body: `<h1>Your Quote is Ready, {{name}}!</h1><p>We've prepared a custom quote for you. Please review it at your earliest convenience.</p><p><strong>Quote Total: {{total}}</strong></p><p><a href="{{quote_url}}">View Your Quote</a></p><p>This quote is valid until {{valid_until}}.</p>`,
      type: 'QUOTE',
    },
    {
      name: 'proposal_sent',
      subject: 'Floscent Proposal – {{proposal_title}}',
      body: `<h1>Your Proposal is Ready, {{name}}!</h1><p>We've crafted a detailed proposal based on your needs. We're excited to share our vision with you.</p><p><a href="{{proposal_url}}">View Your Proposal</a></p>`,
      type: 'PROPOSAL',
    },
    {
      name: 'invoice_sent',
      subject: 'Invoice #{{invoice_number}} from Floscent',
      body: `<h1>Invoice from Floscent</h1><p>Hi {{name}},</p><p>Please find your invoice attached. The total amount due is <strong>{{total}}</strong>.</p><p>Payment is due by {{due_date}}.</p><p><a href="{{payment_url}}">Pay Now</a></p>`,
      type: 'INVOICE',
    },
    {
      name: 'payment_received',
      subject: 'Payment Received – Thank You!',
      body: `<h1>Payment Confirmed!</h1><p>Hi {{name}},</p><p>We've received your payment of <strong>{{amount}}</strong>. Thank you!</p><p>Your receipt number is: {{receipt_number}}</p>`,
      type: 'PAYMENT',
    },
  ]

  for (const tmpl of templates) {
    await prisma.emailTemplate.upsert({
      where: { name: tmpl.name },
      update: {},
      create: tmpl,
    })
  }
  console.log(`✅ Email templates seeded`)

  console.log('\n🎉 Database seeded successfully!')
  console.log(`\nAdmin login: ${admin.email} / ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`)
  console.log(`Demo client: demo@client.com / Client@123456`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
