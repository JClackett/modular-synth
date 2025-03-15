"use client"
import { ModularSynthProvider } from "@/components/react-flow-provider"
import dynamic from "next/dynamic"

const Synth = dynamic(() => import("../components/synth2/modular-synth"), { ssr: false })

export default function Page() {
  return (
    <ModularSynthProvider>
      <Synth />
    </ModularSynthProvider>
  )
}
