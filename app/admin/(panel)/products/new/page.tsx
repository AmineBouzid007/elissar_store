import { getCategories } from "@/lib/data/catalog"
import { ProductForm } from "@/components/admin/product-form"
import { PageHeader } from "@/components/admin/ui"

export const metadata = { title: "Nouveau produit" }

export default async function NewProductPage() {
  const categories = await getCategories()
  return (
    <div>
      <PageHeader title="Nouveau produit" description="Tailles XS–XL, plusieurs couleurs possibles." />
      <ProductForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  )
}
