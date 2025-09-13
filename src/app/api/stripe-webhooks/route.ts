import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase-client'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''

if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
  throw new Error('Stripe secret key must be provided')
}

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
  typescript: true
})

export async function POST(request: Request) {
  try {
    const rawBody = await request.text() // Get raw body
    const signature = request.headers.get('stripe-signature') as string

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      const error = err as Error
      console.error(`Webhook signature verification failed: ${error.message}`)
      return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        console.log(`Payment successful for session ID: ${session.id}`)

        const totalAmount = (session.amount_total ?? 0) / 100

        try {
          const productId = session.metadata?.productId
          const quantity = session.metadata?.quantity

          // 1. Find product in Supabase
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('id, price')
            .eq('id', productId)
            .maybeSingle()

          if (productError || !productData) {
            console.error('Supabase error ', productError)

            return NextResponse.json({ error: 'Webhook Error: Product not found' }, { status: 404 })
          }

          // 2. Create Order record in Supabase
          const { error: orderError } = await supabase.from('orders').insert([
            {
              product_id: productData.id,
              quantity: quantity || 1,
              total_amount: totalAmount,
              status: 'paid',
              stripe_checkout_session_id: session.id
            }
          ])

          if (orderError) {
            console.error('Error inserting order into Supabase:', orderError)
            return NextResponse.json(
              { error: `Webhook Error: ${orderError.message}` },
              { status: 500 }
            )
          }

          console.log(`Order created successfully for session: ${session.id}`)
        } catch (dbError) {
          const dErr = dbError as Error
          console.error('Database operation error:', dErr.message)
          return NextResponse.json({ error: `Webhook Error: ${dErr.message}` }, { status: 500 })
        }
        break

      default:
        console.warn(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Internal Server Error processing webhook' }, { status: 500 })
  }
}
