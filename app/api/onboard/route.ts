import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, company, businessType, businessSize, budget, timeline, goals, howDidYouHear, selectedPackage, additionalInfo, location } = body

    if (!name || !email) return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })

    const normalizedEmail = email.toLowerCase().trim()

    // Create or find user
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) {
      const tempPass = await bcrypt.hash(crypto.randomUUID(), 12)
      user = await prisma.user.create({
        data: { name, email: normalizedEmail, password: tempPass, role: 'CLIENT', phone, company },
      })
    }

    // Create or update client
    let client = await prisma.client.findUnique({ where: { email: normalizedEmail } })
    if (!client) {
      client = await prisma.client.create({
        data: {
          userId: user.id,
          name,
          email: normalizedEmail,
          phone,
          company,
          address: location,
          status: 'PROSPECT',
          source: howDidYouHear || 'Onboarding Form',
          notes: `Budget: ${budget || 'N/A'} | Timeline: ${timeline || 'N/A'} | Package: ${selectedPackage || 'N/A'}`,
        },
      })
    }

    // Create or update onboarding
    await prisma.onboarding.upsert({
      where: { clientId: client.id },
      update: {
        businessType, businessSize, budget, timeline, goals, howDidYouHear,
        additionalInfo: `Package: ${selectedPackage}\n${additionalInfo || ''}`,
        services: selectedPackage,
        completed: true,
        completedAt: new Date(),
        step: 5,
      },
      create: {
        clientId: client.id,
        businessType, businessSize, budget, timeline, goals, howDidYouHear,
        additionalInfo: `Package: ${selectedPackage}\n${additionalInfo || ''}`,
        services: selectedPackage,
        completed: true,
        completedAt: new Date(),
        step: 5,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: { action: 'ONBOARD_SUBMIT', entity: 'Client', entityId: client.id, details: `Package: ${selectedPackage}` },
    })

    // Send welcome email
    sendWelcomeEmail(normalizedEmail, name, `${process.env.NEXT_PUBLIC_APP_URL}/login`).catch(console.error)

    return NextResponse.json({ ok: true, clientId: client.id })
  } catch (err) {
    console.error('Onboard error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
