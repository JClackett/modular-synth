import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Handle, type Node, type NodeProps, Position } from "@xyflow/react"

interface NodeData {
  updateNodeData: (id: string, data: any) => void
  [key: string]: any
}

type CustomNode = Node<NodeData>

export function FilterNode({ id, data }: NodeProps<CustomNode>) {
  const updateNodeData = data.updateNodeData

  return (
    <Card className="w-64 ">
      <CardHeader className=" bg-blue-100 dark:bg-blue-900/30">
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
