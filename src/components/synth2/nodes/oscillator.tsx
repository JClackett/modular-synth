import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Handle, type Node, type NodeProps, Position } from "@xyflow/react"
import type { OscData } from "../audio"
import { useStore } from "../audio-store"
import { audioHandleStyle, cvHandleStyle } from "./utils"

type CustomNode = Node<OscData>

export function OscillatorNode({ id, data }: NodeProps<CustomNode>) {
  const updateNode = useStore((s) => s.updateNode)

  return (
    <Card className="w-64">
      <CardHeader className="bg-orange-100 dark:bg-orange-900/30">
        <CardTitle className="font-medium text-sm">VCO (Oscillator)</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs">Waveform</p>

            <Select
              defaultValue={data.type as string}
              onValueChange={(value) => updateNode(id, { type: value as OscillatorType })}
            >
              <SelectTrigger className="w-full">
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
              onValueChange={([value]) => updateNode(id, { frequency: value })}
            />
            {/* CV input for frequency */}
            <Handle type="target" position={Position.Left} id="freq-cv" style={{ left: -16, top: 26, ...cvHandleStyle }} />
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
              onValueChange={([value]) => updateNode(id, { detune: value })}
            />
            {/* CV input for detune */}
            <Handle type="target" position={Position.Left} id="detune-cv" style={{ left: -16, top: 26, ...cvHandleStyle }} />
          </div>
        </div>

        {/* Output handle */}
        <Handle type="source" position={Position.Right} id="output" style={audioHandleStyle} />
      </CardContent>
    </Card>
  )
}
