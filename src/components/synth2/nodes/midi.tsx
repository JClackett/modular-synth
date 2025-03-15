import type { Node, NodeProps } from "@xyflow/react"
import { useCallback, useEffect } from "react"
import { audioEngine } from "../audio-engine"
import { MidiKeyboard } from "../midi-keyboard"

interface NodeData {
  updateNodeData: (id: string, data: any) => void
  [key: string]: any
}

type CustomNode = Node<NodeData>

export function MidiKeyboardNode({ id, data }: NodeProps<CustomNode>) {
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
