import { ModularSynth } from "../components/modular-synth"
import { ModularSynthProvider } from "../components/react-flow-provider"

export default function Page() {
  return (
    <ModularSynthProvider>
      <ModularSynth />
    </ModularSynthProvider>
  )
}
