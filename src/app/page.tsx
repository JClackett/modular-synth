import ModularSynth from "../components/modular-synth"
import { ModularSynthProvider } from "../components/provider"

export default function Page() {
  return (
    <ModularSynthProvider>
      <ModularSynth />
    </ModularSynthProvider>
  )
}
