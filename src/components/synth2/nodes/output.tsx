import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Handle, Position } from "@xyflow/react"
import { Volume2Icon, VolumeXIcon } from "lucide-react"
import { useStore } from "../audio-store"
import { audioHandleStyle } from "./utils"

export function OutputNode() {
  const toggleAudio = useStore((s) => s.toggleAudio)
  const isRunning = useStore((s) => s.isRunning)

  return (
    <Card className="w-32">
      <CardHeader className="bg-red-100 dark:bg-red-900/30">
        <CardTitle className="font-medium text-sm">Output</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center p-4">
        <button type="button" className="flex justify-center pt-2" onClick={toggleAudio}>
          {isRunning ? <Volume2Icon className="size-6" /> : <VolumeXIcon className="size-6" />}
        </button>
        <div className="mt-4 text-center text-sm">
          <p>Audio Output</p>
        </div>

        {/* Audio input handle */}
        <Handle type="target" position={Position.Left} id="input" style={audioHandleStyle} />
      </CardContent>
    </Card>
  )
}
