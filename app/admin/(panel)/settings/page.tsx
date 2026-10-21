import { getSettings } from "@/lib/data/settings"
import { SettingsForm } from "@/components/admin/settings-form"
import { PageHeader } from "@/components/admin/ui"

export const metadata = { title: "Settings" }

export default async function SettingsPage() {
  const settings = await getSettings()
  return (
    <div>
      <PageHeader title="Settings" description="Delivery, contact details and store status." />
      <SettingsForm s={settings} />
    </div>
  )
}
