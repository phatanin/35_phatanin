export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  stripe_price_id: string
}

export interface ProductCardProps {
  product: Product
}
