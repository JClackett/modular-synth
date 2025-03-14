"use client"

import { ReactFlowProvider } from "@xyflow/react"
import type { ReactNode } from "react"

interface ModularSynthProviderProps {
  children: ReactNode
}

export function ModularSynthProvider({ children }: ModularSynthProviderProps) {
  return <ReactFlowProvider>{children}</ReactFlowProvider>
}
