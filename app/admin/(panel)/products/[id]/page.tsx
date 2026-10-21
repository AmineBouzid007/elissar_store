import { notFound } from "next/navigation"
import { getCategories, getProductById } from "@/lib/data/catalog"
import { ProductForm } from "@/components/admin/product-form"
import { PageHeader } from "@/components/admin/ui"

export const metadata = { title: "Edit product" }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()
  const [product, categories] = await Promise.all([getProductById(id), getCategories()])
  if (!product) notFound()
  return (
    <div>
      <PageHeader title={product.name} description={`/product/${product.slug}`} />
      <ProductForm product={product} categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  )
}
