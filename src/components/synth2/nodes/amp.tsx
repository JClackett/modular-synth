import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Handle, type Node, type NodeProps, Position } from "@xyflow/react"
import type { AmpData } from "../audio"
import { useStore } from "../audio-store"
import { audioHandleStyle, cvHandleStyle } from "./utils"

type CustomNode = Node<AmpData>

export function AmplifierNode({ id, data }: NodeProps<CustomNode>) {
  const updateNode = useStore((s) => s.updateNode)

  return (
    <Card className="w-64">
      <CardHeader className="bg-green-100 dark:bg-green-900/30">
        <CardTitle className="font-medium text-sm">VCA (Amplifier)</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Input handle */}
        <Handle type="target" position={Position.Left} id="input" style={audioHandleStyle} />

        {/* Output handle */}
        <Handle type="source" position={Position.Right} id="output" style={audioHandleStyle} />

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
              onValueChange={([value]) => updateNode(id, { gain: value })}
            />
            {/* CV input for gain */}
            <Handle type="target" position={Position.Left} id="gain-cv" style={{ left: -16, top: 26, ...cvHandleStyle }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
