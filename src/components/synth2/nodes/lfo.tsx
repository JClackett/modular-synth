import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Handle, type Node, type NodeProps, Position } from "@xyflow/react"

interface NodeData {
  updateNodeData: (id: string, data: any) => void
  [key: string]: any
}

type CustomNode = Node<NodeData>

export function LFONode({ id, data }: NodeProps<CustomNode>) {
  const updateNodeData = data.updateNodeData

  return (
    <Card className="w-64">
      <CardHeader className="bg-purple-100 dark:bg-purple-900/30">
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
