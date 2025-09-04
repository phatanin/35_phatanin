"use client";

import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { redirect } from "next/navigation";
import { Product, ProductCardProps } from "@/types";

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const handleBuyProduct = async () => {
    const { id: productId, price, stripe_price_id: stripePriceId } = product;

    const response = await fetch("/api/checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stripePriceId, productId, price }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to create checkout session:", errorData);
      alert(
        `เกิดข้อผิดพลาดในการเริ่มการชำระเงิน: ${
          errorData.error || response.statusText
        }`
      );
      return;
    }

    const { url, error } = await response.json();

    if (error) {
      console.error("Stripe redirection error:", error);
      alert(`เกิดข้อผิดพลาดในการเปิดหน้าชำระเงิน: ${error.message}`);
    }

    redirect(url);
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-lg">
      <div className="aspect-square overflow-hidden">
        <Image
          src={product.image_url}
          alt={product.name}
          width={300}
          height={300}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-zinc-800">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat("th-TH", {
              style: "currency",
              currency: "THB",
            }).format(product.price / 100)}
          </span>

          <button
            onClick={handleBuyProduct}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-blue-700">
            <ShoppingCart className="h-4 w-4" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
