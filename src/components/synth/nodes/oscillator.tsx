import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Handle, type Node, type NodeProps, Position } from "@xyflow/react"

interface NodeData {
  updateNodeData: (id: string, data: any) => void
  [key: string]: any
}

type CustomNode = Node<NodeData>

// Custom node components
export function OscillatorNode({ id, data }: NodeProps<CustomNode>) {
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
