"use client"

import { useState, useTransition } from "react"
import { toggleProductActiveAction } from "@/app/admin/actions"
import { Switch } from "@/components/ui/switch"

export function ActiveToggle({ id, active }: { id: string; active: boolean }) {
  const [on, setOn] = useState(active)
  const [, start] = useTransition()
  return (
    <Switch checked={on} aria-label="Visible in store" className="data-[state=checked]:bg-primary [&>span]:data-[state=checked]:bg-primary-foreground"
      onCheckedChange={(v) => { setOn(v); start(() => toggleProductActiveAction(id, v)) }} />
  )
}
