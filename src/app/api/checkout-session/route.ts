import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

if (!STRIPE_SECRET_KEY) {
  throw new Error('Stripe secret key must be provided')
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
  typescript: true
})

export async function POST(request: Request) {
  try {
    const { stripePriceId, price, productId, quantity = 1 } = await request.json()

    if (!stripePriceId || !price || !productId) {
      return NextResponse.json(
        { error: 'stripePriceId or price or productId is required' },
        { status: 400 }
      )
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: stripePriceId,
          quantity
        }
      ],
      metadata: {
        productId,
        price: price.toString(),
        quantity: quantity.toString()
      },
      mode: 'payment',
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const error = err as Error
    console.error('Error creating Stripe session:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
