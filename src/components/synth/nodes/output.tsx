import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Handle, Position } from "@xyflow/react"
import { Volume2 } from "lucide-react"

export function OutputNode() {
  return (
    <Card className="w-32">
      <CardHeader className="bg-red-100 dark:bg-red-900/30">
        <CardTitle className="font-medium text-sm">Output</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-center pt-2">
          <Volume2 className="size-6" />
        </div>
        <div className="mt-4 text-center text-sm">
          <p>Audio Output</p>
        </div>

        {/* Audio input handle */}
        <Handle type="target" position={Position.Left} id="input" className="h-2 w-2 bg-red-500" />
      </CardContent>
    </Card>
  )
}
