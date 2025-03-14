"use client"

import type { ReactNode } from "react"
import { ReactFlowProvider } from "reactflow"

interface ModularSynthProviderProps {
  children: ReactNode
}

export function ModularSynthProvider({ children }: ModularSynthProviderProps) {
  return <ReactFlowProvider>{children}</ReactFlowProvider>
}

