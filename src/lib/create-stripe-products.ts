import Stripe from 'stripe'
import { supabase } from '@/lib/supabase-client'
import 'dotenv/config'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  console.error(
    'Stripe Secret Key is not set. Please set STRIPE_SECRET_KEY in your environment variables.'
  )
  process.exit(1)
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-08-27.basil',
  typescript: true
})

async function main() {
  const res = await fetch('https://api.escuelajs.co/api/v1/products?offset=0&limit=10')

  if (!res.ok) {
    console.error('Error fetching products:', res.statusText)
    return
  }
  const products = await res.json()

  for (const product of products) {
    console.log(`Product ID: ${product.id} - ${product.title}`)

    try {
      // 1. create price & product
      const stripeProduct = await stripe.products.create({
        name: product.title,
        description: product.description,
        images: product.images
      })

      // 2. create price with product id
      const stripePrice = await stripe.prices.create({
        unit_amount: product.price * 1000,
        currency: 'thb',
        product: stripeProduct.id
      })

      if (!stripePrice || !stripeProduct) {
        console.error('Error creating Stripe product or price')
        continue
      }

      // 3. insert to supabase database.
      // note: ถ้าเรากำหนด RLS (Row Level Security) ไว้ใน Supabase
      // เราต้องให้สิทธิ์การเข้าถึงให้กับ service_role
      // หรือใช้ supabase.auth.admin เพื่อให้สิทธิ์การเข้าถึง
      // https://supabase.com/docs/guides/auth/row-level-security
      const { data, error: dbError } = await supabase
        .from('products')
        .insert([
          {
            name: product.title,
            description: product.description,
            price: product.price * 1000,
            image_url: product.images[0],
            stripe_product_id: stripeProduct.id,
            stripe_price_id: stripePrice.id
          }
        ])
        .select()

      if (dbError) {
        console.error('Error inserting product into Supabase:', dbError)
        continue
      }

      console.log(`product ${product.id} initial success`, data)
    } catch (createError) {
      console.error(createError)
      process.exit(1)
    }
  }
}

main().catch(console.error)
