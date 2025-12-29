import { useTheme, type Appearance, type BaseColor, type PrimaryColor } from '@/components/ThemeProvider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette } from 'lucide-react'

export function AppearanceSettings() {
  const { config, setConfig } = useTheme()

  const updateConfig = (key: keyof typeof config, value: string) => {
    setConfig({ ...config, [key]: value })
  }

  return (
    <Card className="shadow-sm border-border/50 bg-muted/2 rounded-(--radius)">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md">
            <Palette className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-semibold">Theme & Appearance</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Customize the visual style of the application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Theme Mode</Label>
            <Select 
              value={config.appearance} 
              onValueChange={(v) => updateConfig('appearance', v as Appearance)}
            >
              <SelectTrigger className="h-9 text-xs rounded-(--radius)">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='rounded-(--radius)'>
                <SelectItem value="light" className="text-xs rounded-(--radius)">Light</SelectItem>
                <SelectItem value="dark" className="text-xs rounded-(--radius)">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Base Color</Label>
            <Select 
              value={config.baseColor} 
              onValueChange={(v) => updateConfig('baseColor', v as BaseColor)}
            >
              <SelectTrigger className="h-9 text-xs rounded-(--radius)">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='rounded-(--radius)'>
                <SelectItem value="zinc" className="text-xs rounded-(--radius)">Zinc</SelectItem>
                <SelectItem value="slate" className="text-xs rounded-(--radius)">Slate</SelectItem>
                <SelectItem value="stone" className="text-xs rounded-(--radius)">Stone</SelectItem>
                <SelectItem value="gray" className="text-xs rounded-(--radius)">Gray</SelectItem>
                <SelectItem value="neutral" className="text-xs rounded-(--radius)">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Accent Color</Label>
            <Select 
              value={config.primaryColor} 
              onValueChange={(v) => updateConfig('primaryColor', v as PrimaryColor)}
            >
              <SelectTrigger className="h-9 text-xs rounded-(--radius)">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='rounded-(--radius)'>
                <SelectItem value="blue" className="text-xs rounded-(--radius)">Blue</SelectItem>
                <SelectItem value="rose" className="text-xs rounded-(--radius)">Rose</SelectItem>
                <SelectItem value="green" className="text-xs rounded-(--radius)">Green</SelectItem>
                <SelectItem value="orange" className="text-xs rounded-(--radius)">Orange</SelectItem>
                <SelectItem value="violet" className="text-xs rounded-(--radius)">Violet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}