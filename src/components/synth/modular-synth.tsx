"use client"

import { Button } from "@/components/ui/button"
import {
  Background,
  BackgroundVariant,
  type Connection,
  Controls,
  type Edge,
  MiniMap,
  type Node,
  type NodeTypes,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react"
import { Keyboard, Plus, AudioWaveformIcon as Waveform } from "lucide-react"
import { useCallback, useEffect, useRef } from "react"
import "@xyflow/react/dist/style.css"
import { audioEngine } from "./audio-engine"
import { AmplifierNode } from "./nodes/amp"
import { FilterNode } from "./nodes/filter"
import { LFONode } from "./nodes/lfo"
import { MidiKeyboardNode } from "./nodes/midi"
import { OscillatorNode } from "./nodes/oscillator"
import { OutputNode } from "./nodes/output"

// Define custom node data types
interface NodeData {
  updateNodeData: (id: string, data: any) => void
  [key: string]: any
}

// Define custom node types
type CustomNode = Node<NodeData>

// Define node types
const nodeTypes: NodeTypes = {
  oscillator: OscillatorNode,
  filter: FilterNode,
  amplifier: AmplifierNode,
  lfo: LFONode,
  midi: MidiKeyboardNode,
  output: OutputNode,
}

// Update the ModularSynth component to include the explanation
export default function ModularSynth() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const { screenToFlowPosition } = useReactFlow()

  // Update node data
  const updateNodeData = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, ...newData } }
          }
          return node
        }),
      )

      // Update audio engine with new data
      audioEngine.updateNodeParameters(nodeId, newData)
    },
    [setNodes],
  )

  // Handle connections
  const onConnect = useCallback(
    (params: Connection | Edge) => {
      // Ensure audio context is started when a connection is made
      audioEngine.start()

      // Create the visual connection
      const newEdge = { ...params, animated: true }
      setEdges((eds) => addEdge(newEdge, eds))

      // Connect in the audio engine
      audioEngine.connectNodes(params.source as string, params.target as string, params.sourceHandle!, params.targetHandle!)
    },
    [setEdges],
  )

  // Handle edge removal
  const onEdgesDelete = useCallback((edgesToDelete: Edge[]) => {
    edgesToDelete.forEach((edge) => {
      audioEngine.disconnectNodes(edge.source, edge.target, edge.sourceHandle || "output", edge.targetHandle || "input")
    })
  }, [])

  // Add a new node
  const addNode = useCallback(
    (type: string) => {
      // Ensure audio context is started when a node is added
      audioEngine.start()

      const position = screenToFlowPosition({ x: Math.random() * 400, y: Math.random() * 400 })

      const newNode: CustomNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { updateNodeData },
      }

      // Set default parameters based on node type
      switch (type) {
        case "oscillator":
          newNode.data = { ...newNode.data, waveform: "sine", frequency: 110, detune: 0 }
          break
        case "filter":
          newNode.data = { ...newNode.data, type: "lowpass", frequency: 1000, Q: 1 }
          break
        case "amplifier":
          newNode.data = { ...newNode.data, gain: 0.3 }
          break
        case "lfo":
          newNode.data = { ...newNode.data, waveform: "sine", frequency: 0.1, amplitude: 0.5, modDepth: 5.0 }
          break
        case "midi":
          newNode.data = { ...newNode.data, waveform: "sawtooth", attack: 0.05, release: 0.1 }
          break
        case "output":
          newNode.data = { ...newNode.data }
          break
      }

      setNodes((nds) => [...nds, newNode])

      // Create the node in the audio engine
      audioEngine.createNode(newNode.id, type, newNode.data)

      return newNode
    },
    [screenToFlowPosition, setNodes, updateNodeData],
  )

  const isMounted = useRef(false)
  // Initialize with some default nodes
  useEffect(() => {
    if (isMounted.current) return
    isMounted.current = true

    if (nodes.length === 0) {
      const vcf = addNode("filter")
      const vca = addNode("amplifier")
      const midi = addNode("midi")
      const output = addNode("output")

      // Position them in a logical flow
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === vcf.id) {
            return { ...node, position: { x: 400, y: 100 } }
          }
          if (node.id === vca.id) {
            return { ...node, position: { x: 700, y: 100 } }
          }
          if (node.id === output.id) {
            return { ...node, position: { x: 1000, y: 100 } }
          }
          if (node.id === midi.id) {
            return { ...node, position: { x: -50, y: 100 } }
          }
          return node
        }),
      )

      // Connect them
      setTimeout(() => {
        onConnect({
          source: vcf.id,
          target: vca.id,
          sourceHandle: "output",
          targetHandle: "input",
        })

        onConnect({
          source: midi.id,
          target: vcf.id,
          sourceHandle: "output",
          targetHandle: "input",
        })

        onConnect({
          source: vca.id,
          target: output.id,
          sourceHandle: "output",
          targetHandle: "input",
        })
      }, 100)
    }
  }, [nodes.length, addNode, onConnect, setNodes])

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      // audioEngine.cleanup()
    }
  }, [])

  return (
    <div className="flex h-screen w-full flex-col">
      <div className="flex items-center justify-between border-b bg-neutral-50 p-4 dark:bg-neutral-900/50">
        <h1 className="font-bold text-xl">Modular Synthesizer</h1>
      </div>

      <div className="flex flex-1">
        <div className="flex w-64 flex-col gap-2 bg-neutral-100 p-4 dark:bg-neutral-900/30">
          <h2 className="mb-2 font-medium">Add Module</h2>
          <Button onClick={() => addNode("oscillator")} variant="outline" className="justify-start">
            <Waveform className="mr-2 h-4 w-4" /> VCO
          </Button>
          <Button onClick={() => addNode("filter")} variant="outline" className="justify-start">
            <Plus className="mr-2 h-4 w-4" /> VCF
          </Button>
          <Button onClick={() => addNode("amplifier")} variant="outline" className="justify-start">
            <Plus className="mr-2 h-4 w-4" /> VCA
          </Button>
          <Button onClick={() => addNode("lfo")} variant="outline" className="justify-start">
            <Waveform className="mr-2 h-4 w-4" /> LFO
          </Button>
          <Button onClick={() => addNode("midi")} variant="outline" className="justify-start">
            <Keyboard className="mr-2 h-4 w-4" /> MIDI
          </Button>
        </div>

        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            suppressHydrationWarning
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgesDelete={onEdgesDelete}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[20, 20]}
            colorMode="light"
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}
