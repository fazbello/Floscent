import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    })
  }
  return stripeClient
}

export async function createPaymentIntent(params: {
  amount: number
  currency?: string
  customerId?: string
  metadata?: Record<string, string>
}) {
  const stripe = getStripe()
  return stripe.paymentIntents.create({
    amount: Math.round(params.amount * 100),
    currency: params.currency || 'usd',
    customer: params.customerId,
    metadata: params.metadata || {},
    automatic_payment_methods: { enabled: true },
  })
}

export async function createCheckoutSession(params: {
  amount: number
  currency?: string
  description: string
  successUrl: string
  cancelUrl: string
  customerEmail?: string
  metadata?: Record<string, string>
}) {
  const stripe = getStripe()
  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: params.currency || 'usd',
        product_data: { name: params.description },
        unit_amount: Math.round(params.amount * 100),
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    metadata: params.metadata || {},
  })
}

export async function createOrRetrieveCustomer(params: {
  email: string
  name: string
}) {
  const stripe = getStripe()
  const existing = await stripe.customers.list({ email: params.email, limit: 1 })
  if (existing.data.length > 0) return existing.data[0]
  return stripe.customers.create({ email: params.email, name: params.name })
}

export async function constructWebhookEvent(body: string, sig: string) {
  const stripe = getStripe()
  return stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || '')
}
