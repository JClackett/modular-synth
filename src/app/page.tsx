"use client"
import { ModularSynthProvider } from "@/components/react-flow-provider"
import { LoaderIcon } from "lucide-react"
import dynamic from "next/dynamic"

const Synth = dynamic(() => import("../components/synth/modular-synth"), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh w-full items-center justify-center">
      <LoaderIcon className="animate-spin" />
    </div>
  ),
})

export default function Page() {
  return (
    <ModularSynthProvider>
      <Synth />
    </ModularSynthProvider>
  )
}
