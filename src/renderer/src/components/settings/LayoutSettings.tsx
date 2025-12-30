import { useTheme, type Font, type Radius } from '@/components/ThemeProvider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Type, LayoutTemplate } from 'lucide-react'

export function LayoutSettings() {
  const { config, setConfig } = useTheme()

  const updateConfig = (key: keyof typeof config, value: string) => {
    setConfig({ ...config, [key]: value })
  }

  return (
    <Card className="shadow-sm border-border/50 bg-muted/2 rounded-(--radius)">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md">
            <LayoutTemplate className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-semibold">Interface & Layout</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Adjust the typography and spacing of the UI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Type className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-xs font-medium text-muted-foreground">Font Family</Label>
            </div>
            <Select 
              value={config.font} 
              onValueChange={(v) => updateConfig('font', v as Font)}
            >
              <SelectTrigger className="h-9 text-xs rounded-(--radius)">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start" className='rounded-(--radius)'>
                <SelectItem value="sans" className="text-xs rounded-(--radius)">Inter (Sans)</SelectItem>
                <SelectItem value="mono" className="text-xs rounded-(--radius)">JetBrains (Mono)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Corner Radius</Label>
            <Select 
              value={config.radius} 
              onValueChange={(v) => updateConfig('radius', v as Radius)}
            >
              <SelectTrigger className="h-9 text-xs rounded-(--radius)">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start" className='rounded-(--radius)'>
                <SelectItem value="0" className="text-xs rounded-(--radius)">0px</SelectItem>
                <SelectItem value="0.3" className="text-xs rounded-(--radius)">0.3rem</SelectItem>
                <SelectItem value="0.5" className="text-xs rounded-(--radius)">0.5rem</SelectItem>
                <SelectItem value="0.75" className="text-xs rounded-(--radius)">0.75rem</SelectItem>
                <SelectItem value="1.0" className="text-xs rounded-(--radius)">1.0rem</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}