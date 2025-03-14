import { ModularSynthProvider } from "../components/provider"
import ModularSynth from "../components/modular-synth"

export default function Page() {
  return (
    <ModularSynthProvider>
      <ModularSynth />
    </ModularSynthProvider>
  )
}

