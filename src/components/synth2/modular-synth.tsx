"use client"

import { Button } from "@/components/ui/button"
import { Background, BackgroundVariant, Controls, MiniMap, type NodeTypes, ReactFlow } from "@xyflow/react"
import { Keyboard, Plus, AudioWaveformIcon as Waveform } from "lucide-react"
import { useShallow } from "zustand/react/shallow"
import { useStore } from "./audio-store"
import { AmplifierNode } from "./nodes/amplifier"
import { FilterNode } from "./nodes/filter"
import { OscillatorNode } from "./nodes/oscillator"
import { OutputNode } from "./nodes/output"
import "@xyflow/react/dist/style.css"

const nodeTypes: NodeTypes = {
  oscillator: OscillatorNode,
  filter: FilterNode,
  amplifier: AmplifierNode,
  // lfo: LFONode,
  // midi: MidiKeyboardNode,
  output: OutputNode,
}

export default function ModularSynth() {
  const store = useStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      onNodesChange: state.onNodesChange,
      onNodesDelete: state.onNodesDelete,
      onEdgesChange: state.onEdgesChange,
      onEdgesDelete: state.onEdgesDelete,
      addEdge: state.addEdge,
      addNode: state.createNode,
    })),
  )

  return (
    <div className="flex h-screen w-full flex-col">
      <div className="flex items-center justify-between border-b bg-neutral-50 p-4 dark:bg-neutral-900/50">
        <h1 className="font-bold text-xl">Modular Synthesizer</h1>
      </div>

      <div className="flex flex-1">
        <div className="flex w-64 flex-col gap-2 bg-neutral-100 p-4 dark:bg-neutral-900/30">
          <h2 className="mb-2 font-medium">Add Module</h2>
          <Button onClick={() => store.addNode("oscillator")} variant="outline" className="justify-start">
            <Waveform className="mr-2 h-4 w-4" /> VCO
          </Button>
          <Button onClick={() => store.addNode("filter")} variant="outline" className="justify-start">
            <Plus className="mr-2 h-4 w-4" /> VCF
          </Button>
          <Button onClick={() => store.addNode("amplifier")} variant="outline" className="justify-start">
            <Plus className="mr-2 h-4 w-4" /> VCA
          </Button>
          <Button onClick={() => store.addNode("lfo")} variant="outline" className="justify-start">
            <Waveform className="mr-2 h-4 w-4" /> LFO
          </Button>
          <Button onClick={() => store.addNode("midi")} variant="outline" className="justify-start">
            <Keyboard className="mr-2 h-4 w-4" /> MIDI
          </Button>
        </div>

        <div className="flex-1">
          <ReactFlow
            nodes={store.nodes}
            edges={store.edges}
            onNodesChange={store.onNodesChange}
            suppressHydrationWarning
            onEdgesChange={store.onEdgesChange}
            onConnect={store.addEdge}
            onEdgesDelete={store.onEdgesDelete}
            nodeTypes={nodeTypes}
            fitView
            // snapToGrid
            // snapGrid={[20, 20]}
            colorMode="system"
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
