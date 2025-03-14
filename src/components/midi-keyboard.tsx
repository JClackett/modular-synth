"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Slider } from "@/src/components/ui/slider"
import { useCallback, useEffect, useRef, useState } from "react"
import { Handle, Position } from "reactflow"

// Define the mapping of keyboard keys to MIDI notes
const KEY_TO_NOTE: Record<string, number> = {
  // Lower row (Z-M) - C3 to B3
  z: 60, // C3
  s: 61, // C#3
  x: 62, // D3
  d: 63, // D#3
  c: 64, // E3
  v: 65, // F3
  g: 66, // F#3
  b: 67, // G3
  h: 68, // G#3
  n: 69, // A3
  j: 70, // A#3
  m: 71, // B3

  // Upper row (Q-P) - C4 to B4
  q: 72, // C4
  2: 73, // C#4
  w: 74, // D4
  3: 75, // D#4
  e: 76, // E4
  r: 77, // F4
  5: 78, // F#4
  t: 79, // G4
  6: 80, // G#4
  y: 81, // A4
  7: 82, // A#4
  u: 83, // B4
  i: 84, // C5
}

// Define the white keys for visualization
const WHITE_KEYS = ["z", "x", "c", "v", "b", "n", "m", "q", "w", "e", "r", "t", "y", "u", "i"]

interface MidiKeyboardProps {
  id: string
  data: {
    updateNodeData: (id: string, data: any) => void
    octave?: number
    waveform?: OscillatorType
    attack?: number
    release?: number
    activeNotes?: Record<number, boolean>
    onNoteOn?: (note: number) => void
    onNoteOff?: (note: number) => void
  }
}

export default function MidiKeyboard({ id, data }: MidiKeyboardProps) {
  const { updateNodeData, onNoteOn, onNoteOff } = data
  const waveform = data.waveform || "sine"
  const attack = data.attack || 0.05
  const release = data.release || 0.1

  // Track active notes - but keep this state local and avoid unnecessary updates to parent
  const [activeNotes, setActiveNotes] = useState<Record<number, boolean>>({})

  // Use ref to avoid recreating event handlers on every render
  const handlersRef = useRef({
    onNoteOn,
    onNoteOff,
  })

  // Update ref when handlers change
  useEffect(() => {
    handlersRef.current = {
      onNoteOn,
      onNoteOff,
    }
  }, [onNoteOn, onNoteOff])

  // Handle key down event
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase()

    // Check if this key is mapped to a note
    if (KEY_TO_NOTE[key] && !e.repeat) {
      const note = KEY_TO_NOTE[key]

      // Update active notes
      setActiveNotes((prev) => {
        if (!prev[note]) {
          // Notify parent about note on - use the ref to avoid dependency on the function prop
          if (handlersRef.current.onNoteOn) {
            handlersRef.current.onNoteOn(note)
          }
          return { ...prev, [note]: true }
        }
        return prev
      })
    }
  }, [])

  // Handle key up event
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase()

    // Check if this key is mapped to a note
    if (KEY_TO_NOTE[key]) {
      const note = KEY_TO_NOTE[key]

      // Update active notes
      setActiveNotes((prev) => {
        if (prev[note]) {
          // Notify parent about note off - use the ref to avoid dependency on the function prop
          if (handlersRef.current.onNoteOff) {
            handlersRef.current.onNoteOff(note)
          }

          const newActiveNotes = { ...prev }
          delete newActiveNotes[note]
          return newActiveNotes
        }
        return prev
      })
    }
  }, [])

  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  // Update parameters - but NOT the active notes
  const updateParameter = (param: string, value: any) => {
    updateNodeData(id, { [param]: value })
  }

  // Render the keyboard
  const renderKeyboard = () => {
    return (
      <div className="relative mt-4 h-32">
        {/* White keys */}
        <div className="flex h-full">
          {WHITE_KEYS.map((key) => {
            const note = KEY_TO_NOTE[key]
            const isActive = activeNotes[note] || false

            return (
              <div
                key={key}
                className={`flex flex-1 items-end justify-center rounded-b border border-gray-300 pb-2 ${
                  isActive ? "bg-blue-200" : "bg-white"
                }`}
              >
                <span className="text-gray-500 text-xs uppercase">{key}</span>
              </div>
            )
          })}
        </div>

        {/* Black keys */}
        <div className="absolute top-0 left-0 flex w-full">
          {/* First octave */}
          <div className="invisible flex-1" /> {/* C */}
          <div className={`-ml-4 relative z-10 h-20 w-8 rounded-b ${activeNotes[KEY_TO_NOTE.s] ? "bg-blue-400" : "bg-gray-800"}`}>
            <span className="-translate-x-1/2 absolute bottom-2 left-1/2 transform text-white text-xs">s</span>
          </div>
          <div className="invisible flex-1" /> {/* D */}
          <div className={`-ml-4 relative z-10 h-20 w-8 rounded-b ${activeNotes[KEY_TO_NOTE.d] ? "bg-blue-400" : "bg-gray-800"}`}>
            <span className="-translate-x-1/2 absolute bottom-2 left-1/2 transform text-white text-xs">d</span>
          </div>
          <div className="invisible flex-1" /> {/* E - no black key */}
          <div className="invisible flex-1" /> {/* F */}
          <div className={`-ml-4 relative z-10 h-20 w-8 rounded-b ${activeNotes[KEY_TO_NOTE.g] ? "bg-blue-400" : "bg-gray-800"}`}>
            <span className="-translate-x-1/2 absolute bottom-2 left-1/2 transform text-white text-xs">g</span>
          </div>
          <div className="invisible flex-1" /> {/* G */}
          <div className={`-ml-4 relative z-10 h-20 w-8 rounded-b ${activeNotes[KEY_TO_NOTE.h] ? "bg-blue-400" : "bg-gray-800"}`}>
            <span className="-translate-x-1/2 absolute bottom-2 left-1/2 transform text-white text-xs">h</span>
          </div>
          <div className="invisible flex-1" /> {/* A */}
          <div className={`-ml-4 relative z-10 h-20 w-8 rounded-b ${activeNotes[KEY_TO_NOTE.j] ? "bg-blue-400" : "bg-gray-800"}`}>
            <span className="-translate-x-1/2 absolute bottom-2 left-1/2 transform text-white text-xs">j</span>
          </div>
          <div className="invisible flex-1" /> {/* B - no black key */}
          {/* Second octave */}
          <div className="invisible flex-1" /> {/* C */}
          <div
            className={`-ml-4 relative z-10 h-20 w-8 rounded-b ${activeNotes[KEY_TO_NOTE["2"]] ? "bg-blue-400" : "bg-gray-800"}`}
          >
            <span className="-translate-x-1/2 absolute bottom-2 left-1/2 transform text-white text-xs">2</span>
          </div>
          <div className="invisible flex-1" /> {/* D */}
          <div
            className={`-ml-4 relative z-10 h-20 w-8 rounded-b ${activeNotes[KEY_TO_NOTE["3"]] ? "bg-blue-400" : "bg-gray-800"}`}
          >
            <span className="-translate-x-1/2 absolute bottom-2 left-1/2 transform text-white text-xs">3</span>
          </div>
          <div className="invisible flex-1" /> {/* E - no black key */}
          <div className="invisible flex-1" /> {/* F */}
          <div
            className={`-ml-4 relative z-10 h-20 w-8 rounded-b ${activeNotes[KEY_TO_NOTE["5"]] ? "bg-blue-400" : "bg-gray-800"}`}
          >
            <span className="-translate-x-1/2 absolute bottom-2 left-1/2 transform text-white text-xs">5</span>
          </div>
          <div className="invisible flex-1" /> {/* G */}
          <div
            className={`-ml-4 relative z-10 h-20 w-8 rounded-b ${activeNotes[KEY_TO_NOTE["6"]] ? "bg-blue-400" : "bg-gray-800"}`}
          >
            <span className="-translate-x-1/2 absolute bottom-2 left-1/2 transform text-white text-xs">6</span>
          </div>
          <div className="invisible flex-1" /> {/* A */}
          <div
            className={`-ml-4 relative z-10 h-20 w-8 rounded-b ${activeNotes[KEY_TO_NOTE["7"]] ? "bg-blue-400" : "bg-gray-800"}`}
          >
            <span className="-translate-x-1/2 absolute bottom-2 left-1/2 transform text-white text-xs">7</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-96 shadow-md">
      <CardHeader className="bg-indigo-100 py-2">
        <CardTitle className="font-medium text-sm">MIDI Keyboard</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="waveform-select" className="text-xs">
                Waveform
              </label>
            </div>
            <Select value={waveform} onValueChange={(value) => updateParameter("waveform", value)}>
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

          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="attack-slider" className="text-xs">
                Attack (s)
              </label>
              <span className="text-xs">{attack.toFixed(2)}</span>
            </div>
            <Slider
              id="attack-slider"
              value={[attack]}
              min={0.01}
              max={1}
              step={0.01}
              onValueChange={([value]) => updateParameter("attack", value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="release-slider" className="text-xs">
                Release (s)
              </label>
              <span className="text-xs">{release.toFixed(2)}</span>
            </div>
            <Slider
              id="release-slider"
              value={[release]}
              min={0.01}
              max={2}
              step={0.01}
              onValueChange={([value]) => updateParameter("release", value)}
            />
          </div>

          {renderKeyboard()}

          <div className="mt-2 text-gray-500 text-xs">
            <p>Press keys to play notes (Z-M: lower octave, Q-I: upper octave)</p>
            <p>Black keys: S, D, G, H, J, 2, 3, 5, 6, 7</p>
          </div>
        </div>

        {/* Output handle */}
        <Handle type="source" position={Position.Right} id="output" className="h-2 w-2 bg-indigo-500" />
      </CardContent>
    </Card>
  )
}
