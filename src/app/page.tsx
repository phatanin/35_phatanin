import { supabase } from "@/lib/supabase-client";

import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";

async function getProducts(): Promise<Product[]> {
  // เหมือนกับ select * from products order by name ASC;
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return products || [];
}

const HomePage: React.FC = async () => {
  const products = await getProducts();
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold text-zinc-900 md:text-4xl">
          สินค้าขายดี
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {products.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default HomePage;
