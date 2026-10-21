import { getCategories } from "@/lib/data/catalog"
import { CategoryManager } from "@/components/admin/category-manager"
import { PageHeader } from "@/components/admin/ui"

export const metadata = { title: "Categories" }

export default async function CategoriesPage() {
  const categories = await getCategories()
  return (
    <div>
      <PageHeader title="Categories" description="Shown in the shop menu and filters once they have at least one visible product." />
      <CategoryManager categories={categories} />
    </div>
  )
}
