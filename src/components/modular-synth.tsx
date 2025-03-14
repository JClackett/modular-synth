"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Background,
  BackgroundVariant,
  type Connection,
  Controls,
  type Edge,
  Handle,
  MiniMap,
  type Node,
  type NodeProps,
  type NodeTypes,
  Position,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react"
import { Keyboard, Plus, Volume2, AudioWaveformIcon as Waveform } from "lucide-react"
import { useCallback, useEffect, useRef } from "react"
import { AudioEngine } from "./audio-engine"
import { MidiKeyboard } from "./midi-keyboard"
import "@xyflow/react/dist/style.css"

// Initialize the audio engine
const audioEngine = new AudioEngine()

// Define custom node data types
interface NodeData {
  updateNodeData: (id: string, data: any) => void
  [key: string]: any
}

// Define custom node types
type CustomNode = Node<NodeData>

// Custom node components
function OscillatorNode({ id, data }: NodeProps<CustomNode>) {
  const updateNodeData = data.updateNodeData

  return (
    <Card className="w-64 gap-0 rounded-xl py-0 shadow-md">
      <CardHeader className="gap-0 rounded-t-xl bg-orange-100 py-2 pb-2 dark:bg-orange-900/30">
        <CardTitle className="font-medium text-sm">VCO (Oscillator)</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-xs">Waveform</p>
            </div>
            <Select defaultValue={data.waveform as string} onValueChange={(value) => updateNodeData(id, { waveform: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Waveform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sine">Sine</SelectItem>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="sawtooth">Sawtooth</SelectItem>
                <SelectItem value="triangle">Triangle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative space-y-2">
            <div className="flex justify-between">
              <p className="text-xs">Frequency (Hz)</p>
              <span className="text-xs">{data.frequency as number} Hz</span>
            </div>
            <Slider
              value={[data.frequency as number]}
              min={20}
              max={2000}
              step={1}
              onValueChange={([value]) => updateNodeData(id, { frequency: value })}
            />
            {/* CV input for frequency */}
            <Handle
              type="target"
              position={Position.Left}
              id="freq-cv"
              className="top-1/2 h-2 w-2 bg-yellow-500"
              style={{ left: -10 }}
            />
            <span className="-translate-y-1/2 -translate-x-full absolute top-1/2 left-[-8px] transform text-[10px] text-yellow-700">
              CV
            </span>
          </div>

          <div className="relative space-y-2">
            <div className="flex justify-between">
              <p className="text-xs">Detune (cents)</p>
              <span className="text-xs">{data.detune as number}</span>
            </div>
            <Slider
              value={[data.detune as number]}
              min={-100}
              max={100}
              step={1}
              onValueChange={([value]) => updateNodeData(id, { detune: value })}
            />
            {/* CV input for detune */}
            <Handle
              type="target"
              position={Position.Left}
              id="detune-cv"
              className="top-3/4 h-2 w-2 bg-yellow-500"
              style={{ left: -10 }}
            />
            <span className="-translate-y-1/2 -translate-x-full absolute top-3/4 left-[-8px] transform text-[10px] text-yellow-700">
              CV
            </span>
          </div>
        </div>

        {/* Output handle */}
        <Handle type="source" position={Position.Right} id="output" className="h-2 w-2 bg-orange-500" />
      </CardContent>
    </Card>
  )
}

function FilterNode({ id, data }: NodeProps<CustomNode>) {
  const updateNodeData = data.updateNodeData

  return (
    <Card className="w-64 gap-0 rounded-xl py-0 shadow-md">
      <CardHeader className="gap-0 rounded-t-xl bg-blue-100 py-2 pb-2 dark:bg-blue-900/30">
        <CardTitle className="font-medium text-sm">VCF (Filter)</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-xs">Filter Type</p>
            </div>
            <Select defaultValue={data.type as string} onValueChange={(value) => updateNodeData(id, { type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lowpass">Low Pass</SelectItem>
                <SelectItem value="highpass">High Pass</SelectItem>
                <SelectItem value="bandpass">Band Pass</SelectItem>
                <SelectItem value="notch">Notch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative space-y-2">
            <div className="flex justify-between">
              <p className="text-xs">Cutoff Frequency (Hz)</p>
              <span className="text-xs">{data.frequency as number} Hz</span>
            </div>
            <Slider
              value={[data.frequency as number]}
              min={20}
              max={20000}
              step={1}
              onValueChange={([value]) => updateNodeData(id, { frequency: value })}
            />
            {/* CV input for cutoff frequency */}
            <Handle
              type="target"
              position={Position.Left}
              id="freq-cv"
              className="top-1/2 h-2 w-2 bg-yellow-500"
              style={{ left: -10 }}
            />
            <span className="-translate-y-1/2 -translate-x-full absolute top-1/2 left-[-8px] transform text-[10px] text-yellow-700">
              CV
            </span>
          </div>

          <div className="relative space-y-2">
            <div className="flex justify-between">
              <p className="text-xs">Resonance (Q)</p>
              <span className="text-xs">{(data.Q as number).toFixed(1)}</span>
            </div>
            <Slider
              value={[data.Q as number]}
              min={0.1}
              max={20}
              step={0.1}
              onValueChange={([value]) => updateNodeData(id, { Q: value })}
            />
            {/* CV input for resonance */}
            <Handle
              type="target"
              position={Position.Left}
              id="q-cv"
              className="top-3/4 h-2 w-2 bg-yellow-500"
              style={{ left: -10 }}
            />
            <span className="-translate-y-1/2 -translate-x-full absolute top-3/4 left-[-8px] transform text-[10px] text-yellow-700">
              CV
            </span>
          </div>
        </div>

        {/* Input handle */}
        <Handle type="target" position={Position.Left} id="input" className="h-2 w-2 bg-blue-500" />

        {/* Output handle */}
        <Handle type="source" position={Position.Right} id="output" className="h-2 w-2 bg-blue-500" />
      </CardContent>
    </Card>
  )
}

function AmplifierNode({ id, data }: NodeProps<CustomNode>) {
  const updateNodeData = data.updateNodeData

  return (
    <Card className="w-64 gap-0 rounded-xl py-0 shadow-md">
      <CardHeader className="gap-0 rounded-t-xl bg-green-100 py-2 pb-2 dark:bg-green-900/30">
        <CardTitle className="font-medium text-sm">VCA (Amplifier)</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="relative space-y-2">
            <div className="flex justify-between">
              <p className="text-xs">Gain</p>
              <span className="text-xs">{(data.gain as number).toFixed(2)}</span>
            </div>
            <Slider
              value={[data.gain as number]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={([value]) => updateNodeData(id, { gain: value })}
            />
            {/* CV input for gain */}
            <Handle
              type="target"
              position={Position.Left}
              id="gain-cv"
              className="top-1/2 h-2 w-2 bg-yellow-500"
              style={{ left: -10 }}
            />
            <span className="-translate-y-1/2 -translate-x-full absolute top-1/2 left-[-8px] transform text-[10px] text-yellow-700">
              CV
            </span>
          </div>
        </div>

        {/* Input handle */}
        <Handle type="target" position={Position.Left} id="input" className="h-2 w-2 bg-green-500" />

        {/* Output handle */}
        <Handle type="source" position={Position.Right} id="output" className="h-2 w-2 bg-green-500" />
      </CardContent>
    </Card>
  )
}

function LFONode({ id, data }: NodeProps<CustomNode>) {
  const updateNodeData = data.updateNodeData

  return (
    <Card className="w-64 gap-0 rounded-xl py-0 shadow-md">
      <CardHeader className="gap-0 rounded-t-xl bg-purple-100 py-2 pb-2 dark:bg-purple-900/30">
        <CardTitle className="font-medium text-sm">LFO (Low Frequency Oscillator)</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-xs">Waveform</p>
            </div>
            <Select defaultValue={data.waveform as string} onValueChange={(value) => updateNodeData(id, { waveform: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Waveform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sine">Sine</SelectItem>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="sawtooth">Sawtooth</SelectItem>
                <SelectItem value="triangle">Triangle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative space-y-2">
            <div className="flex justify-between">
              <p className="text-xs">Rate (Hz)</p>
              <span className="text-xs">
                {(data.frequency as number) < 0.01
                  ? (data.frequency as number).toFixed(3)
                  : (data.frequency as number).toFixed(2)}{" "}
                Hz
              </span>
            </div>
            <Slider
              value={[data.frequency as number]}
              min={0.001}
              max={20}
              step={0.001}
              onValueChange={([value]) => updateNodeData(id, { frequency: value })}
            />
            {/* CV input for rate */}
            <Handle
              type="target"
              position={Position.Left}
              id="freq-cv"
              className="top-1/2 h-2 w-2 bg-yellow-500"
              style={{ left: -10 }}
            />
            <span className="-translate-y-1/2 -translate-x-full absolute top-1/2 left-[-8px] transform text-[10px] text-yellow-700">
              CV
            </span>
          </div>

          <div className="relative space-y-2">
            <div className="flex justify-between">
              <p className="text-xs">Amplitude</p>
              <span className="text-xs">{(data.amplitude as number).toFixed(2)}</span>
            </div>
            <Slider
              value={[data.amplitude as number]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={([value]) => updateNodeData(id, { amplitude: value })}
            />
            {/* CV input for amplitude */}
            <Handle
              type="target"
              position={Position.Left}
              id="amp-cv"
              className="top-3/4 h-2 w-2 bg-yellow-500"
              style={{ left: -10 }}
            />
            <span className="-translate-y-1/2 -translate-x-full absolute top-3/4 left-[-8px] transform text-[10px] text-yellow-700">
              CV
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-xs">Modulation Depth</p>
              <span className="text-xs">{data.modDepth ? (data.modDepth as number).toFixed(2) : "1.00"}</span>
            </div>
            <Slider
              value={[(data.modDepth as number) || 1]}
              min={0.1}
              max={10}
              step={0.1}
              onValueChange={([value]) => updateNodeData(id, { modDepth: value })}
            />
          </div>
        </div>

        {/* Output handle */}
        <Handle type="source" position={Position.Right} id="output" className="h-2 w-2 bg-purple-500" />
      </CardContent>
    </Card>
  )
}

function MidiKeyboardNode({ id, data }: NodeProps<CustomNode>) {
  // Ensure audio context is started when MIDI node is created
  useEffect(() => {
    audioEngine.start()
  }, [])

  // Use useCallback with empty dependency array to ensure stable references
  const handleNoteOn = useCallback(
    (note: number) => {
      audioEngine.start() // Ensure audio context is running when a note is played
      audioEngine.noteOn(id, note, 1.0)
    },
    [id],
  )

  const handleNoteOff = useCallback(
    (note: number) => {
      audioEngine.noteOff(id, note)
    },
    [id],
  )

  // Add the note handlers to the data - but avoid the circular update issue
  // by not including activeNotes in the props
  const nodeData = {
    ...data,
    onNoteOn: handleNoteOn,
    onNoteOff: handleNoteOff,
    updateNodeData: data.updateNodeData,
  }

  return <MidiKeyboard id={id} data={nodeData} />
}

function OutputNode() {
  return (
    <Card className="w-32 gap-0 rounded-xl py-0 shadow-md">
      <CardHeader className="gap-0 rounded-t-xl bg-red-100 py-2 pb-2 dark:bg-red-900/30">
        <CardTitle className="font-medium text-sm">Output</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-center pt-2">
          <Volume2 className="size-6" />
        </div>
        <div className="mt-4 text-center text-sm">
          <p>Audio Output</p>
        </div>

        {/* Audio input handle */}
        <Handle type="target" position={Position.Left} id="input" className="h-2 w-2 bg-red-500" />
      </CardContent>
    </Card>
  )
}

// Define node types
const nodeTypes: NodeTypes = {
  oscillator: OscillatorNode,
  filter: FilterNode,
  amplifier: AmplifierNode,
  lfo: LFONode,
  midi: MidiKeyboardNode,
  output: OutputNode,
}

// Add a component to demonstrate example patches
function ExamplePatches({ onCreatePatch }: { onCreatePatch: (patchType: string) => void }) {
  return (
    <div className="mb-4 rounded-lg bg-blue-50 p-4 text-sm dark:bg-blue-950/50">
      <h3 className="mb-2 font-bold">Example Patches</h3>
      <div className="space-y-2">
        <Button
          onClick={() => onCreatePatch("filterSweep")}
          variant="outline"
          size="sm"
          className="w-full justify-start bg-white hover:bg-blue-50 dark:bg-background dark:hover:bg-blue-950/50"
        >
          Filter Sweep
        </Button>
        <Button
          onClick={() => onCreatePatch("tremolo")}
          variant="outline"
          size="sm"
          className="w-full justify-start bg-white hover:bg-blue-50 dark:bg-background dark:hover:bg-blue-950/50"
        >
          Tremolo Effect
        </Button>
        <Button
          onClick={() => onCreatePatch("vibrato")}
          variant="outline"
          size="sm"
          className="w-full justify-start bg-white hover:bg-blue-50 dark:bg-background dark:hover:bg-blue-950/50"
        >
          Vibrato
        </Button>
        <Button
          onClick={() => onCreatePatch("midiKeyboard")}
          variant="outline"
          size="sm"
          className="w-full justify-start bg-white hover:bg-blue-50 dark:bg-background dark:hover:bg-blue-950/50"
        >
          MIDI Keyboard
        </Button>
      </div>
    </div>
  )
}

// Update the ModularSynth component to include the explanation
export function ModularSynth() {
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
          newNode.data = {
            ...newNode.data,
            waveform: "sine",
            frequency: 440,
            detune: 0,
          }
          break
        case "filter":
          newNode.data = {
            ...newNode.data,
            type: "lowpass",
            frequency: 1000,
            Q: 1,
          }
          break
        case "amplifier":
          newNode.data = {
            ...newNode.data,
            gain: 0.5,
          }
          break
        case "lfo":
          newNode.data = {
            ...newNode.data,
            waveform: "sine",
            frequency: 0.1,
            amplitude: 0.5,
            modDepth: 5.0,
          }
          break
        case "midi":
          newNode.data = {
            ...newNode.data,
            waveform: "sawtooth",
            attack: 0.05,
            release: 0.1,
          }
          break
        case "output":
          newNode.data = {
            ...newNode.data,
          }
          break
      }

      setNodes((nds) => [...nds, newNode])

      // Create the node in the audio engine
      audioEngine.createNode(newNode.id, type, newNode.data)

      return newNode
    },
    [screenToFlowPosition, setNodes, updateNodeData],
  )

  // Create example patches
  const createExamplePatch = useCallback(
    (patchType: string) => {
      // Clear existing nodes and edges
      setNodes([])
      setEdges([])

      // Create new patch based on type
      setTimeout(() => {
        switch (patchType) {
          case "filterSweep": {
            // Create nodes
            const vco = addNode("oscillator")
            const vcf = addNode("filter")
            const vca = addNode("amplifier")
            const lfo = addNode("lfo")
            const output = addNode("output")

            // Update LFO settings
            updateNodeData(lfo.id, {
              waveform: "triangle",
              frequency: 0.05,
              amplitude: 0.8,
              modDepth: 8.0,
            })

            // Update VCF settings
            updateNodeData(vcf.id, {
              type: "lowpass",
              frequency: 2000,
              Q: 5,
            })

            // Position nodes
            setNodes((nds) =>
              nds.map((node) => {
                if (node.id === vco.id) {
                  return { ...node, position: { x: 100, y: 100 } }
                }
                if (node.id === vcf.id) {
                  return { ...node, position: { x: 400, y: 100 } }
                }
                if (node.id === vca.id) {
                  return { ...node, position: { x: 700, y: 100 } }
                }
                if (node.id === output.id) {
                  return { ...node, position: { x: 1000, y: 100 } }
                }
                if (node.id === lfo.id) {
                  return { ...node, position: { x: 400, y: 300 } }
                }
                return node
              }),
            )

            // Connect nodes
            setTimeout(() => {
              // Audio path
              onConnect({
                source: vco.id,
                target: vcf.id,
                sourceHandle: "output",
                targetHandle: "input",
              })

              onConnect({
                source: vcf.id,
                target: vca.id,
                sourceHandle: "output",
                targetHandle: "input",
              })

              onConnect({
                source: vca.id,
                target: output.id,
                sourceHandle: "output",
                targetHandle: "input",
              })

              // Modulation
              onConnect({
                source: lfo.id,
                target: vcf.id,
                sourceHandle: "output",
                targetHandle: "freq-cv",
              })
            }, 100)
            break
          }

          case "tremolo": {
            // Create nodes
            const vco = addNode("oscillator")
            const vca = addNode("amplifier")
            const lfo = addNode("lfo")
            const output = addNode("output")

            // Update LFO settings
            updateNodeData(lfo.id, {
              waveform: "sine",
              frequency: 6,
              amplitude: 0.8,
              modDepth: 5.0,
            })

            // Position nodes
            setNodes((nds) =>
              nds.map((node) => {
                if (node.id === vco.id) {
                  return { ...node, position: { x: 100, y: 100 } }
                }
                if (node.id === vca.id) {
                  return { ...node, position: { x: 400, y: 100 } }
                }
                if (node.id === output.id) {
                  return { ...node, position: { x: 700, y: 100 } }
                }
                if (node.id === lfo.id) {
                  return { ...node, position: { x: 400, y: 300 } }
                }
                return node
              }),
            )

            // Connect nodes
            setTimeout(() => {
              // Audio path
              onConnect({
                source: vco.id,
                target: vca.id,
                sourceHandle: "output",
                targetHandle: "input",
              })

              onConnect({
                source: vca.id,
                target: output.id,
                sourceHandle: "output",
                targetHandle: "input",
              })

              // Modulation
              onConnect({
                source: lfo.id,
                target: vca.id,
                sourceHandle: "output",
                targetHandle: "gain-cv",
              })
            }, 100)
            break
          }

          case "vibrato": {
            // Create nodes
            const vco = addNode("oscillator")
            const vca = addNode("amplifier")
            const lfo = addNode("lfo")
            const output = addNode("output")

            // Update LFO settings
            updateNodeData(lfo.id, {
              waveform: "sine",
              frequency: 6,
              amplitude: 0.8,
              modDepth: 5.0,
            })

            // Position nodes
            setNodes((nds) =>
              nds.map((node) => {
                if (node.id === vco.id) {
                  return { ...node, position: { x: 100, y: 100 } }
                }
                if (node.id === vca.id) {
                  return { ...node, position: { x: 400, y: 100 } }
                }
                if (node.id === output.id) {
                  return { ...node, position: { x: 700, y: 100 } }
                }
                if (node.id === lfo.id) {
                  return { ...node, position: { x: 100, y: 300 } }
                }
                return node
              }),
            )

            // Connect nodes
            setTimeout(() => {
              // Audio path
              onConnect({
                source: vco.id,
                target: vca.id,
                sourceHandle: "output",
                targetHandle: "input",
              })

              onConnect({
                source: vca.id,
                target: output.id,
                sourceHandle: "output",
                targetHandle: "input",
              })

              // Modulation
              onConnect({
                source: lfo.id,
                target: vco.id,
                sourceHandle: "output",
                targetHandle: "freq-cv",
              })
            }, 100)
            break
          }

          case "midiKeyboard": {
            // Create nodes
            const midi = addNode("midi")
            const vcf = addNode("filter")
            const vca = addNode("amplifier")
            const output = addNode("output")

            // Update settings
            updateNodeData(vcf.id, {
              type: "lowpass",
              frequency: 2000,
              Q: 2,
            })

            // Position nodes
            setNodes((nds) =>
              nds.map((node) => {
                if (node.id === midi.id) {
                  return { ...node, position: { x: 100, y: 100 } }
                }
                if (node.id === vcf.id) {
                  return { ...node, position: { x: 500, y: 100 } }
                }
                if (node.id === vca.id) {
                  return { ...node, position: { x: 800, y: 100 } }
                }
                if (node.id === output.id) {
                  return { ...node, position: { x: 1100, y: 100 } }
                }
                return node
              }),
            )

            // Connect nodes
            setTimeout(() => {
              // Audio path
              onConnect({
                source: midi.id,
                target: vcf.id,
                sourceHandle: "output",
                targetHandle: "input",
              })

              onConnect({
                source: vcf.id,
                target: vca.id,
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
            break
          }
        }
      }, 100)
    },
    [addNode, onConnect, setEdges, setNodes, updateNodeData],
  )

  // Initialize with some default nodes
  useEffect(() => {
    if (nodes.length === 0) {
      const vcf = addNode("filter")
      const vca = addNode("amplifier")
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
      audioEngine.cleanup()
    }
  }, [])

  return (
    <div className="flex h-screen w-full flex-col">
      <div className="flex items-center justify-between border-b bg-gray-50 p-4 dark:bg-gray-900/50">
        <h1 className="font-bold text-xl">Modular Synthesizer</h1>
      </div>

      <div className="flex flex-1">
        <div className="flex w-64 flex-col gap-2 bg-gray-100 p-4 dark:bg-gray-900/30">
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
          <Button onClick={() => addNode("output")} variant="outline" className="justify-start">
            <Volume2 className="mr-2 h-4 w-4" /> Output
          </Button>

          <div className="mt-2">
            <ExamplePatches onCreatePatch={createExamplePatch} />
          </div>
        </div>

        <div className="flex-1 bg-background" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgesDelete={onEdgesDelete}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[20, 20]}
            // className="dark:bg-background"
            colorMode="dark"
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} className="dark:bg-background" />
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}
