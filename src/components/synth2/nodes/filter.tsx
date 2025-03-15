import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Handle, type Node, type NodeProps, Position } from "@xyflow/react"
import type { FilterData } from "../audio"
import { useStore } from "../audio-store"
import { audioHandleStyle, cvHandleStyle } from "./utils"

type CustomNode = Node<FilterData>

export function FilterNode({ id, data }: NodeProps<CustomNode>) {
  const updateNode = useStore((s) => s.updateNode)

  return (
    <Card className="w-64 ">
      <CardHeader className=" bg-blue-100 dark:bg-blue-900/30">
        <CardTitle className="font-medium text-sm">VCF (Filter)</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Input handle */}
        <Handle type="target" position={Position.Left} id="input" style={audioHandleStyle} />

        {/* Output handle */}
        <Handle type="source" position={Position.Right} id="output" style={audioHandleStyle} />

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-xs">Filter Type</p>
            </div>
            <Select defaultValue={data.type} onValueChange={(value) => updateNode(id, { type: value as BiquadFilterType })}>
              <SelectTrigger className="w-full">
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
              onValueChange={([value]) => updateNode(id, { frequency: value })}
            />
            {/* CV input for cutoff frequency */}
            <Handle type="target" position={Position.Left} id="freq-cv" style={{ left: -16, top: 26, ...cvHandleStyle }} />
          </div>

          <div className="relative space-y-2">
            <div className="flex justify-between">
              <p className="text-xs">Resonance (Q)</p>
              <span className="text-xs">{(data.q as number).toFixed(1)}</span>
            </div>
            <Slider
              value={[data.q as number]}
              min={0.1}
              max={20}
              step={0.1}
              onValueChange={([value]) => updateNode(id, { q: value })}
            />
            {/* CV input for resonance */}
            <Handle type="target" position={Position.Left} id="q-cv" style={{ left: -16, top: 26, ...cvHandleStyle }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
