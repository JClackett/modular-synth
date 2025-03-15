import {
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  applyEdgeChanges,
  applyNodeChanges,
} from "@xyflow/react"
import { nanoid } from "nanoid"
import { create } from "zustand"
import {
  type AmpData,
  type FilterData,
  type NodeData,
  type OscData,
  connect,
  createAudioNode,
  createInitialNodes,
  disconnect,
  isRunning,
  removeAudioNode,
  toggleAudio,
  updateAudioNode,
} from "./audio"

const createId = () => nanoid(6)

export type AudioStore = {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: (changes: NodeChange[]) => void
  onNodesDelete: (deleted: Node[]) => void
  onEdgesChange: (changes: EdgeChange<Edge>[]) => void
  onEdgesDelete: (deleted: Edge[]) => void
  addEdge: (data: Connection) => void
  createNode: (type: string) => void
  updateNode: (id: string, data: Partial<NodeData>) => void
  isRunning: boolean
  toggleAudio: () => void
}

export const useStore = create<AudioStore>((set, get) => ({
  nodes: createInitialNodes(),
  edges: [
    { id: createId(), source: "oscillator1", target: "filter1", animated: true, targetHandle: "input" },
    { id: createId(), source: "filter1", target: "amplifier1", animated: true, targetHandle: "input" },
    { id: createId(), source: "amplifier1", target: "output1", animated: true },
  ],
  isRunning: isRunning(),
  toggleAudio() {
    toggleAudio().then(() => {
      set({ isRunning: isRunning() })
    })
  },
  onNodesChange(changes: NodeChange[]) {
    set({ nodes: applyNodeChanges(changes, get().nodes) })
  },
  createNode(type: string) {
    const id = nanoid()
    const position = { x: 0, y: 0 }
    switch (type) {
      case "oscillator": {
        const data = { frequency: 440, type: "sine" as OscillatorType, detune: 0 } satisfies OscData
        createAudioNode(id, type, data)
        set({ nodes: [...get().nodes, { id, type, data, position }] })
        break
      }
      case "amplifier": {
        const data = { gain: 0.5 } satisfies AmpData
        createAudioNode(id, type, data)
        set({ nodes: [...get().nodes, { id, type, data, position }] })
        break
      }
      case "filter": {
        const data = { frequency: 440, type: "lowpass" as BiquadFilterType, q: 1 } satisfies FilterData
        createAudioNode(id, type, data)
        set({ nodes: [...get().nodes, { id, type, data, position }] })
        break
      }
      case "output": {
        createAudioNode(id, type, undefined)
        set({ nodes: [...get().nodes, { id, type, data: {}, position }] })
        break
      }
    }
  },
  updateNode(id: string, data: Partial<NodeData>) {
    updateAudioNode(id, data)
    set({
      nodes: get().nodes.map((node) => (node.id === id ? { ...node, data: Object.assign(node.data, data) } : node)),
    })
  },
  onNodesDelete(deleted: Node[]) {
    for (const { id } of deleted) {
      removeAudioNode(id)
    }
  },
  onEdgesChange(changes: EdgeChange<Edge>[]) {
    set({ edges: applyEdgeChanges(changes, get().edges) })
  },
  addEdge(connection: Connection) {
    const id = createId()
    const edge = { ...connection, id, animated: true } satisfies Edge
    connect(edge.source, edge.target)
    set({ edges: [edge, ...get().edges] })
  },
  onEdgesDelete(deleted: Edge[]) {
    for (const { source, target } of deleted) {
      disconnect(source, target)
    }
  },
}))
