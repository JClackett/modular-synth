import type { Node } from "@xyflow/react"

const context = new AudioContext()
const nodes = new Map()

export function createInitialNodes() {
  context.suspend()

  // initial oscillator
  const osc = context.createOscillator()
  osc.frequency.value = 220
  osc.detune.value = 0
  osc.type = "square"
  osc.start()

  // initial filter
  const filter = context.createBiquadFilter()
  filter.type = "lowpass"
  filter.frequency.value = 220
  filter.Q.value = 1

  // initial amplifier
  const amp = context.createGain()
  amp.gain.value = 0.5

  osc.connect(filter)
  filter.connect(amp)
  amp.connect(context.destination)

  nodes.set("oscillator1", osc)
  nodes.set("filter1", filter)
  nodes.set("amplifier1", amp)
  nodes.set("output1", context.destination)

  return [
    { id: "oscillator1", type: "oscillator", data: { frequency: 220, detune: 0, type: "square" }, position: { x: -800, y: 0 } },
    { id: "filter1", type: "filter", data: { frequency: 220, type: "lowpass", q: 1 }, position: { x: -400, y: 0 } },
    { id: "amplifier1", type: "amplifier", data: { gain: 0.5 }, position: { x: 0, y: 0 } },
    { id: "output1", type: "output", deletable: false, selectable: false, position: { x: 400, y: 0 }, data: {} },
  ] as Node[]
}

export function isRunning() {
  return context.state === "running"
}

export function toggleAudio() {
  return isRunning() ? context.suspend() : context.resume()
}

export type NodeType = "amplifier" | "oscillator" | "filter" | "output"

export type AmpData = {
  gain: number
}

export type OscData = {
  frequency: number
  detune: number
  type: OscillatorType
}

export type FilterData = {
  frequency: number
  type: BiquadFilterType
  q: number
}

export type NodeData = AmpData | OscData | FilterData

export function createAudioNode(id: string, type: "oscillator", data: OscData): void
export function createAudioNode(id: string, type: "amplifier", data: AmpData): void
export function createAudioNode(id: string, type: "filter", data: FilterData): void
export function createAudioNode(id: string, type: "output", data: undefined): void
export function createAudioNode(id: string, type: NodeType, data?: NodeData): void {
  const nodeType = type

  switch (nodeType) {
    case "oscillator": {
      const node = context.createOscillator()
      const oscData = data as OscData
      node.frequency.value = oscData.frequency
      node.detune.value = oscData.detune
      node.type = oscData.type
      node.start()

      nodes.set(id, node)
      break
    }
    case "amplifier": {
      const node = context.createGain()
      const ampData = data as AmpData
      node.gain.value = ampData.gain

      nodes.set(id, node)
      break
    }
    case "filter": {
      const node = context.createBiquadFilter()
      const filterData = data as FilterData
      node.frequency.value = filterData.frequency
      node.Q.value = filterData.q

      nodes.set(id, node)
      break
    }
    case "output": {
      nodes.set(id, context.destination)
      break
    }
    default: {
      const _exhaustiveCheck: never = nodeType
    }
  }
}

export function updateAudioNode(id: string, data: Partial<NodeData>) {
  const node = nodes.get(id)
  if (!node) return

  for (const [key, val] of Object.entries(data)) {
    if (node[key] instanceof AudioParam) {
      node[key].value = val as number
    } else {
      node[key] = val
    }
  }
}

export function removeAudioNode(id: string) {
  const node = nodes.get(id)

  node.disconnect()
  node.stop?.()

  nodes.delete(id)
}

export function connect(sourceId: string, targetId: string) {
  const source = nodes.get(sourceId)
  const target = nodes.get(targetId)

  source.connect(target)
}

export function disconnect(sourceId: string, targetId: string) {
  const source = nodes.get(sourceId)
  const target = nodes.get(targetId)

  source.disconnect(target)
}
