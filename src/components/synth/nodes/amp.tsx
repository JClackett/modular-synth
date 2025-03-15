import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Handle, type Node, type NodeProps, Position } from "@xyflow/react"

interface NodeData {
  updateNodeData: (id: string, data: any) => void
  [key: string]: any
}

type CustomNode = Node<NodeData>

export function AmplifierNode({ id, data }: NodeProps<CustomNode>) {
  const updateNodeData = data.updateNodeData

  return (
    <Card className="w-64">
      <CardHeader className="bg-green-100 dark:bg-green-900/30">
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
